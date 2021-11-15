import { Mid } from '../../utils/commonIterface';

export interface CategoryId {
  _id?: Mid;
}

export interface CategorySegregation extends CategoryId {
  name: string;
  parentCategoryId: Mid;
  isDeleted?: boolean;
  articleCount: number;
  recipeCount: number;
}
