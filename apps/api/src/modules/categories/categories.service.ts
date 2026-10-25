import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    return this.model.create({
      ...dto,
      parentId: dto.parentId ? new Types.ObjectId(dto.parentId) : null,
    });
  }

  async update(id: string, dto: UpdateCategoryInput) {
    const category = await this.findByIdOrThrow(id);
    const updatePayload: Record<string, any> = { ...dto };
    if ('parentId' in dto) {
      updatePayload.parentId = dto.parentId ? new Types.ObjectId(dto.parentId) : null;
    }
    Object.assign(category, updatePayload);
    await category.save();
    return category;
  }

  async setActive(id: string, isActive: boolean) {
    const category = await this.findByIdOrThrow(id);
    category.isActive = isActive;
    await category.save();
    return category;
  }

  async bulkSetStatus(ids: string[], isActive: boolean) {
    const objectIds = ids.map((id) => new Types.ObjectId(id));
    const result = await this.model.updateMany(
      { _id: { $in: objectIds } },
      { $set: { isActive } },
    ).exec();
    return { modifiedCount: result.modifiedCount };
  }

  async deleteCategory(id: string) {
    const category = await this.findByIdOrThrow(id);
    const db = this.model.db;
    const catObjectId = new Types.ObjectId(id);
    const needsCount = await db.collection('needs').countDocuments({ categoryId: catObjectId });
    const listingsCount = await db.collection('listings').countDocuments({ categoryId: catObjectId });
    if (needsCount > 0 || listingsCount > 0) {
      category.isActive = false;
      await category.save();
      return { action: 'DEACTIVATED', message: 'Category has associated needs/inventory and was deactivated instead of deleted.' };
    }
    await this.model.deleteOne({ _id: category._id }).exec();
    return { action: 'DELETED', message: 'Category removed successfully.' };
  }

  /** Aggregated overview of all categories with demand vs inventory metrics and market opportunity ratio */
  async getAdminOverview() {
    const categories = await this.model.find().sort({ sortOrder: 1, name: 1 }).lean().exec();
    const db = this.model.db;

    // Aggregate needs count and active needs by category
    const needsAgg = await db.collection('needs').aggregate([
      {
        $group: {
          _id: '$categoryId',
          totalNeeds: { $sum: 1 },
          activeNeeds: {
            $sum: {
              $cond: [{ $in: ['$status', ['PENDING', 'MATCHED']] }, 1, 0],
            },
          },
          avgBudgetMax: { $avg: '$budget.max' },
        },
      },
    ]).toArray();

    // Aggregate listings count and active listings by category
    const listingsAgg = await db.collection('listings').aggregate([
      {
        $group: {
          _id: '$categoryId',
          totalListings: { $sum: 1 },
          activeListings: {
            $sum: {
              $cond: [{ $eq: ['$status', 'ACTIVE'] }, 1, 0],
            },
          },
          providers: { $addToSet: '$providerId' },
          avgPrice: { $avg: '$basePrice' },
        },
      },
    ]).toArray();

    const needsMap = new Map<string, { totalNeeds: number; activeNeeds: number; avgBudgetMax: number }>();
    for (const n of needsAgg) {
      if (n._id) {
        needsMap.set(String(n._id), {
          totalNeeds: n.totalNeeds || 0,
          activeNeeds: n.activeNeeds || 0,
          avgBudgetMax: Math.round(n.avgBudgetMax || 0),
        });
      }
    }

    const listingsMap = new Map<string, { totalListings: number; activeListings: number; providerCount: number; avgPrice: number }>();
    for (const l of listingsAgg) {
      if (l._id) {
        listingsMap.set(String(l._id), {
          totalListings: l.totalListings || 0,
          activeListings: l.activeListings || 0,
          providerCount: l.providers?.length || 0,
          avgPrice: Math.round(l.avgPrice || 0),
        });
      }
    }

    // Lookup table for parent categories
    const catLookup = new Map<string, { id: string; name: string; slug: string }>();
    for (const c of categories) {
      catLookup.set(String(c._id), {
        id: String(c._id),
        name: c.name,
        slug: c.slug,
      });
    }

    // Subcategory child counts
    const subCountMap = new Map<string, number>();
    for (const c of categories) {
      if (c.parentId) {
        const pId = String(c.parentId);
        subCountMap.set(pId, (subCountMap.get(pId) || 0) + 1);
      }
    }

    return categories.map((c) => {
      const id = String(c._id);
      const nStats = needsMap.get(id) || { totalNeeds: 0, activeNeeds: 0, avgBudgetMax: 0 };
      const lStats = listingsMap.get(id) || { totalListings: 0, activeListings: 0, providerCount: 0, avgPrice: 0 };

      // Market health opportunity calculation
      let marketHealth: 'UNDER_SUPPLIED' | 'HIGH_DEMAND' | 'BALANCED' | 'OVER_SUPPLIED' | 'UNTESTED' = 'UNTESTED';
      if (nStats.totalNeeds >= 3 && lStats.totalListings <= 1) {
        marketHealth = 'UNDER_SUPPLIED';
      } else if (nStats.totalNeeds >= 3 && lStats.totalListings >= 2) {
        marketHealth = 'HIGH_DEMAND';
      } else if (lStats.totalListings >= 4 && nStats.totalNeeds <= 1) {
        marketHealth = 'OVER_SUPPLIED';
      } else if (nStats.totalNeeds > 0 || lStats.totalListings > 0) {
        marketHealth = 'BALANCED';
      }

      const parent = c.parentId ? catLookup.get(String(c.parentId)) : null;

      return {
        id,
        name: c.name,
        slug: c.slug,
        icon: c.icon || 'folder',
        description: c.description || '',
        parentId: c.parentId ? String(c.parentId) : null,
        parentCategory: parent,
        keywords: c.keywords || [],
        attributes: c.attributes || [],
        isActive: Boolean(c.isActive),
        sortOrder: c.sortOrder ?? 0,
        createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString(),
        demandsCount: nStats.totalNeeds,
        activeDemandsCount: nStats.activeNeeds,
        avgDemandBudget: nStats.avgBudgetMax,
        inventoryCount: lStats.totalListings,
        activeInventoryCount: lStats.activeListings,
        providerCount: lStats.providerCount,
        avgListingPrice: lStats.avgPrice,
        subcategoriesCount: subCountMap.get(id) || 0,
        marketHealth,
      };
    });
  }

  /** Detailed 360-degree category inspector */
  async getCategoryExplorer(id: string) {
    const category = await this.model.findById(id).lean().exec();
    if (!category) throw AppException.notFound('Category');

    const db = this.model.db;
    const catObjectId = new Types.ObjectId(id);

    // Fetch parent category if any
    let parentCategory = null;
    if (category.parentId) {
      const p = await this.model.findById(category.parentId).select('name slug icon').lean().exec();
      if (p) {
        parentCategory = { id: String(p._id), name: p.name, slug: p.slug, icon: p.icon };
      }
    }

    // Fetch child subcategories
    const subcategories = await this.model.find({ parentId: category._id }).select('name slug icon isActive sortOrder').lean().exec();

    // Fetch recent needs in this category
    const recentNeedsRaw = await db.collection('needs')
      .find({ categoryId: catObjectId })
      .sort({ createdAt: -1 })
      .limit(15)
      .toArray();

    // Fetch user info for needs
    const userIds = [...new Set(recentNeedsRaw.map((n) => n.userId).filter(Boolean))];
    const usersRaw = await db.collection('users')
      .find({ _id: { $in: userIds } })
      .project({ name: 1, email: 1, avatarUrl: 1, city: 1 })
      .toArray();
    const userMap = new Map(usersRaw.map((u) => [String(u._id), u]));

    const recentNeeds = recentNeedsRaw.map((n) => {
      const u = n.userId ? userMap.get(String(n.userId)) : null;
      return {
        id: String(n._id),
        title: n.title,
        status: n.status,
        budget: n.budget,
        location: n.location,
        createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : undefined,
        user: u ? { name: u.name, email: u.email, city: u.city } : null,
      };
    });

    // Fetch recent listings in this category
    const recentListingsRaw = await db.collection('listings')
      .find({ categoryId: catObjectId })
      .sort({ createdAt: -1 })
      .limit(15)
      .toArray();

    const providerIds = [...new Set(recentListingsRaw.map((l) => l.providerId).filter(Boolean))];
    const providersRaw = await db.collection('users')
      .find({ _id: { $in: providerIds } })
      .project({ name: 1, email: 1, avatarUrl: 1, city: 1, provider: 1, trust: 1 })
      .toArray();
    const providerMap = new Map(providersRaw.map((p) => [String(p._id), p]));

    const recentListings = recentListingsRaw.map((l) => {
      const p = l.providerId ? providerMap.get(String(l.providerId)) : null;
      return {
        id: String(l._id),
        title: l.title,
        basePrice: l.basePrice,
        pricingMode: l.pricingMode,
        status: l.status,
        ratingAverage: l.ratingAverage ?? 5.0,
        createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : undefined,
        provider: p ? {
          name: p.name,
          businessName: p.provider?.businessName,
          ratingAverage: p.trust?.ratingAverage ?? 5.0,
          city: p.city,
        } : null,
      };
    });

    // Demand & inventory totals
    const totalNeeds = await db.collection('needs').countDocuments({ categoryId: catObjectId });
    const activeNeeds = await db.collection('needs').countDocuments({ categoryId: catObjectId, status: { $in: ['PENDING', 'MATCHED'] } });
    const totalListings = await db.collection('listings').countDocuments({ categoryId: catObjectId });
    const activeListings = await db.collection('listings').countDocuments({ categoryId: catObjectId, status: 'ACTIVE' });

    let marketHealth: 'UNDER_SUPPLIED' | 'HIGH_DEMAND' | 'BALANCED' | 'OVER_SUPPLIED' | 'UNTESTED' = 'UNTESTED';
    if (totalNeeds >= 3 && totalListings <= 1) {
      marketHealth = 'UNDER_SUPPLIED';
    } else if (totalNeeds >= 3 && totalListings >= 2) {
      marketHealth = 'HIGH_DEMAND';
    } else if (totalListings >= 4 && totalNeeds <= 1) {
      marketHealth = 'OVER_SUPPLIED';
    } else if (totalNeeds > 0 || totalListings > 0) {
      marketHealth = 'BALANCED';
    }

    return {
      category: {
        id: String(category._id),
        name: category.name,
        slug: category.slug,
        icon: category.icon || 'folder',
        description: category.description || '',
        parentId: category.parentId ? String(category.parentId) : null,
        keywords: category.keywords || [],
        attributes: category.attributes || [],
        isActive: Boolean(category.isActive),
        sortOrder: category.sortOrder ?? 0,
        createdAt: category.createdAt ? new Date(category.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: category.updatedAt ? new Date(category.updatedAt).toISOString() : new Date().toISOString(),
      },
      parentCategory,
      subcategories: subcategories.map((s) => ({
        id: String(s._id),
        name: s.name,
        slug: s.slug,
        icon: s.icon,
        isActive: s.isActive,
      })),
      stats: {
        totalNeeds,
        activeNeeds,
        totalListings,
        activeListings,
        providerCount: providerIds.length,
        marketHealth,
      },
      recentNeeds,
      recentListings,
    };
  }
}
