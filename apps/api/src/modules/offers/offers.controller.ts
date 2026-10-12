import { Body, Controller, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import { counterOfferSchema, createOfferSchema, type CounterOfferInput, type CreateOfferInput } from '@needx/validation';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { OffersService } from './offers.service';
import { toOfferWire } from './offers.mapper';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createOfferSchema))
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateOfferInput) {
    const offer = await this.offersService.create(user.id, dto);
    return toOfferWire(offer, await this.offersService.getHistory(offer.id));
  }

  @Get('mine')
  async mine(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    const { items, total } = await this.offersService.listForProvider(user.id, Number(page), Number(limit), status);
    return { data: items.map((o) => toOfferWire(o)), meta: { total, page: Number(page), limit: Number(limit), hasMore: Number(page) * Number(limit) < total } };
  }

  @Get('for-need/:needId')
  async forNeed(@Param('needId') needId: string) {
    const offers = await this.offersService.listForNeed(needId);
    return offers.map((o) => toOfferWire(o));
  }

  @Get(':id')
  async byId(@Param('id') id: string) {
    const offer = await this.offersService.findByIdOrThrow(id);
    return toOfferWire(offer, await this.offersService.getHistory(id));
  }

  @Patch(':id/view')
  async view(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const offer = await this.offersService.markViewed(id, user.id);
    return toOfferWire(offer);
  }

  @Patch(':id/counter')
  @UsePipes(new ZodValidationPipe(counterOfferSchema))
  async counter(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: CounterOfferInput) {
    const offer = await this.offersService.counter(id, user.id, dto);
    return toOfferWire(offer);
  }

  @Patch(':id/accept')
  async accept(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const offer = await this.offersService.accept(id, user.id);
    return toOfferWire(offer);
  }

  @Patch(':id/reject')
  async reject(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body('message') message?: string) {
    const offer = await this.offersService.reject(id, user.id, message);
    return toOfferWire(offer);
  }

  @Patch(':id/cancel')
  async cancel(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const offer = await this.offersService.cancel(id, user.id);
    return toOfferWire(offer);
  }
}
