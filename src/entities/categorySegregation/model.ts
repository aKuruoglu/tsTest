import ModelQuery from '../../component/dbExtendsModels/ModelQuery';
import db from '../../component/mongodb';
import { Mid } from '../../utils/commonIterface';
import { Category } from '../category/interface';
import { CategorySegregation } from './interface';

class CategorySegregationModel extends ModelQuery<CategorySegregation> {
  public create({ _id, name, parentCategoryId }: Category): Promise<CategorySegregation> {
    return super.create({ _id, name, parentCategoryId });
  }

  public async delete(_id: Mid): Promise<CategorySegregation> {
    const { parentCategoryId } = await super.getById( _id );
    await this.model.updateMany( { parentCategoryId: _id }, { parentCategoryId } );
    return super.delete( _id );
  }

}

export default new CategorySegregationModel(db.collections.categorySegregation);
