import chai from 'chai';
import chaiHttp from 'chai-http';
import { Article } from '../../src/entities/article/interface';
import { Category } from '../../src/entities/category/interface';

chai.use(chaiHttp);
const expect = chai.expect;

describe('Getting article', () => {
  let category: Category;
  let article: Article;

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

    article = await articleModel.create(articleObj);

    category._id = category._id.toString();
    article._id = article._id.toString();
  });

  after(async (): Promise<void> => {
    const categoryModel = await require('../../src/entities/category/model').default;
    const articleModel = await require('../../src/entities/article/model').default;

    await categoryModel.model.deleteOne({ _id: category._id });
    await articleModel.model.deleteOne({ _id: article._id });
  });

  describe('get article success', () => {
    it('it should return article',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get(`/v1/article/${article._id}`);

      const { title, description, mainText, categoryId }: Article = res.body;

      expect(title).to.equal(article.title);
      expect(description).to.equal(article.description);
      expect(mainText).to.equal(article.mainText);
      expect(categoryId).to.equal(category._id);
    });
  });

  describe('get article failed', () => {
    it('it won\'t get article with id which not ObjectId',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get('/v1/article/12');

      const { status, body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(2);
      expect(body[0].message).to.equal('Cast to ObjectId failed for value "12" (type string) at path "_id" ');
      expect(body[1].message).to.equal('Article not exist');
    });

    it('it won\'t get article not found',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get('/v1/article/6137674024ced5b9481fef5e');

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('Article not exist');
    });

    it('it won\'t get deleted article',  async () => {

      const articleModel = await require('../../src/entities/article/model').default;
      await articleModel.delete(article._id);

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get(`/v1/article/${article._id}`);

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('Article not exist');
    });
  });
});
