import { Mid } from '../../utils/commonIterface';
import ArticleModel from '../article/model';
import { CategorySegregation } from '../categorySegregation/interface';
import CategorySegregationModel from '../categorySegregation/model';
import RecipeModel from '../recipe/model';
import { Category } from './interface';
import CategoryModel from './model';
import CategoryValidate from './validate';

class CategoryControl {
  public async create(body: Category): Promise<Category> {
    await CategoryValidate.create(body);
    const category: Category = await CategoryModel.create(body);
    await CategorySegregationModel.create(category);
    return category;
  }

  public async getById(id: Mid): Promise<CategorySegregation> {
    await CategoryValidate.checkId({ id });
    return CategorySegregationModel.getById(id);
  }

  public async delete(id: Mid): Promise<Category> {
    await CategoryValidate.checkId({ _id: id });
    await RecipeModel.deleteAllByCategoryId(id);
    await ArticleModel.deleteAllByCategoryId(id);
    const category: Category = await CategoryModel.delete(id);
    await CategorySegregationModel.delete(id);
    return category;
  }

  public async getAllCategories(): Promise<Category[]> {
    return CategoryModel.getAll();
  }

  public async update(_id: Mid, body: Category ): Promise<Category> {
    await CategoryValidate.checkId({ _id } );
    await CategoryValidate.update(body);
    await CategoryValidate.possibleChangeParent(_id, body.parentCategoryId);
    const category = await CategoryModel.update(_id, body);
    await CategorySegregationModel.update(_id, body);
    return category;
  }
}

export default new CategoryControl();
