import chai from 'chai';
import chaiHttp from 'chai-http';
import { Category } from '../../src/entities/category/interface';

chai.use(chaiHttp);
const expect = chai.expect;

describe('Updating category', () => {
  let categoryFirst: Category;
  let categorySecond: Category;
  let categoryThird: Category;
  let categoryFourth: Category;

  before(async (): Promise<void> => {
    const categoryObj: Category = {
      name: 'TestCategory',
      parentCategoryId: null,
    };

    const categoryControl = await require('../../src/entities/category/control').default;

    categoryFirst = await categoryControl.create(categoryObj);
    categoryFirst._id = categoryFirst._id.toString();

    const categoryObjSecond: Category = {
      name: 'TestCategory',
      parentCategoryId: categoryFirst._id,
    };
    categorySecond = await categoryControl.create(categoryObjSecond);
    categorySecond._id = categorySecond._id.toString();

    const categoryObjThird: Category = {
      name: 'TestCategory',
      parentCategoryId: categorySecond._id,
    };
    categoryThird = await categoryControl.create(categoryObjThird);
    categoryThird._id = categoryThird._id.toString();

    categoryFourth = await categoryControl.create(categoryObjThird);
    categoryFourth._id = categoryFourth._id.toString();
    await categoryControl.delete(categoryFourth._id);
  });

  after(async (): Promise<void> => {
    const categoryModel = await require('../../src/entities/category/model').default;
    const categoryWithCountModel = await require('../../src/entities/categorySegregation/model').default;

    await categoryModel.model.deleteOne({ _id: categoryFirst._id });
    await categoryModel.model.deleteOne({ _id: categorySecond._id });
    await categoryModel.model.deleteOne({ _id: categoryThird._id });
    await categoryModel.model.deleteOne({ _id: categoryFourth._id });

    await categoryWithCountModel.model.deleteOne({ _id: categoryFirst._id });
    await categoryWithCountModel.model.deleteOne({ _id: categorySecond._id });
    await categoryWithCountModel.model.deleteOne({ _id: categoryThird._id });
    await categoryWithCountModel.model.deleteOne({ _id: categoryFourth._id });
  });

  describe('Update category success', () => {
    it('it should update category',  async () => {
      const toUpdateObj: Category = {
        ...categoryFirst,
        name: '111',
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put(`/v1/category/${categoryFirst._id}`)
        .send(toUpdateObj);

      const { name, parentCategoryId, _id }: Category = res.body;

      expect(name).to.equal(toUpdateObj.name);
      expect(parentCategoryId).to.equal(toUpdateObj.parentCategoryId);
      expect(_id).to.equal(toUpdateObj._id.toString());

      const categoryWithCountModel = await require('../../src/entities/categorySegregation/model').default;
      const categoryCount = await categoryWithCountModel.model.find({ _id: toUpdateObj._id });
      expect(categoryCount[0].name).to.equal(toUpdateObj.name);
      expect(categoryCount[0].parentCategoryId).to.equal(toUpdateObj.parentCategoryId);
    });

    it('it should update parent category',  async () => {
      const toUpdateObj: Category = {
        ...categorySecond,
        parentCategoryId: categoryFirst._id,
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put(`/v1/category/${categorySecond._id}`)
        .send(toUpdateObj);

      const { name, parentCategoryId, _id }: Category = res.body;

      expect(name).to.equal(toUpdateObj.name);
      expect(parentCategoryId).to.equal(toUpdateObj.parentCategoryId);
      expect(_id).to.equal(toUpdateObj._id.toString());
    });
  });

  describe('update category failed', () => {
    it('it won\'t update category with id which not ObjectId',  async () => {
      const toUpdateObj: Category = {
        ...categoryFirst,
        name: '111',
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put('/v1/category/12')
        .send(toUpdateObj);

      const { status, body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(2);
      expect(body[0].message).to.equal('Cast to ObjectId failed for value "12" (type string) at path "_id" ');
      expect(body[1].message).to.equal('CategoryId not exist');
    });

    it('it won\'t update category not found',  async () => {
      const toUpdateObj: Category = {
        ...categoryFirst,
        name: '111',
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put('/v1/category/6137674024ced5b9481fef5e')
        .send(toUpdateObj);

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('CategoryId not exist');
    });

    it('it won\'t update category not found',  async () => {
      const toUpdateObj: Category = {
        ...categoryFirst,
        name: '111',
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put(`/v1/category/${categoryFourth._id}`)
        .send(toUpdateObj);

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('CategoryId not exist');
    });

    it('it won\'t update parent category',  async () => {
      const toUpdateObj: Category = {
        ...categorySecond,
        parentCategoryId: categoryThird._id,
      };

      const res = await chai.request(`http://localhost:${process.env.SERVER_OUT_PORT}`)
        .put(`/v1/category/${categorySecond._id}`)
        .send(toUpdateObj);

      const { status, body: [{ message }], body } = res;

      expect(status).to.equal(400);
      expect(body).to.have.lengthOf(1);
      expect(message).to.equal('Sorry you cannot change to the given parent category as it is a child category');
    });
  });
});
