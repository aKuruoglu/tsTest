import {  model, Schema } from 'mongoose';
import { CategorySegregation } from './interface';

export const schema = new Schema<CategorySegregation>({
  _id: {
    type: Schema.Types.ObjectId,
  },
  articleCount: { type: Number, required: true, default: 0 },
  isDeleted: { type: 'boolean', default: false },
  name: { type: String, required: true, index: true },
  parentCategoryId: {
    default: null,
    index: true,
    type: Schema.Types.ObjectId,
  },
  recipeCount: { type: Number, required: true, default: 0 },
}, {
  versionKey: false,
});

export default model<CategorySegregation>('CategorySegregation', schema);
