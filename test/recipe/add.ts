import chai from 'chai';
import chaiHttp from 'chai-http';
import { Category } from '../../src/entities/category/interface';
import { Recipe } from '../../src/entities/recipe/interface';

chai.use(chaiHttp);
const expect = chai.expect;

describe('Add recipe', () => {
  let category: Category;
  let addRecipe: Recipe;
  before(async (): Promise<void> => {
    const data: Category = {
      name: 'TestCategory',
      parentCategoryId: null,
    };

    const model = await require('../../src/entities/category/model').default;
    category = await model.create(data);

    category._id = category._id.toString();
  });

  after(async (): Promise<void> => {
    const categoryModel = await require('../../src/entities/category/model').default;
    const recipeModel = await require('../../src/entities/recipe/model').default;

    await recipeModel.model.deleteOne({ _id: addRecipe._id });
    await categoryModel.model.deleteOne({ _id: category._id });
  });

  describe('Adding recipe', () => {
    it('it should add recipe',  async () => {
      const recipe: Recipe = {
        categoryId: category._id,
        description: 'rewrew',
        title: 'wewer',
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .post('/v1/recipe')
        .send(recipe);
      addRecipe = res.body;

      const { title, description, categoryId }: Recipe = addRecipe;

      expect(title).to.equal(recipe.title);
      expect(description).to.equal(recipe.description);
      expect(categoryId).to.equal(category._id);
    });
  });

  describe('add recipe failed', () => {
    it('it add recipe without title',  async () => {
      const recipe = {
        categoryId: category._id,
        description: 'rewrew',
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .post('/v1/recipe')
        .send(recipe);

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('The title field is required.');
    });

    it('it add recipe without description',  async () => {
      const recipe = {
        categoryId: category._id,
        title: 'wewer',
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .post('/v1/recipe')
        .send(recipe);

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('The description field is required.');
    });

    it('it add recipe without categoryId',  async () => {
      const recipe = {
        description: 'rewrew',
        title: 'wewer',
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .post('/v1/recipe')
        .send(recipe);
      const { status, body: [{ message }] , body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('The categoryId field is required.');
    });

    it('it adding recipe with an incorrect categoryId',  async () => {
      const recipe = {
        categoryId: '6130dfe75436a11e872603c',
        description: 'rewrew',
        title: 'wewer',
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .post('/v1/recipe')
        .send(recipe);

      const { status, body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(2);
      expect(body[0].message).to.equal(`Cast to ObjectId failed for value "${recipe.categoryId}" (type string) at path "_id" `);
      expect(body[1].message).to.equal('CategoryId not exist');
    });
  });

});
