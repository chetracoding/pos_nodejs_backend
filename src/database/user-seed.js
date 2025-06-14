import bcrypt from 'bcryptjs'
import { ROLE_NAME } from '../constants/index.js'
import models from '../models/index.js'
import userService from '../services/user.js'

const { Store } = models

export async function insertUsers() {
  console.log('-----------> Inserting users, please wait... <-----------')
  const password = await bcrypt.hash('123', 10)

  const store1 = await Store.create({
    name: 'The Pizza Company',
    street: '2004',
    city: 'Phnom Penh',
  })
  const store2 = await Store.create({
    name: 'Kimmo',
    street: 'Sorlar',
    city: 'Phnom Penh',
  })

  const users = [
    {
      first_name: 'Super',
      last_name: 'Admin',
      email: 'superadmin@example.com',
      gender: 'Male',
      password,
      role_name: ROLE_NAME.SUPER_ADMIN,
      store_id: store1._id,
    },
    {
      first_name: 'Admin',
      last_name: 'Example',
      email: 'admin@example.com',
      gender: 'Male',
      password,
      role_name: ROLE_NAME.ADMIN,
      store_id: store1._id,
    },
    {
      first_name: 'Cashier',
      last_name: 'Example',
      email: 'cashier@example.com',
      gender: 'Male',
      password,
      role_name: ROLE_NAME.CASHIER,
      store_id: store1._id,
    },
    {
      first_name: 'Chef',
      last_name: 'Example',
      email: 'chef@example.com',
      gender: 'Female',
      password,
      role_name: ROLE_NAME.CHEF,
      store_id: store1._id,
    },
    {
      first_name: 'Waiter',
      last_name: 'Example',
      email: 'waiter@example.com',
      gender: 'Male',
      password,
      role_name: ROLE_NAME.WAITER,
      store_id: store1._id,
    },
    {
      first_name: 'Chetra',
      last_name: 'HONG',
      email: 'chetra@example.com',
      gender: 'Male',
      password,
      role_name: ROLE_NAME.ADMIN,
      store_id: store2._id,
    },
  ]

  await Promise.all(users.map((user) => userService.createUser(user)))

  console.log('-----------> Users are inserted <-----------')

  return { store1, store2 }
}
