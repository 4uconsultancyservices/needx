import type { BaseEntity } from './common';

export type CategoryAttributeType = 'TEXT' | 'NUMBER' | 'SELECT' | 'MULTISELECT' | 'BOOLEAN';

export interface CategoryAttributeDef {
  key: string; // e.g. "brand"
  label: string; // e.g. "Brand"
  type: CategoryAttributeType;
  required?: boolean;
  options?: string[]; // for SELECT / MULTISELECT
  unit?: string;
}

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  parentId?: string | null;
  /** Keywords used by the lightweight need-parser to infer this category from free text. */
  keywords: string[];
  attributes: CategoryAttributeDef[];
  isActive: boolean;
  sortOrder: number;
}
