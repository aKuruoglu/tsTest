import { Query } from 'mongoose';
import MiddlewareQuery from '../../component/dbExtendsModels/MiddlewareQuery';
import db from '../../component/mongodb';
import { Mid } from '../../utils/commonIterface';
import { Recipe } from './interface';

class RecipeModel extends MiddlewareQuery<Recipe> {
    public create( { title, description, categoryId }: Recipe ): Promise<Recipe> {
        return super.create( { title, description, categoryId } );
    }

    public update( _id: Mid, { title, description }: Recipe ): Query<any, Promise<Recipe>> {
        return super.update( _id, { title, description } );
    }

}

export default new RecipeModel(db.collections.recipe);
