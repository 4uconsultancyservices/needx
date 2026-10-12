import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes } from '@nestjs/common';
import {
  becomeProviderSchema,
  createAddressSchema,
  updateProfileSchema,
  type BecomeProviderInput,
  type CreateAddressInput,
  type UpdateProfileInput,
} from '@needx/validation';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { UsersService } from './users.service';
import { toPrivateUser, toPublicUser } from './users.mapper';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser) {
    const doc = await this.usersService.findByIdOrThrow(user.id);
    return toPrivateUser(doc);
  }

  @Patch('me')
  @UsePipes(new ZodValidationPipe(updateProfileSchema))
  async updateMe(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateProfileInput) {
    const doc = await this.usersService.updateProfile(user.id, dto);
    return toPrivateUser(doc);
  }

  @Post('me/provider')
  @UsePipes(new ZodValidationPipe(becomeProviderSchema))
  async becomeProvider(@CurrentUser() user: AuthenticatedUser, @Body() dto: BecomeProviderInput) {
    const doc = await this.usersService.becomeProvider(user.id, dto);
    return toPrivateUser(doc);
  }

  @Get('me/addresses')
  async myAddresses(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.listAddresses(user.id);
  }

  @Post('me/addresses')
  @UsePipes(new ZodValidationPipe(createAddressSchema))
  async addAddress(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateAddressInput) {
    return this.usersService.createAddress(user.id, dto);
  }

  @Delete('me/addresses/:id')
  async removeAddress(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    await this.usersService.deleteAddress(user.id, id);
    return { deleted: true };
  }

  @Public()
  @Get(':id')
  async publicProfile(@Param('id') id: string) {
    const doc = await this.usersService.findByIdOrThrow(id);
    return toPublicUser(doc);
  }
}
