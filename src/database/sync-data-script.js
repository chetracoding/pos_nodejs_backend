import mongoose from 'mongoose'
import dotenv from 'dotenv'
import initDb from '../../mongodb/index.js'
import { insertRolePermissions } from './role-permissions-seed.js'
import { insertUsers } from './user-seed.js'

dotenv.config()

export async function syncData() {
  try {
    await initDb()

    await clearCollections()

    await insertRolePermissions()
    await insertUsers()

    await mongoose.disconnect()
  } catch (error) {
    await mongoose.disconnect()
    throw error
  }
}

async function clearCollections() {
  console.log(
    '-----------> Dropping from database, please wait... <-----------'
  )
  const collections = mongoose.connection.collections

  for (const key in collections) {
    const collection = collections[key]
    await collection.deleteMany({})
  }

  console.log('-----------> All data dropped from database. <-----------')
}

syncData()
