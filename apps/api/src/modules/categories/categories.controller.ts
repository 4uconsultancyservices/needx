import { Body, Controller, Get, Param, Patch, Post, UseGuards, UsePipes } from '@nestjs/common';
import { createCategorySchema, updateCategorySchema, type CreateCategoryInput, type UpdateCategoryInput } from '@needx/validation';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../guards/roles.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  list() {
    return this.categoriesService.listActive();
  }

  @Public()
  @Get(':slug')
  bySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlugOrThrow(slug);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post()
  @UsePipes(new ZodValidationPipe(createCategorySchema))
  create(@Body() dto: CreateCategoryInput) {
    return this.categoriesService.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateCategorySchema))
  update(@Param('id') id: string, @Body() dto: UpdateCategoryInput) {
    return this.categoriesService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string) {
    return this.categoriesService.setActive(id, false);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Patch(':id/activate')
  activate(@Param('id') id: string) {
    return this.categoriesService.setActive(id, true);
  }
}
