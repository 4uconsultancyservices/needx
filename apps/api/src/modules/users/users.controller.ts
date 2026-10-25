import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UsePipes } from '@nestjs/common';
import {
  becomeProviderSchema,
  createAddressSchema,
  updateProfileSchema,
  adminUpdateCustomerProfileSchema,
  updateCustomerPreferencesSchema,
  type BecomeProviderInput,
  type CreateAddressInput,
  type UpdateProfileInput,
  type AdminUpdateCustomerProfileInput,
  type UpdateCustomerPreferencesInput,
} from '@needx/validation';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { UsersService } from './users.service';
import { CustomerProfileService } from './customer-profile.service';
import { toPrivateUser, toPublicUser } from './users.mapper';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly customerProfileService: CustomerProfileService,
  ) {}

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

  @Get('me/customer-profile')
  async myCustomerProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.customerProfileService.getOrCreateForUser(user.id);
  }

  @Patch('me/customer-profile')
  @UsePipes(new ZodValidationPipe(updateCustomerPreferencesSchema))
  async updateMyCustomerProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateCustomerPreferencesInput,
  ) {
    return this.customerProfileService.updatePreferences(user.id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN', 'STAFF', 'MODERATOR')
  @Get(':id/customer-profile')
  async customerProfileForAdmin(@Param('id') id: string) {
    return this.customerProfileService.getOrCreateForUser(id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id/customer-profile')
  @UsePipes(new ZodValidationPipe(adminUpdateCustomerProfileSchema))
  async updateCustomerProfileForAdmin(
    @Param('id') id: string,
    @Body() dto: AdminUpdateCustomerProfileInput,
  ) {
    return this.customerProfileService.adminUpdate(id, dto);
  }

  @Public()
  @Get('public/providers')
  async publicProviders(
    @Query('page') page = '1',
    @Query('limit') limit = '12',
    @Query('q') q?: string,
    @Query('city') city?: string,
    @Query('category') category?: string,
    @Query('minRating') minRating?: string,
    @Query('verifiedOnly') verifiedOnly?: string,
    @Query('sort') sort?: 'rating' | 'newest' | 'transactions',
  ) {
    const { items, total } = await this.usersService.listPublicProviders({
      page: Number(page),
      limit: Number(limit),
      q,
      city,
      category,
      minRating: minRating ? Number(minRating) : undefined,
      verifiedOnly: verifiedOnly === 'true',
      sort,
    });
    return {
      data: items.map(toPublicUser),
      meta: { total, page: Number(page), limit: Number(limit) },
    };
  }

  @Public()
  @Get(':id')
  async publicProfile(@Param('id') id: string) {
    const doc = await this.usersService.findByIdOrThrow(id);
    return toPublicUser(doc);
  }
}
