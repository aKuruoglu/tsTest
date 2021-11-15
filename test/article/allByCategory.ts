import chai from 'chai';
import chaiHttp from 'chai-http';
import { Article } from '../../src/entities/article/interface';
import { Category } from '../../src/entities/category/interface';

chai.use(chaiHttp);
const expect = chai.expect;

describe('Getting articles by category', () => {
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
    article2._id = article2._id.toString();
    article3._id = article3._id.toString();

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

  describe('get articles by category success', () => {
    it('it should return articles by category',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get(`/v1/article/category/${category._id}/0/10`);
      const { entities, total } = res.body;

      expect(entities).to.have.lengthOf(1);
      expect(total).to.equal(1);
    });
  });

  describe('get article failed', () => {
    it('it get article with id which not ObjectId',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get('/v1/article/category/12/0/10');

      const { status, body } = res;
      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(2);
      expect(body[0].message).to.equal('Cast to ObjectId failed for value "12" (type string) at path "_id" ');
      expect(body[1].message).to.equal('CategoryId not exist');
    });

    it('it get article not found',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get('/v1/article/category/6137674024ced5b9481fef5e/0/10');

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('CategoryId not exist');
    });

    it('it won\'t return deleted articles',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get('/v1/article/0/10');
      const { entities, total } = res.body;

      expect(entities).to.have.lengthOf(1);
      expect(total).to.equal(1);
    });

    it('it won\'t return articles, page < 0',  async () => {

      const res = await chai.request('http://localhost:4000')
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
