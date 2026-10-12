import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { CreateReportInput } from '@needx/validation';
import type { ReportReason, ReportTargetType } from '@needx/types';
import { AppException } from '../../common/errors/app.exception';
import { Report, ReportDocument } from './schemas/report.schema';

@Injectable()
export class ReportsService {
  constructor(@InjectModel(Report.name) private readonly model: Model<Report>) {}

  async createUserReport(reporterId: string, dto: CreateReportInput): Promise<ReportDocument> {
    return this.model.create({ ...dto, reporterId, status: 'OPEN' });
  }

  /** Used by ModerationService callers (needs/listings creation) — no reporterId. */
  async createSystemReport(input: { targetType: ReportTargetType; targetId: string; reason: ReportReason; details: string }) {
    return this.model.create({ ...input, status: 'OPEN' });
  }

  async listForAdmin(page: number, limit: number, status?: string) {
    const filter = status ? { status } : {};
    const [items, total] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).exec(),
      this.model.countDocuments(filter).exec(),
    ]);
    return { items, total };
  }

  async resolve(id: string, adminId: string, status: 'RESOLVED' | 'REJECTED', note?: string) {
    const report = await this.model.findById(id).exec();
    if (!report) throw AppException.notFound('Report');
    report.status = status;
    report.resolvedById = adminId as unknown as Report['resolvedById'];
    report.resolvedAt = new Date();
    report.resolutionNote = note;
    await report.save();
    return report;
  }

  async countOpen(): Promise<number> {
    return this.model.countDocuments({ status: 'OPEN' }).exec();
  }
}
