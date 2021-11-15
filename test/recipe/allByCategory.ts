import chai from 'chai';
import chaiHttp from 'chai-http';
import { Category } from '../../src/entities/category/interface';
import { Recipe } from '../../src/entities/recipe/interface';

chai.use(chaiHttp);
const expect = chai.expect;

describe('Getting recipes by category', () => {
  let category: Category;
  let recipe1: Recipe;
  let recipe2: Recipe;
  let recipe3: Recipe;

  before(async (): Promise<void> => {
    const categoryObj: Category = {
      name: 'TestCategory',
      parentCategoryId: null,
    };

    const categoryModel = await require('../../src/entities/category/model').default;
    const recipeModel = await require('../../src/entities/recipe/model').default;

    category = await categoryModel.create(categoryObj);

    const recipeObj: Recipe = {
      categoryId: category._id,
      description: 'rewrew',
      title: 'wewer',
    };

    recipe1 = await recipeModel.create(recipeObj);
    recipe2 = await recipeModel.create(recipeObj);
    recipe3 = await recipeModel.create(recipeObj);

    category._id = category._id.toString();
    recipe1._id = recipe1._id.toString();
    recipe2._id = recipe2._id.toString();
    recipe3._id = recipe3._id.toString();

    await recipeModel.delete(recipe2._id);
    await recipeModel.delete(recipe3._id);
  });

  after(async (): Promise<void> => {
    const categoryModel = await require('../../src/entities/category/model').default;
    const recipeModel = await require('../../src/entities/recipe/model').default;

    await categoryModel.model.deleteOne({ _id: category._id });
    await recipeModel.model.deleteOne({ _id: recipe1._id });
    await recipeModel.model.deleteOne({ _id: recipe2._id });
    await recipeModel.model.deleteOne({ _id: recipe3._id });
  });

  describe('get recipes by category success', () => {
    it('it should return recipes by category',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get(`/v1/recipe/category/${category._id}/0/10`);
      const { entities, total } = res.body;

      expect(entities).to.have.lengthOf(1);
      expect(total).to.equal(1);
    });
  });

  describe('get recipe failed', () => {
    it('it get recipe with id which not ObjectId',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get('/v1/recipe/category/12/0/10');

      const { status, body } = res;
      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(2);
      expect(body[0].message).to.equal('Cast to ObjectId failed for value "12" (type string) at path "_id" ');
      expect(body[1].message).to.equal('CategoryId not exist');
    });

    it('it get recipe not found',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get('/v1/recipe/category/6137674024ced5b9481fef5e/0/10');

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('CategoryId not exist');
    });

    it('it won\'t return deleted recipes',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get('/v1/recipe/0/10');
      const { entities, total } = res.body;

      expect(entities).to.have.lengthOf(1);
      expect(total).to.equal(1);
    });

    it('it won\'t return recipes, page < 0',  async () => {

      const res = await chai.request('http://localhost:4000')
        .get('/v1/recipe/-1/10');

      const { body: [{ message }] } = res;

      expect(message).to.equal('Page cannot be less than 0');
    });

    it('it won\'t return recipes, limit < 1',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get('/v1/recipe/0/0');

      const { body: [{ message }] } = res;

      expect(message).to.equal('Limit cannot be less than 1');
    });
  });
});
