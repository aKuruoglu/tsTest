import chai from 'chai';
import chaiHttp from 'chai-http';
import { Category } from '../../src/entities/category/interface';
import { Recipe } from '../../src/entities/recipe/interface';

chai.use(chaiHttp);
const expect = chai.expect;

describe('Updating recipe category', () => {
  let categoryFirst: Category;
  let categorySecond: Category;
  let categoryThird: Category;
  let recipe: Recipe;

  before(async (): Promise<void> => {
    const categoryObj: Category = {
      name: 'TestCategory',
      parentCategoryId: null,
    };

    const categoryModel = await require('../../src/entities/category/model').default;
    const recipeModel = await require('../../src/entities/recipe/model').default;

    categoryFirst = await categoryModel.create(categoryObj);
    categorySecond = await categoryModel.create(categoryObj);
    categoryThird = await categoryModel.create(categoryObj);

    const recipeObj: Recipe = {
      categoryId: categoryFirst._id,
      description: 'rewrew',
      title: 'wewer',
    };
    recipe = await recipeModel.create(recipeObj);

    categoryFirst._id = categoryFirst._id.toString();
    categorySecond._id = categorySecond._id.toString();
    categoryThird._id = categoryThird._id.toString();

    await categoryModel.delete(categoryThird._id);

    recipe._id = recipe._id.toString();
  });

  after(async (): Promise<void> => {
    const categoryModel = await require('../../src/entities/category/model').default;
    const recipeModel = await require('../../src/entities/recipe/model').default;

    await categoryModel.model.deleteOne({ _id: categoryFirst._id });
    await categoryModel.model.deleteOne({ _id: categorySecond._id });
    await categoryModel.model.deleteOne({ _id: categoryThird._id });
    await recipeModel.model.deleteOne({ _id: recipe._id });
  });

  describe('Update recipe category success', () => {
    it('it should update recipe category',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put(`/v1/recipe/${recipe._id}/change-category/${categorySecond._id}`);

      const { title, description, categoryId, _id }: Recipe = res.body;

      expect(title).to.equal(recipe.title);
      expect(description).to.equal(recipe.description);
      expect(categoryId).to.equal(categorySecond._id);
      expect(_id).to.equal(recipe._id);
    });
  });

  describe('update recipe category failed', () => {
    it('it won\'t update recipe with id which not ObjectId',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put(`/v1/recipe/12/change-category/${categorySecond._id}`);

      const { status, body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(2);
      expect(body[0].message).to.equal('Cast to ObjectId failed for value "12" (type string) at path "_id" ');
      expect(body[1].message).to.equal('Recipe not exist');
    });

    it('it won\'t update recipe  not found',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put(`/v1/recipe/6137674024ced5b9481fef5e/change-category/${categorySecond._id}`);
      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('Recipe not exist');
    });

    it('it won\'t update recipe category not found',  async () => {
      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put(`/v1/recipe/${recipe._id}/change-category/${categoryThird._id}`);

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('CategoryId not exist');
    });
  });
});
