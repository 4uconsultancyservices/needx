import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { subDays, format } from 'date-fns';
import { User } from '../users/schemas/user.schema';
import { NeedsService } from '../needs/needs.service';
import { ListingsService } from '../listings/listings.service';
import { OrdersService } from '../orders/orders.service';
import { LedgerService } from '../ledger/ledger.service';
import { DisputesService } from '../disputes/disputes.service';
import { ReportsService } from '../reports/reports.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly needsService: NeedsService,
    private readonly listingsService: ListingsService,
    private readonly ordersService: OrdersService,
    private readonly ledgerService: LedgerService,
    private readonly disputesService: DisputesService,
    private readonly reportsService: ReportsService,
  ) {}

  async dashboardStats() {
    const [
      totalUsers,
      totalProviders,
      activeNeeds,
      fulfilledNeeds,
      totalNeeds,
      activeListings,
      completedOrders,
      cancelledOrders,
      totalOrders,
      gmv,
      platformRevenue,
      openDisputes,
      openReports,
    ] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.userModel.countDocuments({ 'provider.isProvider': true }).exec(),
      this.needsService.countByStatus('ACTIVE'),
      this.needsService.countByStatus('FULFILLED'),
      this.userModel.db.model('Need').countDocuments().exec(),
      this.listingsService.countActive(),
      this.ordersService.countByStatus('COMPLETED'),
      this.ordersService.countByStatus('CANCELLED'),
      this.userModel.db.model('Order').countDocuments().exec(),
      this.ordersService.gmvTotal(),
      this.ledgerService.platformRevenueTotal(),
      this.disputesService.countOpen(),
      this.reportsService.countOpen(),
    ]);

    return {
      totalUsers,
      totalProviders,
      activeNeeds,
      totalNeeds,
      activeListings,
      totalOrders,
      completedOrders,
      cancelledOrders,
      gmv,
      platformRevenue,
      openDisputes,
      openReports,
      needFulfillmentRate: totalNeeds > 0 ? Number((fulfilledNeeds / totalNeeds).toFixed(3)) : 0,
      cancellationRate: totalOrders > 0 ? Number((cancelledOrders / totalOrders).toFixed(3)) : 0,
      conversionRate: totalNeeds > 0 ? Number((totalOrders / totalNeeds).toFixed(3)) : 0,
    };
  }

  /** Simple per-day signup counts for the last N days — powers the admin chart. */
  async signupsPerDay(days = 14): Promise<Array<{ date: string; count: number }>> {
    const since = subDays(new Date(), days);
    const rows = await this.userModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const byDate = new Map(rows.map((r) => [r._id as string, r.count as number]));
    return Array.from({ length: days }, (_, i) => {
      const date = format(subDays(new Date(), days - 1 - i), 'yyyy-MM-dd');
      return { date, count: byDate.get(date) ?? 0 };
    });
  }
}
