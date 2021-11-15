import ErrorsHandler from '../../component/ErrorsHandler';
import validator from '../../component/Validator';
import { Mid } from '../../utils/commonIterface';
import CategoryModel from '../category/model';

class CategoryValidate {
  public category = {
    name: 'required|string',
    parentCategoryId: 'mongoId_valid|category_exist|string',
  };

  public updateSchema = {
    name: 'string',
    parentCategoryId: 'mongoId_valid|category_exist|string',
  };

  public idSchema = {
    _id: 'mongoId_valid|category_exist',
  };

  public checkId(id): Promise<void> {
    return validator(id, this.idSchema);
  }

  public create(body): Promise<void> {
    return validator(body, this.category);
  }

  public update(body): Promise<void> {
    return validator(body, this.updateSchema);
  }

  public async possibleChangeParent<T>(_id: T , parentCategoryId: Mid  ) {
    if ( !parentCategoryId ) {
      return;
    }

    const categories = await CategoryModel.getAll();
    const categoriesMap = new Map( categories.map( ( item ) => [String( item._id ), item] ) );
    let parent;
    let checkId = parentCategoryId;
    const currentId = String( _id );

    while ( checkId ) {
      if ( checkId === currentId ) {
        break;
      }

      parent = categoriesMap.get( checkId );
      checkId = parent.parentCategoryId ? parent.parentCategoryId.toString() : parent.parentCategoryId;
    }

    if ( checkId ) {
      const response = {
        field: 'parentCategoryId',
        message: 'Sorry you cannot change to the given parent category as it is a child category',
      };
      ErrorsHandler.throw( response, 400 );
    }
  }
}

export default new CategoryValidate();
