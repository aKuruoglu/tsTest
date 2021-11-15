import chai from 'chai';
import chaiHttp from 'chai-http';
import {Category} from "../../src/entities/category/interface";
import {Article} from "../../src/entities/article/interface";

chai.use(chaiHttp);
const expect = chai.expect;

describe('Updating article', () => {
  let category: Category;
  let article: Article;

  before(async () => {
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
  });

  after(async () => {
    const categoryModel = await require('../../src/entities/category/model').default;
    const articleModel = await require('../../src/entities/article/model').default;

    await categoryModel.model.deleteOne({ _id: category._id });
    await articleModel.model.deleteOne({ _id: article._id });
  });

  describe('Update article success', () => {
    it('it should update article',  async () => {
      const toUpdateObj: Article = {
        ...article,
        mainText: '111',
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put(`/v1/article/${article._id}`)
        .send(toUpdateObj);

      const { title, description, mainText, categoryId, _id }: Article = res.body;

      expect(title).to.equal(toUpdateObj.title);
      expect(description).to.equal(toUpdateObj.description);
      expect(mainText).to.equal(toUpdateObj.mainText);
      expect(categoryId).to.equal(category._id);
      expect(_id).to.equal(toUpdateObj._id.toString());
    });
  });

  describe('update article failed', () => {
    it('it won\'t update article category with id which not ObjectId',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put('/v1/article/12');

      const { status, body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(2);
      expect(body[0].message).to.equal('Cast to ObjectId failed for value "12" (type string) at path "_id" ');
      expect(body[1].message).to.equal('Article not exist');
    });

    it('it won\'t update article category not found',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put('/v1/article/6137674024ced5b9481fef5e');

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('Article not exist');
    });

    it('it won\'t update article category not found',  async () => {
      const articleModel = await require('../../src/entities/article/model').default;
      await articleModel.delete(article._id);

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put(`/v1/article/${article._id}`);

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('Article not exist');
    });
  });
});
