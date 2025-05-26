import request from 'supertest'
import app from '../src/app'
import models from '../src/models'
import initDb from '../mongodb/index.js'
import initAppRoutes from '../src/routers'
import initCrud from '../src/crud'

initAppRoutes(app)
initCrud(app)

const { user, roles, stores } = models
const client = request(app)

beforeAll(async () => {
  try {
    await initDb()
    await Promise.all([masterUser()])
  } catch (err) {
    console.log('Issue while setting up!')
    console.log(err)
  }
})

async function masterUser() {
  await user.deleteMany()
  await stores.deleteMany()
  await roles.deleteMany()
  const ownerRole = await roles.create({ name: 'restaurant_owner' })
  const store = await stores.create({
    name: 'KFC',
    city: 'Phnom Penh',
    street: '540 Koh Pich street Khan Chamkarmorn Phnom Penh CAMBODIA',
  })
  await user.create({
    first_name: 'Admin',
    last_name: 'Example',
    email: 'admin@example.com',
    password: '$2a$10$jUpIfJDgJyz2aRySwZ36FObb7CMLfFMZpoTKrnqkf0WGJPRAdLnw.',
    gender: 'Male',
    role_id: ownerRole._id,
    store_id: store._id,
  })
}

async function login() {
  return await client.post('/api/auth/login').send({
    email: 'admin@example.com',
    password: '123',
  })
}

export { app, client, login, masterUser }
