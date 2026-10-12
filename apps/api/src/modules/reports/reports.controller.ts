import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, UsePipes } from '@nestjs/common';
import { createReportSchema, type CreateReportInput } from '@needx/validation';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createReportSchema))
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateReportInput) {
    return this.reportsService.createUserReport(user.id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
  @Get()
  list(@Query('page') page = '1', @Query('limit') limit = '20', @Query('status') status?: string) {
    return this.reportsService.listForAdmin(Number(page), Number(limit), status);
  }

  @UseGuards(RolesGuard)
  @Roles('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
  @Patch(':id/resolve')
  resolve(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body('note') note?: string) {
    return this.reportsService.resolve(id, user.id, 'RESOLVED', note);
  }

  @UseGuards(RolesGuard)
  @Roles('MODERATOR', 'ADMIN', 'SUPER_ADMIN')
  @Patch(':id/reject')
  reject(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body('note') note?: string) {
    return this.reportsService.resolve(id, user.id, 'REJECTED', note);
  }
}
