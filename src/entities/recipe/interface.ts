import { Mid } from '../../utils/commonIterface';

export interface RecipeId {
  _id?: Mid;
}

export interface Recipe extends RecipeId {
  title: string;
  description: string;
  categoryId: Mid;
  isDeleted?: boolean;
}

export interface RecipeCount {
  entities: Recipe[];
  total: number;
}
