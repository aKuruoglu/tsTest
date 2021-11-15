import chai from 'chai';
import chaiHttp from 'chai-http';
import {Category} from "../../src/entities/category/interface";
import {Article} from "../../src/entities/article/interface";

chai.use(chaiHttp);
const expect = chai.expect;

describe('Updating article category', () => {
  let categoryFirst: Category;
  let categorySecond: Category;
  let categoryThird: Category;
  let article: Article;

  before(async (): Promise<void> => {
    const categoryObj: Category = {
      name: 'TestCategory',
      parentCategoryId: null,
    };

    const categoryModel = await require('../../src/entities/category/model').default;
    const articleModel = await require('../../src/entities/article/model').default;

    categoryFirst = await categoryModel.create(categoryObj);
    categorySecond = await categoryModel.create(categoryObj);
    categoryThird = await categoryModel.create(categoryObj);

    const articleObj: Article = {
      categoryId: categoryFirst._id,
      description: 'rewrew',
      mainText: 'rewerwer',
      title: 'wewer',
    };
    article = await articleModel.create(articleObj);

    categoryFirst._id = categoryFirst._id.toString();
    categorySecond._id = categorySecond._id.toString();
    categoryThird._id = categoryThird._id.toString();

    await categoryModel.delete(categoryThird._id);

    article._id = article._id.toString();
  });

  after(async (): Promise<void> => {
    const categoryModel = await require('../../src/entities/category/model').default;
    const articleModel = await require('../../src/entities/article/model').default;

    await categoryModel.model.deleteOne({ _id: categoryFirst._id });
    await categoryModel.model.deleteOne({ _id: categorySecond._id });
    await categoryModel.model.deleteOne({ _id: categoryThird._id });
    await articleModel.model.deleteOne({ _id: article._id });
  });

  describe('Update article category success', () => {
    it('it should update article category',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put(`/v1/article/${article._id}/change-category/${categorySecond._id}`);

      const { title, description, mainText, categoryId, _id }: Article = res.body;

      expect(title).to.equal(article.title);
      expect(description).to.equal(article.description);
      expect(mainText).to.equal(article.mainText);
      expect(categoryId).to.equal(categorySecond._id);
      expect(_id).to.equal(article._id);
    });
  });

  describe('update article category failed', () => {
    it('it won\'t update article with id which not ObjectId',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put(`/v1/article/12/change-category/${categorySecond._id}`);

      const { status, body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(2);
      expect(body[0].message).to.equal('Cast to ObjectId failed for value "12" (type string) at path "_id" ');
      expect(body[1].message).to.equal('Article not exist');
    });

    it('it won\'t update article  not found',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put(`/v1/article/6137674024ced5b9481fef5e/change-category/${categorySecond._id}`);
      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('Article not exist');
    });

    it('it won\'t update article category not found',  async () => {
      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put(`/v1/article/${article._id}/change-category/${categoryThird._id}`);

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('CategoryId not exist');
    });
  });
});
