// import { client, login } from '../utils'

// let token = ''
// beforeAll(async () => {
//   const { body } = await login()
//   token = body.token
// })

// describe('table model', () => {
//   // test('doest nothing is separation is already correct', () => {
//   //   const res = { user: 'hello' }
//   //   expect(res.user).toBe('hello')
//   // })
//   it('should create a table to database tables', async () => {
//     const res = await client
//       .post('/api/tables')
//       .set('x-access-token', token)
//       .send({ table_number: 'A1' })
//     expect(res.body.success).toBe(true)
//   })
// })
