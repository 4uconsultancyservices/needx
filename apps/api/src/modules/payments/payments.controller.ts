import { Body, Controller, Get, Headers, Param, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  async checkout(@CurrentUser() user: AuthenticatedUser, @Body('orderId') orderId: string) {
    return this.paymentsService.createCheckout(user.id, orderId);
  }

  /**
   * Signed webhook — the ONLY thing that ever marks a payment successful.
   * The frontend's "Simulate Success" click never touches order/payment
   * state directly; it just triggers this same endpoint a real gateway
   * would call, so client-reported success is never trusted (per spec §22).
   */
  @Public()
  @Post('webhook')
  async webhook(@Req() req: Request & { rawBody?: Buffer }, @Headers('x-needx-signature') signature: string) {
    const raw = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
    return this.paymentsService.handleWebhook(raw, signature ?? '');
  }

  @Get('order/:orderId')
  async forOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.listForOrder(orderId);
  }
}
