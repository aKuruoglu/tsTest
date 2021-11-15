import {  model, Schema } from 'mongoose';
import { Category } from './interface';

export const schema = new Schema<Category>({
  isDeleted: { type: 'boolean', default: false },
  name: { type: String, required: true, index: true },
  parentCategoryId: {
    default: null,
    index: true,
    type: Schema.Types.ObjectId,
  },
}, {
  versionKey: false,
});

export default model<Category>('Category', schema);
