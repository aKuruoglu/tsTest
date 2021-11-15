import app from '../src/app';

before(async () => {
  await app();
});
