import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import type { Role } from '@needx/types';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { NeedsService } from '../needs/needs.service';
import { ListingsService } from '../listings/listings.service';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';
import { toNeedWire } from '../needs/needs.mapper';
import { toListingWire } from '../listings/listings.mapper';
import { toOrderWire } from '../orders/orders.mapper';
import { toAdminUserWire, toPublicUser } from '../users/users.mapper';
import { AdminService } from './admin.service';

@UseGuards(RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly needsService: NeedsService,
    private readonly listingsService: ListingsService,
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
    private readonly auditLog: AuditLogService,
  ) {}

  @Get('dashboard')
  dashboard() {
    return this.adminService.dashboardStats();
  }

  @Get('dashboard/signups')
  signups(@Query('days') days = '14') {
    return this.adminService.signupsPerDay(Number(days));
  }

  @Get('users')
  async users(@Query('page') page = '1', @Query('limit') limit = '20', @Query('q') q?: string) {
    const { items, total } = await this.usersService.listForAdmin(Number(page), Number(limit), q);
    return { data: items.map(toAdminUserWire), meta: { total, page: Number(page), limit: Number(limit) } };
  }

  @Get('users/:id/dossier')
  async userDossier(@Param('id') id: string) {
    const user = await this.usersService.findByIdOrThrow(id);
    const [needs, listings, buyerOrders, providerOrders] = await Promise.all([
      this.needsService.listForUser(id, 1, 20),
      this.listingsService.listForProvider(id, 1, 20),
      this.ordersService.listForBuyer(id, 1, 20),
      this.ordersService.listForProvider(id, 1, 20),
    ]);

    return {
      user: toAdminUserWire(user),
      needs: needs.items.map(toNeedWire),
      listings: listings.items.map(toListingWire),
      buyerOrders: buyerOrders.items.map(toOrderWire),
      providerOrders: providerOrders.items.map(toOrderWire),
      stats: {
        totalNeeds: needs.total,
        totalListings: listings.total,
        totalBuyerOrders: buyerOrders.total,
        totalProviderOrders: providerOrders.total,
      },
    };
  }

  @Patch('users/:id/ban')
  async ban(@CurrentUser() admin: AuthenticatedUser, @Param('id') id: string, @Body('reason') reason?: string) {
    const user = await this.usersService.setBanned(id, true, reason);
    await this.auditLog.record({ actorId: admin.id, action: 'USER_BANNED', targetType: 'User', targetId: id, metadata: { reason } });
    return toAdminUserWire(user);
  }

  @Patch('users/:id/unban')
  async unban(@CurrentUser() admin: AuthenticatedUser, @Param('id') id: string) {
    const user = await this.usersService.setBanned(id, false);
    await this.auditLog.record({ actorId: admin.id, action: 'USER_UNBANNED', targetType: 'User', targetId: id });
    return toAdminUserWire(user);
  }

  @Patch('users/:id/roles')
  async setRoles(@CurrentUser() admin: AuthenticatedUser, @Param('id') id: string, @Body('roles') roles: Role[]) {
    const user = await this.usersService.setRoles(id, roles);
    await this.auditLog.record({ actorId: admin.id, action: 'ROLE_CHANGE', targetType: 'User', targetId: id, metadata: { roles } });
    return toAdminUserWire(user);
  }

  @Patch('users/:id/provider')
  async setProviderStatus(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id') id: string,
    @Body('isProvider') isProvider: boolean,
    @Body('businessName') businessName?: string,
    @Body('providerType') providerType?: any,
  ) {
    const user = await this.usersService.setProviderStatus(id, Boolean(isProvider), businessName, providerType);
    await this.auditLog.record({
      actorId: admin.id,
      action: isProvider ? 'PROVIDER_STATUS_GRANTED' : 'PROVIDER_STATUS_REVOKED',
      targetType: 'User',
      targetId: id,
      metadata: { isProvider, businessName, providerType },
    });
    return toAdminUserWire(user);
  }

  @Patch('users/:id/trust')
  async updateTrust(
    @CurrentUser() admin: AuthenticatedUser,
    @Param('id') id: string,
    @Body() flags: { phoneVerified?: boolean; emailVerified?: boolean; identityVerified?: boolean; businessVerified?: boolean },
  ) {
    const user = await this.usersService.findByIdOrThrow(id);
    if (!user.trust) {
      user.trust = {
        phoneVerified: false,
        emailVerified: false,
        identityVerified: false,
        businessVerified: false,
        completedTransactions: 0,
        ratingAverage: 5,
        ratingCount: 0,
        cancellationRate: 0,
        responseRate: 1,
      } as any;
    }
    if (flags.phoneVerified !== undefined) user.trust.phoneVerified = flags.phoneVerified;
    if (flags.emailVerified !== undefined) user.trust.emailVerified = flags.emailVerified;
    if (flags.identityVerified !== undefined) user.trust.identityVerified = flags.identityVerified;
    if (flags.businessVerified !== undefined) user.trust.businessVerified = flags.businessVerified;
    await user.save();
    await this.auditLog.record({
      actorId: admin.id,
      action: 'USER_TRUST_UPDATED',
      targetType: 'User',
      targetId: id,
      metadata: flags,
    });
    return toAdminUserWire(user);
  }

  @Get('needs')
  async needs(@Query('page') page = '1', @Query('limit') limit = '20') {
    const { items, total } = await this.needsService.listForAdmin(Number(page), Number(limit));
    return { data: items.map(toNeedWire), meta: { total, page: Number(page), limit: Number(limit) } };
  }

  @Get('listings')
  async listings(@Query('page') page = '1', @Query('limit') limit = '20') {
    const { items, total } = await this.listingsService.listForAdmin(Number(page), Number(limit));
    return { data: items.map(toListingWire), meta: { total, page: Number(page), limit: Number(limit) } };
  }

  @Patch('listings/:id/archive')
  async archiveListing(@CurrentUser() admin: AuthenticatedUser, @Param('id') id: string) {
    const listing = await this.listingsService.setStatus('', id, 'ARCHIVED', true);
    await this.auditLog.record({ actorId: admin.id, action: 'LISTING_MODERATED', targetType: 'Listing', targetId: id });
    return toListingWire(listing);
  }

  @Get('orders')
  async orders(@Query('page') page = '1', @Query('limit') limit = '20', @Query('status') status?: string) {
    const { items, total } = await this.ordersService.listForAdmin(Number(page), Number(limit), status);
    return { data: items.map(toOrderWire), meta: { total, page: Number(page), limit: Number(limit) } };
  }

  @Get('audit-log')
  auditLogList(@Query('page') page = '1', @Query('limit') limit = '20', @Query('action') action?: string) {
    return this.auditLog.list(Number(page), Number(limit), action);
  }
}
