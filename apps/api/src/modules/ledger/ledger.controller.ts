import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { LedgerService } from './ledger.service';

@Controller('ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get('me')
  async mine(@CurrentUser() user: AuthenticatedUser, @Query('page') page = '1', @Query('limit') limit = '20') {
    const { items, total } = await this.ledgerService.listForUser(user.id, Number(page), Number(limit));
    const balance = await this.ledgerService.balanceForUser(user.id);
    return { data: items, meta: { total, balance, page: Number(page), limit: Number(limit) } };
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('platform-revenue')
  async platformRevenue() {
    return { total: await this.ledgerService.platformRevenueTotal() };
  }
}
