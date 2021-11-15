import chai from 'chai';
import chaiHttp from 'chai-http';
import { Category } from '../../src/entities/category/interface';

chai.use(chaiHttp);
const expect = chai.expect;

describe('Getting all category', () => {
  let category1: Category;
  let category2: Category;
  let category3: Category;

  before(async (): Promise<void> => {
    const categoryObj = {
      name: 'TestCategory',
      parentCategoryId: null,
    };

    const categoryModel = await require('../../src/entities/category/model').default;

    category1 = await categoryModel.create(categoryObj);
    category2 = await categoryModel.create(categoryObj);
    category3 = await categoryModel.create(categoryObj);

    category1._id = category1._id.toString();
    category2._id = category2._id.toString();
    category3._id = category3._id.toString();

    await categoryModel.delete(category2._id);
    await categoryModel.delete(category3._id);
  });

  after(async (): Promise<void> => {
    const categoryModel = await require('../../src/entities/category/model').default;

    await categoryModel.model.deleteOne({ _id: category1._id });
    await categoryModel.model.deleteOne({ _id: category2._id });
    await categoryModel.model.deleteOne({ _id: category3._id });
  });

  describe('get all category success', () => {
    it('it should return categories',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get('/v1/category');

      const { body } = res;
      expect(body).to.have.lengthOf(1);
    });
  });

  describe('get all category failed', () => {
    it('it should return 1 category',  async () => {

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .get('/v1/category');

      const { body } = res;
      expect(body).to.have.lengthOf(1);
    });
  });

});
