import chai from 'chai';
import chaiHttp from 'chai-http';
import { Article } from '../../src/entities/article/interface';
import { Category } from '../../src/entities/category/interface';

chai.use(chaiHttp);
const expect = chai.expect;

describe('Getting all articles', () => {
  let category: Category;
  let article1: Article;
  let article2: Article;
  let article3: Article;

  before(async (): Promise<void> => {
    const categoryObj: Category = {
      name: 'TestCategory',
      parentCategoryId: null,
    };

    const categoryModel = await require('../../src/entities/category/model').default;
    const articleModel = await require('../../src/entities/article/model').default;

    category = await categoryModel.create(categoryObj);

    const articleObj: Article = {
      categoryId: category._id,
      description: 'rewrew',
      mainText: 'rewerwer',
      title: 'wewer',
    };

    article1 = await articleModel.create(articleObj);
    article2 = await articleModel.create(articleObj);
    article3 = await articleModel.create(articleObj);

    category._id = category._id.toString();
    article1._id = article1._id.toString();

    await articleModel.delete(article2._id);
    await articleModel.delete(article3._id);
  });

  after(async (): Promise<void> => {
    const categoryModel = await require('../../src/entities/category/model').default;
    const articleModel = await require('../../src/entities/article/model').default;

    await categoryModel.model.deleteOne({ _id: category._id });
    await articleModel.model.deleteOne({ _id: article1._id });
    await articleModel.model.deleteOne({ _id: article2._id });
    await articleModel.model.deleteOne({ _id: article3._id });
  });

  describe('get all articles success', () => {
    it('it should return articles',  async (): Promise<void> => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get('/v1/article/0/10');
      const { entities, total } = res.body;

      expect(entities).to.have.lengthOf(1);
      expect(total).to.equal(1);
    });
  });

  describe('get all articles failed', () => {
    it('it won\'t return deleted articles',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get('/v1/article/0/10');
      const { entities, total } = res.body;

      expect(entities).to.have.lengthOf(1);
      expect(total).to.equal(1);
    });

    it('it won\'t return articles, page < 0',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get('/v1/article/-1/10');

      const { body: [{ message }] } = res;

      expect(message).to.equal('Page cannot be less than 0');
    });

    it('it won\'t return articles, limit < 1',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get('/v1/article/0/0');

      const { body: [{ message }] } = res;

      expect(message).to.equal('Limit cannot be less than 1');
    });
  });

});
