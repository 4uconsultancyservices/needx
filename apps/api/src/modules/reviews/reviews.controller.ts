import { Body, Controller, Get, Param, Post, Query, UsePipes } from '@nestjs/common';
import { createReviewSchema, type CreateReviewInput } from '@needx/validation';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createReviewSchema))
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateReviewInput) {
    return this.reviewsService.create(user.id, dto);
  }

  @Public()
  @Get('for-user/:userId')
  forUser(@Param('userId') userId: string, @Query('page') page = '1', @Query('limit') limit = '20') {
    return this.reviewsService.listForUser(userId, Number(page), Number(limit));
  }

  @Get('for-order/:orderId')
  forOrder(@Param('orderId') orderId: string) {
    return this.reviewsService.listForOrder(orderId);
  }
}
