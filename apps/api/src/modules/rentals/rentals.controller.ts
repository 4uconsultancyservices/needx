import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RentalsService } from './rentals.service';

@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: { orderId: string; startDate?: string; endDate?: string }) {
    return this.rentalsService.createForOrder(user.id, body.orderId, body);
  }

  @Get('order/:orderId')
  byOrder(@Param('orderId') orderId: string) {
    return this.rentalsService.findByOrderIdOrThrow(orderId);
  }

  @Patch('order/:orderId/return')
  markReturned(@CurrentUser() user: AuthenticatedUser, @Param('orderId') orderId: string, @Body('notes') notes?: string) {
    return this.rentalsService.markReturned(user.id, orderId, notes);
  }

  @Patch('order/:orderId/inspect')
  inspect(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId') orderId: string,
    @Body() body: { passed: boolean; notes?: string; damageFee?: number },
  ) {
    return this.rentalsService.inspect(user.id, orderId, body);
  }

  @Patch('order/:orderId/release-deposit')
  releaseDeposit(@CurrentUser() user: AuthenticatedUser, @Param('orderId') orderId: string) {
    return this.rentalsService.releaseDeposit(user.id, orderId);
  }
}
