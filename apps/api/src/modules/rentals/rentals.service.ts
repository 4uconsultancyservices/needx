import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { differenceInCalendarDays } from 'date-fns';
import { AppException } from '../../common/errors/app.exception';
import { OrdersService } from '../orders/orders.service';
import { NeedsService } from '../needs/needs.service';
import { LedgerService } from '../ledger/ledger.service';
import { Rental, RentalDocument } from './schemas/rental.schema';

@Injectable()
export class RentalsService {
  constructor(
    @InjectModel(Rental.name) private readonly rentalModel: Model<Rental>,
    private readonly ordersService: OrdersService,
    private readonly needsService: NeedsService,
    private readonly ledgerService: LedgerService,
  ) {}

  async createForOrder(actorId: string, orderId: string, dto?: { startDate?: string; endDate?: string }): Promise<RentalDocument> {
    const order = await this.ordersService.findByIdOrThrow(orderId);
    if (order.type !== 'RENT') throw AppException.invalidState('Only RENT orders have a rental record');
    if (order.buyerId.toString() !== actorId && order.providerId.toString() !== actorId) {
      throw AppException.forbidden('You are not part of this order');
    }

    const existing = await this.rentalModel.findOne({ orderId: order.id }).exec();
    if (existing) return existing;

    let start = dto?.startDate ? new Date(dto.startDate) : undefined;
    let end = dto?.endDate ? new Date(dto.endDate) : undefined;

    if ((!start || !end) && order.needId) {
      const need = await this.needsService.findByIdOrThrow(order.needId.toString());
      start = start ?? (need.dateRange?.start ? new Date(need.dateRange.start) : new Date());
      end = end ?? (need.dateRange?.end ? new Date(need.dateRange.end) : addDays(new Date(), 1));
    }
    start = start ?? new Date();
    end = end ?? addDays(start, 1);

    return this.rentalModel.create({
      orderId: order.id,
      startDate: start,
      endDate: end,
      deposit: order.depositAmount ?? 0,
    });
  }

  async findByOrderIdOrThrow(orderId: string): Promise<RentalDocument> {
    const rental = await this.rentalModel.findOne({ orderId }).exec();
    if (!rental) throw AppException.notFound('Rental');
    return rental;
  }

  async markReturned(actorId: string, orderId: string, notes?: string): Promise<RentalDocument> {
    const order = await this.ordersService.findByIdOrThrow(orderId);
    if (order.providerId.toString() !== actorId) throw AppException.forbidden('Only the provider can confirm return');

    const rental = await this.findByOrderIdOrThrow(orderId);
    rental.returnedAt = new Date();
    if (notes) rental.inspectionNotes = notes;

    if (rental.lateFeePerDay && rental.returnedAt > rental.endDate) {
      const lateDays = differenceInCalendarDays(rental.returnedAt, rental.endDate);
      rental.damageFee = (rental.damageFee ?? 0) + lateDays * rental.lateFeePerDay;
    }
    await rental.save();
    return rental;
  }

  async inspect(actorId: string, orderId: string, dto: { passed: boolean; notes?: string; damageFee?: number }): Promise<RentalDocument> {
    const order = await this.ordersService.findByIdOrThrow(orderId);
    if (order.providerId.toString() !== actorId) throw AppException.forbidden('Only the provider can record an inspection');

    const rental = await this.findByOrderIdOrThrow(orderId);
    if (!rental.returnedAt) throw AppException.invalidState('Cannot inspect a rental before it has been returned');

    rental.inspectionPassed = dto.passed;
    rental.inspectionNotes = dto.notes ?? rental.inspectionNotes;
    if (dto.damageFee !== undefined) rental.damageFee = (rental.damageFee ?? 0) + dto.damageFee;
    await rental.save();
    return rental;
  }

  async releaseDeposit(actorId: string, orderId: string): Promise<RentalDocument> {
    const order = await this.ordersService.findByIdOrThrow(orderId);
    if (order.buyerId.toString() !== actorId && order.providerId.toString() !== actorId) {
      throw AppException.forbidden('You are not part of this order');
    }

    const rental = await this.findByOrderIdOrThrow(orderId);
    if (!rental.returnedAt) throw AppException.invalidState('Cannot release a deposit before the item is returned');
    if (rental.depositReleasedAt) return rental;

    const releaseAmount = Math.max(0, rental.deposit - (rental.damageFee ?? 0));
    if (releaseAmount > 0) {
      await this.ledgerService.recordDepositRelease({
        orderId,
        userId: order.buyerId.toString(),
        amount: releaseAmount,
        currency: order.currency,
      });
    }
    if (rental.damageFee) {
      await this.ledgerService.recordPenalty({
        orderId,
        userId: order.buyerId.toString(),
        amount: Math.min(rental.damageFee, rental.deposit),
        currency: order.currency,
        description: 'Deposit withheld for damage/late return',
      });
    }

    rental.depositReleasedAt = new Date();
    await rental.save();
    return rental;
  }
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}
