import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import {
  createNeedSchema,
  needSearchQuerySchema,
  parseNeedInputSchema,
  updateNeedSchema,
  type CreateNeedInput,
  type ParseNeedInput,
  type UpdateNeedInput,
} from '@needx/validation';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { MatchingService } from '../matching/matching.service';
import { NeedsService } from './needs.service';
import { toNeedWire } from './needs.mapper';

@Controller('needs')
export class NeedsController {
  constructor(
    private readonly needsService: NeedsService,
    private readonly matchingService: MatchingService,
  ) {}

  @Post('parse')
  @UsePipes(new ZodValidationPipe(parseNeedInputSchema))
  async parse(@Body() dto: ParseNeedInput) {
    return this.needsService.parsePreview(dto);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createNeedSchema))
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateNeedInput) {
    const need = await this.needsService.create(user.id, dto);
    return toNeedWire(need);
  }

  @Get('mine')
  async mine(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    const { items, total } = await this.needsService.listForUser(user.id, Number(page), Number(limit), status);
    return { data: items.map(toNeedWire), meta: { total, page: Number(page), limit: Number(limit), hasMore: Number(page) * Number(limit) < total } };
  }

  @Public()
  @Get()
  @UsePipes(new ZodValidationPipe(needSearchQuerySchema))
  async search(@Query() query: ReturnType<typeof needSearchQuerySchema.parse>) {
    const { items, total } = await this.needsService.search(query);
    return {
      data: items.map(toNeedWire),
      meta: { total, page: query.page, limit: query.limit, hasMore: query.page * query.limit < total },
    };
  }

  @Public()
  @Get(':id')
  async byId(@Param('id') id: string) {
    const need = await this.needsService.findByIdOrThrow(id);
    return toNeedWire(need);
  }

  @Public()
  @Get(':id/matches')
  async matches(@Param('id') id: string) {
    const matches = await this.matchingService.matchListingsForNeed(id);
    await this.needsService.incrementMatchCount(id, matches.length);
    return matches;
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateNeedSchema))
  async update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateNeedInput) {
    const need = await this.needsService.update(user.id, id, dto);
    return toNeedWire(need);
  }

  @Delete(':id')
  async cancel(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const need = await this.needsService.cancel(user.id, id);
    return toNeedWire(need);
  }
}
