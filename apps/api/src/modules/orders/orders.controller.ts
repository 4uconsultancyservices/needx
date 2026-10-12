import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { OrdersService } from './orders.service';
import { toOrderWire } from './orders.mapper';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@CurrentUser() user: AuthenticatedUser, @Body('offerId') offerId: string) {
    const order = await this.ordersService.createFromOffer(user.id, offerId);
    return toOrderWire(order);
  }

  @Get('mine')
  async mine(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    const { items, total } = await this.ordersService.listForBuyer(user.id, Number(page), Number(limit), status);
    return { data: items.map(toOrderWire), meta: { total, page: Number(page), limit: Number(limit), hasMore: Number(page) * Number(limit) < total } };
  }

  @Get('provider-mine')
  async providerMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    const { items, total } = await this.ordersService.listForProvider(user.id, Number(page), Number(limit), status);
    return { data: items.map(toOrderWire), meta: { total, page: Number(page), limit: Number(limit), hasMore: Number(page) * Number(limit) < total } };
  }

  @Get(':id')
  async byId(@Param('id') id: string) {
    const order = await this.ordersService.findByIdOrThrow(id);
    return toOrderWire(order);
  }

  @Patch(':id/confirm')
  async confirm(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return toOrderWire(await this.ordersService.confirm(id, user.id));
  }

  @Patch(':id/ready')
  async ready(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return toOrderWire(await this.ordersService.markReady(id, user.id));
  }

  @Patch(':id/start')
  async start(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return toOrderWire(await this.ordersService.start(id, user.id));
  }

  @Patch(':id/complete')
  async complete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return toOrderWire(await this.ordersService.complete(id, user.id));
  }

  @Patch(':id/cancel')
  async cancel(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body('reason') reason?: string) {
    return toOrderWire(await this.ordersService.cancel(id, user.id, reason));
  }
}
