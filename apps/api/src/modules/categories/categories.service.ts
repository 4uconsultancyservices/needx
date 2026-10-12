import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { CreateCategoryInput, UpdateCategoryInput } from '@needx/validation';
import { AppException } from '../../common/errors/app.exception';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private readonly model: Model<Category>) {}

  async listActive(): Promise<CategoryDocument[]> {
    return this.model.find({ isActive: true }).sort({ sortOrder: 1, name: 1 }).exec();
  }

  async listAll(): Promise<CategoryDocument[]> {
    return this.model.find().sort({ sortOrder: 1, name: 1 }).exec();
  }

  async findBySlugOrThrow(slug: string): Promise<CategoryDocument> {
    const category = await this.model.findOne({ slug }).exec();
    if (!category) throw AppException.notFound('Category');
    return category;
  }

  async findByIdOrThrow(id: string): Promise<CategoryDocument> {
    const category = await this.model.findById(id).exec();
    if (!category) throw AppException.notFound('Category');
    return category;
  }

  /** Used by the need-parser and matching engine — keyword -> category inference. */
  async findAllForMatching(): Promise<CategoryDocument[]> {
    return this.model.find({ isActive: true }).select('name slug keywords attributes').exec();
  }

  async create(dto: CreateCategoryInput) {
    const existing = await this.model.findOne({ slug: dto.slug }).exec();
    if (existing) throw AppException.conflict('A category with this slug already exists', 'SLUG_TAKEN');
    return this.model.create(dto);
  }

  async update(id: string, dto: UpdateCategoryInput) {
    const category = await this.findByIdOrThrow(id);
    Object.assign(category, dto);
    await category.save();
    return category;
  }

  async setActive(id: string, isActive: boolean) {
    const category = await this.findByIdOrThrow(id);
    category.isActive = isActive;
    await category.save();
    return category;
  }
}
