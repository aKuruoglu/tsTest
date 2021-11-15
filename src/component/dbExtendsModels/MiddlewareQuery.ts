import { Query } from 'mongoose';
import { Mid } from '../../utils/commonIterface';
import ModelQuery from './ModelQuery';

class MiddlewareQuery<T> extends ModelQuery<T> {
  constructor(model) {
    super(model);
    this.model = model;
  }
  public getCountByCategory(_id: Mid): Query<any, Promise<number>> {
     return this.model.count({
       categoryId: _id,
       isDeleted: false,
     });
  }
  public deleteAllByCategoryId( _id: Mid ) {
    return this.model.updateMany( { categoryId: _id }, { isDeleted: true } );
  }


  public getByCategory( categoryId: Mid, page: number = 0, limit: number ): Query<any, Document[]> {
    const skip = page * limit;
    return this.model.find( {
        categoryId,
        isDeleted: false,
      },
      {
        isDeleted: 0,
      },
      {
        limit,
        skip,
      },
    );
  }

  public updateCategory( categoryId: Mid, _id: Mid  ) {
    return this.model.findOneAndUpdate( {
        _id,
        isDeleted: false,
      },
      {
        categoryId,
      },
      {
        fields: {
          isDeleted: 0,
        },
        returnOriginal: false,
      } ).lean();
  }
}

export default MiddlewareQuery;
