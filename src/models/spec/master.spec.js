import { client, login } from '../../../jest/utils'
import {
  getCrudLists,
  createCrudLists,
} from '../../../jest/fixtures/crud.fixture'

let token = ''
beforeAll(async () => {
  const { body } = await login()
  token = body.token
})

describe.each(getCrudLists)('⚙ Get $name list (GET /$endpoint)', (spec) => {
  it(`✨ should response ${spec.name} with valid authorization token for database tenant$tenant`, async () => {
    const res = await client
      .get(`/api/${spec.endpoint}`)
      .set('x-access-token', token)
      .expect(200)

    expect(res.body).toEqual({
      data: expect.anything(),
      message: expect.anything(),
      success: true,
    })
  })
  it(`🧨 should fail with no authorization token for database tenant`, async () => {
    const res = await client
      .get(`/api/${spec.endpoint}`)

    expect(res.body).toEqual({
      message: expect.anything(),
      success: false,
    })
  })
})
