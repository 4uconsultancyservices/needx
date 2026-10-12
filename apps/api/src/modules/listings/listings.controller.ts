import { Body, Controller, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import {
  createListingSchema,
  listingSearchQuerySchema,
  updateListingSchema,
  type CreateListingInput,
  type UpdateListingInput,
} from '@needx/validation';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { MatchingService } from '../matching/matching.service';
import { ListingsService } from './listings.service';
import { toListingWire } from './listings.mapper';

@Controller('listings')
export class ListingsController {
  constructor(
    private readonly listingsService: ListingsService,
    private readonly matchingService: MatchingService,
  ) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createListingSchema))
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateListingInput) {
    const listing = await this.listingsService.create(user.id, dto);
    return toListingWire(listing);
  }

  @Get('mine')
  async mine(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    const { items, total } = await this.listingsService.listForProvider(user.id, Number(page), Number(limit), status);
    return { data: items.map(toListingWire), meta: { total, page: Number(page), limit: Number(limit), hasMore: Number(page) * Number(limit) < total } };
  }

  @Public()
  @Get()
  @UsePipes(new ZodValidationPipe(listingSearchQuerySchema))
  async search(@Query() query: ReturnType<typeof listingSearchQuerySchema.parse>) {
    const { items, total } = await this.listingsService.search(query);
    return {
      data: items.map(toListingWire),
      meta: { total, page: query.page, limit: query.limit, hasMore: query.page * query.limit < total },
    };
  }

  @Public()
  @Get(':id')
  async byId(@Param('id') id: string) {
    const listing = await this.listingsService.findByIdOrThrow(id);
    void this.listingsService.incrementView(id);
    return toListingWire(listing);
  }

  @Public()
  @Get(':id/matching-needs')
  async matchingNeeds(@Param('id') id: string) {
    return this.matchingService.matchNeedsForListing(id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateListingSchema))
  async update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateListingInput) {
    const listing = await this.listingsService.update(user.id, id, dto);
    return toListingWire(listing);
  }

  @Patch(':id/pause')
  async pause(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const listing = await this.listingsService.setStatus(user.id, id, 'PAUSED');
    return toListingWire(listing);
  }

  @Patch(':id/activate')
  async activate(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const listing = await this.listingsService.setStatus(user.id, id, 'ACTIVE');
    return toListingWire(listing);
  }

  @Patch(':id/archive')
  async archive(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const listing = await this.listingsService.setStatus(user.id, id, 'ARCHIVED');
    return toListingWire(listing);
  }
}
