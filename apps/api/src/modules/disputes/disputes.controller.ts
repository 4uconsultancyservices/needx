import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, UsePipes } from '@nestjs/common';
import { createDisputeSchema, resolveDisputeSchema, type CreateDisputeInput } from '@needx/validation';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { DisputesService } from './disputes.service';

@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createDisputeSchema))
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateDisputeInput) {
    return this.disputesService.create(user.id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR')
  @Get()
  list(@Query('page') page = '1', @Query('limit') limit = '20', @Query('status') status?: string) {
    return this.disputesService.listForAdmin(Number(page), Number(limit), status);
  }

  @Get(':id')
  byId(@Param('id') id: string) {
    return this.disputesService.findByIdOrThrow(id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id/resolve')
  @UsePipes(new ZodValidationPipe(resolveDisputeSchema))
  resolve(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: { status: 'RESOLVED_BUYER' | 'RESOLVED_PROVIDER' | 'RESOLVED_SPLIT' | 'CLOSED'; resolutionNote: string },
  ) {
    return this.disputesService.resolve(id, user.id, dto.status, dto.resolutionNote);
  }
}
