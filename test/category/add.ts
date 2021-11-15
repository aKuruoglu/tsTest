import chai from 'chai';
import chaiHttp from 'chai-http';
import { Category } from '../../src/entities/category/interface';
import { CategorySegregation } from '../../src/entities/categorySegregation/interface';

chai.use(chaiHttp);
const expect = chai.expect;

describe('Adding category', () => {
  let category: Category;
  let categoryCount: CategorySegregation;

  after(async (): Promise<void> => {
    const categoryModel = await require('../../src/entities/category/model').default;
    const categoryWithCountModel = await require('../../src/entities/categorySegregation/model').default;
    await categoryModel.model.deleteOne({ _id: category._id });
    await categoryWithCountModel.model.deleteOne({ _id: category._id });
  });

  describe('add category success', () => {
    it('it should add category',  async () => {
      const categoryObj: Category = {
        name: 'wewer',
        parentCategoryId: null,
      };
      const categoryWithCountModel = await require('../../src/entities/categorySegregation/model').default;

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .post('/v1/category')
        .send(categoryObj);
      category = res.body;

      const { name, parentCategoryId, _id }: Category = res.body;

      expect(name).to.equal(categoryObj.name);
      expect(parentCategoryId).to.equal(categoryObj.parentCategoryId);

      categoryCount = await categoryWithCountModel.model.findOne({ _id });

      expect(categoryCount.name).to.equal(name);
      expect(categoryCount.parentCategoryId).to.equal(parentCategoryId);
      expect(categoryCount._id.toString()).to.equal(_id);
      expect(categoryCount.articleCount).to.equal(0);
      expect(categoryCount.recipeCount).to.equal(0);
    });
  });

  describe('add category failed', () => {
    it('it add category without name',  async () => {
      const categoryObj = {
        parentCategoryId: category._id,
      };
      const categoryWithCountModel = await require('../../src/entities/categorySegregation/model').default;

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .post('/v1/category')
        .send(categoryObj);

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('The name field is required.');

      categoryCount = await categoryWithCountModel.model.find({});
      expect(categoryCount).to.have.lengthOf(1);
    });

    it('it adding category with an incorrect parentCategoryId',  async () => {
      const categoryObj: Category = {
        name: 'wewer',
        parentCategoryId: '61695b60dd6fe636c1a78db0',
      };
      const categoryWithCountModel = await require('../../src/entities/categorySegregation/model').default;

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .post('/v1/category')
        .send(categoryObj);

      const { status, body: [{ message }] } = res;

      expect(status).to.equal(400);
      expect(message).to.equal('CategoryId not exist');

      categoryCount = await categoryWithCountModel.model.find({});
      expect(categoryCount).to.have.lengthOf(1);
    });

    it('it add category with parentCategoryId which not ObjectId',  async () => {
      const categoryObj: Category = {
        name: 'wewer',
        parentCategoryId: '42',
      };
      const categoryWithCountModel = await require('../../src/entities/categorySegregation/model').default;

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .post('/v1/category')
        .send(categoryObj);

      const { status, body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(2);
      expect(body[0].message).to.equal(`Cast to ObjectId failed for value "${categoryObj.parentCategoryId}" (type string) at path "_id" `);
      expect(body[1].message).to.equal('CategoryId not exist');

      categoryCount = await categoryWithCountModel.model.find({});
      expect(categoryCount).to.have.lengthOf(1);
    });
  });
});
