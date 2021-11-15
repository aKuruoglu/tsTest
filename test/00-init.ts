import app from '../src/app';

before(async () => {
  await app();
});

// describe('_________', () => {
//   it('+++++++++++', async () => {
//     await new Promise((r) => {
//
//       setTimeout(() => {
//         r();
//       }, 3000);
//
//     });
//   });
// });
