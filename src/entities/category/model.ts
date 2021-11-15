import ModelQuery from '../../component/dbExtendsModels/ModelQuery';
import db from '../../component/mongodb';
import { Mid } from '../../utils/commonIterface';
import { Category } from './interface';

class CategoryModel extends ModelQuery<Category> {
  public create(body: Category): Promise<Category> {
    return super.create(body);
  }

  public async delete(_id: Mid): Promise<Category> {
    const { parentCategoryId } = await super.getById( _id );
    await this.model.updateMany( { parentCategoryId: _id }, { parentCategoryId } );
    return super.delete( _id );
  }


}

export default new CategoryModel(db.collections.category);
