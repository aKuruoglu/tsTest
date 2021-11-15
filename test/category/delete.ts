import chai from 'chai';
import chaiHttp from 'chai-http';
import { Article } from '../../src/entities/article/interface';
import { Category } from '../../src/entities/category/interface';
import { Recipe } from '../../src/entities/recipe/interface';

chai.use(chaiHttp);
const expect = chai.expect;

describe('Deleting category', () => {
  let categoryFirst: Category;
  let categorySecond: Category;
  let categoryThird: Category;
  let recipe1: Recipe;
  let recipe2: Recipe;
  let recipe3: Recipe;
  let article2: Article;
  let article3: Article;

  before(async (): Promise<void> => {
    const first: Category = {
      name: 'TestCategory',
      parentCategoryId: null,
    };

    const categoryControl = await require('../../src/entities/category/control').default;

    categoryFirst = await categoryControl.create(first);
    categoryFirst._id = categoryFirst._id.toString();

    const second: Category = {
      name: 'TestCategory',
      parentCategoryId: categoryFirst._id,
    };
    categorySecond = await categoryControl.create(second);
    categorySecond._id = categorySecond._id.toString();

    const third: Category = {
      name: 'TestCategory',
      parentCategoryId: categorySecond._id,
    };
    categoryThird = await categoryControl.create(third);
    categoryThird._id = categoryThird._id.toString();

    const recipeModel = await require('../../src/entities/recipe/model').default;
    const recipeObj1: Recipe = {
      categoryId: categoryFirst._id,
      description: 'werwer',
      title: 'sdfsdf',
    };
    const recipeObj2: Recipe = {
      categoryId: categorySecond._id,
      description: 'werwer',
      title: 'sdfsdf',
    };
    const recipeObj3: Recipe = {
      categoryId: categoryThird._id,
      description: 'werwer',
      title: 'sdfsdf',
    };
    recipe1 = await recipeModel.create(recipeObj1);
    recipe2 = await recipeModel.create(recipeObj2);
    recipe3 = await recipeModel.create(recipeObj3);

    const articleControl = await require('../../src/entities/article/control').default;

    const articleObj2: Article = {
      categoryId: categorySecond._id,
      description: 'rewrew',
      mainText: 'rewerwer',
      title: 'wewer',
    };

    const articleObj3: Article = {
      categoryId: categoryThird._id,
      description: 'rewrew',
      mainText: 'rewerwer',
      title: 'wewer',
    };

    article2 = await articleControl.create(articleObj2);
    article3 = await articleControl.create(articleObj3);

  });

  after(async (): Promise<void> => {
    const categoryModel = await require('../../src/entities/category/model').default;
    const categoryWithCountModel = await require('../../src/entities/categorySegregation/model').default;
    const recipeModel = await require('../../src/entities/recipe/model').default;
    const articleModel = await require('../../src/entities/article/model').default;

    await categoryModel.model.deleteOne({ _id: categoryFirst._id });
    await categoryModel.model.deleteOne({ _id: categorySecond._id });
    await categoryModel.model.deleteOne({ _id: categoryThird._id });

    await categoryWithCountModel.model.deleteOne({ _id: categoryFirst._id });
    await categoryWithCountModel.model.deleteOne({ _id: categorySecond._id });
    await categoryWithCountModel.model.deleteOne({ _id: categoryThird._id });

    await recipeModel.model.deleteOne({ _id: recipe1._id });
    await recipeModel.model.deleteOne({ _id: recipe2._id });
    await recipeModel.model.deleteOne({ _id: recipe3._id });

    await articleModel.model.deleteOne({ _id: article2._id });
    await articleModel.model.deleteOne({ _id: article3._id });

  });

  describe('delete category success', () => {
    it('it should delete category',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .del(`/v1/category/${categorySecond._id}`);

      const { name, parentCategoryId } = res.body;

      expect(name).to.equal(categorySecond.name);
      expect(parentCategoryId).to.equal(categoryFirst._id);

      const categoryWithCountModel = await require('../../src/entities/categorySegregation/model').default;
      const categoryCount = await categoryWithCountModel.model.find({ _id: categorySecond._id });

      expect(categoryCount[0].name).to.equal(name);
      expect(categoryCount[0].parentCategoryId.toString()).to.equal(parentCategoryId);
      expect(categoryCount[0].isDeleted).to.equal(true);
    });

    it('it should get category with parentCategoryId categoryFirst',  async () => {
      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get(`/v1/category/${categoryThird._id}`);

      const { name, parentCategoryId } = res.body;

      expect(name).to.equal(categoryThird.name);
      expect(parentCategoryId).to.equal(categoryFirst._id);

      const categoryWithCountModel = await require('../../src/entities/categorySegregation/model').default;
      const categoryCount = await categoryWithCountModel.model.find({ _id: categoryThird._id });

      expect(categoryCount[0].name).to.equal(categoryThird.name);
      expect(categoryCount[0].parentCategoryId.toString()).to.equal(categoryFirst._id);
      expect(categoryCount[0].isDeleted).to.equal(false);
    });

    it('it should not get recipe, was deleted category',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get(`/v1/recipe/${recipe2._id}`);

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('Recipe not exist');
    });

    it('it should get recipe after delete category',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get(`/v1/recipe/${recipe3._id}`);

      const { title, description, categoryId } = res.body;

      expect(title).to.equal(recipe3.title);
      expect(description).to.equal(recipe3.description);
      expect(categoryId).to.equal(categoryThird._id);
    });

    it('it should not get article, was deleted category',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get(`/v1/article/${article2._id}`);

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('Article not exist');
    });

    it('it should get article after delete category',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get(`/v1/article/${article3._id}`);

      const { title, description, mainText, categoryId } = res.body;

      expect(title).to.equal(article3.title);
      expect(description).to.equal(article3.description);
      expect(mainText).to.equal(article3.mainText);
      expect(categoryId).to.equal(categoryThird._id);
    });
  });

  describe('delete category failed', () => {

    it('it delete category with an incorrect _id',  async () => {
      const categoryObj: Category = {
        _id: '61695b60dd6fe636c1a78db1',
        name: 'wewer',
        parentCategoryId: '61695b60dd6fe636c1a78db0',
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .del(`/v1/category/${categoryObj._id}`);
      const { status, body: [{ message }] } = res;

      expect(status).to.equal(400);
      expect(message).to.equal('CategoryId not exist');
    });

    it('it delete category with _id which not ObjectId',  async () => {
      const categoryObj: Category = {
        _id: '61695b60dd6fe636c1a78db',
        name: 'wewer',
        parentCategoryId: '61695b60dd6fe636c1a78db0',
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .del(`/v1/category/${categoryObj._id}`);

      const { status, body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(2);
      expect(body[0].message).to.equal(`Cast to ObjectId failed for value "${categoryObj._id}" (type string) at path "_id" `);
      expect(body[1].message).to.equal('CategoryId not exist');
    });
  });
});
