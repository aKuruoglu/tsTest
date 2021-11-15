import chai from 'chai';
import chaiHttp from 'chai-http';
import { Article } from '../../src/entities/article/interface';
import { Category } from '../../src/entities/category/interface';

chai.use(chaiHttp);
const expect = chai.expect;

describe('Add article', () => {
  let category: Category;
  let addArticle: Article;
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
    const articleModel = await require('../../src/entities/article/model').default;

    await articleModel.model.deleteOne({ _id: addArticle._id });
    await categoryModel.model.deleteOne({ _id: category._id });
  });

  describe('Adding article', () => {
    it('it should add article',  async () => {
      const article: Article = {
        categoryId: category._id,
        description: 'rewrew',
        mainText: 'rewerwer',
        title: 'wewer',
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .post('/v1/article')
        .send(article);
      addArticle = res.body;

      const { title, description, mainText, categoryId } = addArticle;

      expect(title).to.equal(article.title);
      expect(description).to.equal(article.description);
      expect(mainText).to.equal(article.mainText);
      expect(categoryId).to.equal(category._id);
    });
  });

  describe('add article failed', () => {
    it('it add article without mainText',  async () => {
      const article = {
        categoryId: category._id,
        description: 'rewrew',
        title: 'wewer',
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .post('/v1/article')
        .send(article);

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('The mainText field is required.');
    });

    it('it add article without title',  async () => {
      const article = {
        categoryId: category._id,
        description: 'rewrew',
        mainText: 'rewerwer',
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .post('/v1/article')
        .send(article);

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('The title field is required.');
    });

    it('it add article without description',  async () => {
      const article = {
        categoryId: category._id,
        mainText: 'rewerwer',
        title: 'wewer',
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .post('/v1/article')
        .send(article);

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('The description field is required.');
    });

    it('it add article without categoryId',  async () => {
      const article = {
        description: 'rewrew',
        mainText: 'rewerwer',
        title: 'wewer',
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .post('/v1/article')
        .send(article);
      const { status, body: [{ message }] , body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('The categoryId field is required.');
    });

    it('it adding article with an incorrect categoryId',  async () => {
      const article = {
        categoryId: '6130dfe75436a11e872603c',
        description: 'rewrew',
        mainText: 'rewerwer',
        title: 'wewer',
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .post('/v1/article')
        .send(article);

      const { status, body } = res;
      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(2);
      expect(body[0].message).to.equal(`Cast to ObjectId failed for value "${article.categoryId}" (type string) at path "_id" `);
      expect(body[1].message).to.equal('CategoryId not exist');
    });
  });

});
