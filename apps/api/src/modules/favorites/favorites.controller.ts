import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { FavoritesService } from './favorites.service';
import type { FavoriteTargetType } from './schemas/favorite.schema';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser, @Query('type') type?: FavoriteTargetType) {
    return this.favoritesService.list(user.id, type);
  }

  @Post()
  add(@CurrentUser() user: AuthenticatedUser, @Body() body: { targetType: FavoriteTargetType; targetId: string }) {
    return this.favoritesService.add(user.id, body.targetType, body.targetId);
  }

  @Delete()
  async remove(@CurrentUser() user: AuthenticatedUser, @Body() body: { targetType: FavoriteTargetType; targetId: string }) {
    await this.favoritesService.remove(user.id, body.targetType, body.targetId);
    return { removed: true };
  }
}
