import chai from 'chai';
import chaiHttp from 'chai-http';
import {Category} from "../../src/entities/category/interface";
import {Article} from "../../src/entities/article/interface";
import {Recipe} from "../../src/entities/recipe/interface";

chai.use(chaiHttp);
const expect = chai.expect;

describe('Getting category by id', () => {
  let category: Category;
  let article: Article;
  let recipe: Recipe;

  before(async (): Promise<void> => {
    const categoryObj = {
      name: 'TestCategory',
      parentCategoryId: null,
    };

    const categoryControl = await require('../../src/entities/category/control').default;
    category = await categoryControl.create(categoryObj);
    category._id = category._id.toString();

    const articleObj: Article = {
      categoryId: category._id,
      description: 'rewrew',
      mainText: 'rewerwer',
      title: 'wewer',
    };
    const articleControl = await require('../../src/entities/article/control').default;
    article = await articleControl.create(articleObj);

    const recipeObj: Recipe = {
      categoryId: category._id,
      description: 'rewrew',
      title: 'wewer',
    };
    const recipeControl = await require('../../src/entities/recipe/control').default;
    recipe = await recipeControl.create(recipeObj);
  });

  after(async () => {
    const categoryModel = await require('../../src/entities/category/model').default;
    const categoryWithCount = await require('../../src/entities/categorySegregation/model').default;
    const articleModel = await require('../../src/entities/article/model').default;
    const recipeModel = await require('../../src/entities/recipe/model').default;

    await categoryModel.model.deleteOne({ _id: category._id });
    await categoryWithCount.model.deleteOne({ _id: category._id });
    await articleModel.model.deleteOne({ _id: article._id });
    await recipeModel.model.deleteOne({ _id: recipe._id });
  });

  describe('get category success', () => {
    it('it should return category by id',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get(`/v1/category/${category._id}`);

      const { _id, name, parentCategoryId, recipeCount, articleCount } = res.body;

      expect(_id).to.equal(category._id);
      expect(name).to.equal(category.name);
      expect(parentCategoryId).to.equal(category.parentCategoryId);
      expect(recipeCount).to.equal(1);
      expect(articleCount).to.equal(1);
    });
  });

});
