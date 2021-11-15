import chai from 'chai';
import chaiHttp from 'chai-http';
import { Category } from '../../src/entities/category/interface';
import { Recipe } from '../../src/entities/recipe/interface';

chai.use(chaiHttp);
const expect = chai.expect;

describe('Updating recipe', () => {
  let category: Category;
  let recipe: Recipe;

  before(async () => {
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
    recipe = await recipeModel.create(recipeObj);

    category._id = category._id.toString();
  });

  after(async () => {
    const categoryModel = await require('../../src/entities/category/model').default;
    const recipeModel = await require('../../src/entities/recipe/model').default;

    await categoryModel.model.deleteOne({ _id: category._id });
    await recipeModel.model.deleteOne({ _id: recipe._id });
  });

  describe('Update recipe success', () => {
    it('it should update recipe',  async () => {
      const toUpdateObj: Recipe = {
        ...recipe,
        title: '111',
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put(`/v1/recipe/${recipe._id}`)
        .send(toUpdateObj);

      const { title, description, categoryId, _id }: Recipe = res.body;

      expect(title).to.equal(toUpdateObj.title);
      expect(description).to.equal(toUpdateObj.description);
      expect(categoryId).to.equal(category._id);
      expect(_id).to.equal(toUpdateObj._id.toString());
    });
  });

  describe('update recipe failed', () => {
    it('it won\'t update recipe category with id which not ObjectId',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put('/v1/recipe/12');

      const { status, body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(2);
      expect(body[0].message).to.equal('Cast to ObjectId failed for value "12" (type string) at path "_id" ');
      expect(body[1].message).to.equal('Recipe not exist');
    });

    it('it won\'t update recipe category not found',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put('/v1/recipe/6137674024ced5b9481fef5e');

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('Recipe not exist');
    });

    it('it won\'t update recipe category not found',  async () => {
      const recipeModel = await require('../../src/entities/recipe/model').default;
      await recipeModel.delete(recipe._id);

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put(`/v1/recipe/${recipe._id}`);

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('Recipe not exist');
    });
  });
});
