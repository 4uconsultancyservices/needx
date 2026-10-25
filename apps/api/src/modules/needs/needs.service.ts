import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { CreateNeedInput, ParseNeedInput, UpdateNeedInput } from '@needx/validation';
import type { NeedStatus, ParsedNeedPreview } from '@needx/types';
import { AppException } from '../../common/errors/app.exception';
import { NeedsParserService } from '../ai/needs-parser.service';
import { ModerationService } from '../ai/moderation.service';
import { ReportsService } from '../reports/reports.service';
import { Need, NeedDocument } from './schemas/need.schema';
import { canTransitionNeed } from './need-status.util';

@Injectable()
export class NeedsService {
  constructor(
    @InjectModel(Need.name) private readonly needModel: Model<Need>,
    private readonly parser: NeedsParserService,
    private readonly moderation: ModerationService,
    private readonly reportsService: ReportsService,
  ) {}

  async parsePreview(dto: ParseNeedInput): Promise<ParsedNeedPreview> {
    return this.parser.parse(dto.text);
  }

  async create(userId: string, dto: CreateNeedInput): Promise<NeedDocument> {
    const need = await this.needModel.create({
      userId,
      title: dto.title,
      description: dto.description,
      categoryId: dto.categoryId,
      modes: dto.modes,
      budget: dto.budget,
      quantity: dto.quantity,
      dateRange: dto.dateRange
        ? {
            start: dto.dateRange.start ? new Date(dto.dateRange.start) : undefined,
            end: dto.dateRange.end ? new Date(dto.dateRange.end) : undefined,
          }
        : undefined,
      location: dto.location,
      attributes: dto.attributes ?? {},
      status: 'ACTIVE',
      rawInput: dto.rawInput,
      parseSource: dto.parseSource,
    });

    const screen = this.moderation.screen(`${dto.title} ${dto.description}`);
    if (screen.flagged) {
      await this.reportsService.createSystemReport({
        targetType: 'NEED',
        targetId: need.id,
        reason: 'PROHIBITED',
        details: `Auto-flagged by keyword screen: ${screen.reasons.join(', ')}`,
      });
    }

    return need;
  }

  async findByIdOrThrow(id: string): Promise<NeedDocument> {
    if (!Types.ObjectId.isValid(id)) throw AppException.notFound('Need');
    const need = await this.needModel.findById(id).exec();
    if (!need) throw AppException.notFound('Need');
    return need;
  }

  async listForUser(userId: string, page: number, limit: number, status?: string) {
    const filter: Record<string, unknown> = { userId };
    if (status) filter.status = status;
    const [items, total] = await Promise.all([
      this.needModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.needModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  async search(params: { q?: string; categoryId?: string; city?: string; status?: string; page: number; limit: number }) {
    const filter: Record<string, unknown> = { status: params.status ?? 'ACTIVE' };
    if (params.categoryId) filter.categoryId = params.categoryId;
    if (params.city) filter['location.city'] = new RegExp(`^${escapeRegex(params.city)}$`, 'i');
    if (params.q) filter.$text = { $search: params.q };

    const [items, total] = await Promise.all([
      this.needModel
        .find(filter)
        .sort(params.q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
        .skip((params.page - 1) * params.limit)
        .limit(params.limit)
        .exec(),
      this.needModel.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  async update(userId: string, needId: string, dto: UpdateNeedInput, isAdmin = false): Promise<NeedDocument> {
    const need = await this.findByIdOrThrow(needId);
    if (!isAdmin && need.userId.toString() !== userId) {
      throw AppException.forbidden('You can only edit your own needs');
    }

    if (dto.status && dto.status !== need.status) {
      if (!canTransitionNeed(need.status, dto.status as NeedStatus)) {
        throw AppException.invalidState(`Cannot move a need from ${need.status} to ${dto.status}`);
      }
    }

    const { dateRange, ...rest } = dto;
    Object.assign(need, rest);
    if (dateRange) {
      need.dateRange = {
        start: dateRange.start ? new Date(dateRange.start) : undefined,
        end: dateRange.end ? new Date(dateRange.end) : undefined,
      };
    }
    await need.save();
    return need;
  }

  async cancel(userId: string, needId: string, isAdmin = false): Promise<NeedDocument> {
    return this.update(userId, needId, { status: 'CANCELLED' }, isAdmin);
  }

  async markFulfilled(needId: string): Promise<void> {
    const need = await this.findByIdOrThrow(needId);
    if (canTransitionNeed(need.status, 'FULFILLED')) {
      need.status = 'FULFILLED';
      await need.save();
    }
  }

  async incrementMatchCount(needId: string, count: number): Promise<void> {
    await this.needModel.updateOne({ _id: needId }, { $set: { matchCount: count } }).exec();
  }

  async listForAdmin(page: number, limit: number) {
    const [items, total] = await Promise.all([
      this.needModel.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.needModel.countDocuments().exec(),
    ]);
    return { items, total };
  }

  async countByStatus(status: NeedStatus): Promise<number> {
    return this.needModel.countDocuments({ status }).exec();
  }

  async sweepExpiredNeeds(): Promise<number> {
    const now = new Date();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await this.needModel
      .updateMany(
        {
          status: { $in: ['ACTIVE', 'MATCHING'] },
          $or: [
            { 'dateRange.end': { $lt: now } },
            {
              'dateRange.end': { $exists: false },
              createdAt: { $lt: thirtyDaysAgo },
            },
          ],
        },
        { $set: { status: 'EXPIRED' } },
      )
      .exec();

    return result.modifiedCount;
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
