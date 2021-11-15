import { Query } from 'mongoose';
import MiddlewareQuery from '../../component/dbExtendsModels/MiddlewareQuery';
import db from '../../component/mongodb';
import { Mid } from '../../utils/commonIterface';
import { Article } from './interface';

class ArticleModel extends MiddlewareQuery<Article> {
  public create( { title, description, categoryId, mainText }: Article ): Promise<Article> {
    return super.create( { title, description, categoryId, mainText } );
  }

  public update( _id: Mid, { title, description, mainText }: Article ): Query<any, Promise<Article>> {
    return super.update( _id, { title, description, mainText } );
  }

}

export default new ArticleModel(db.collections.article);
