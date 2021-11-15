import chai from 'chai';
import chaiHttp from 'chai-http';
import { Category } from '../../src/entities/category/interface';
import { Recipe } from '../../src/entities/recipe/interface';

chai.use(chaiHttp);
const expect = chai.expect;

describe('Deleting recipe', () => {
  let category: Category;
  let recipe: Recipe;

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
    recipe = await recipeModel.create(recipeObj);

    category._id = category._id.toString();
  });

  after(async (): Promise<void> => {
    const categoryModel = await require('../../src/entities/category/model').default;
    const recipeModel = await require('../../src/entities/recipe/model').default;

    await recipeModel.model.deleteOne({ _id: recipe._id });
    await categoryModel.model.deleteOne({ _id: category._id });
  });

  describe('delete recipe success', () => {
    it('it should delete recipe',  async () => {
      const recipeModel = await require('../../src/entities/recipe/model').default;

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .del(`/v1/recipe/${recipe._id}`);

      const { title, description, categoryId, _id }: Recipe = res.body;

      expect(title).to.equal(recipe.title);
      expect(description).to.equal(recipe.description);
      expect(categoryId).to.equal(category._id);
      expect(_id).to.equal(recipe._id.toString());

      const deletedArticle = await recipeModel.model.find({ _id: recipe._id });
      const { isDeleted } = deletedArticle[0];
      expect(isDeleted).to.equal(true);
    });
  });

  describe('delete recipe failed', () => {
    it('it delete recipe with id which not ObjectId',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .del('/v1/recipe/12');

      const { status, body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(2);
      expect(body[0].message).to.equal('Cast to ObjectId failed for value "12" (type string) at path "_id" ');
      expect(body[1].message).to.equal('Recipe not exist');
    });

    it('it delete recipe not found',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .del('/v1/recipe/6137674024ced5b9481fef5e');

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('Recipe not exist');
    });

    it('it won\'t get deleted recipe not found',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get(`/v1/recipe/${recipe._id}`);

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('Recipe not exist');
    });
  });
});
