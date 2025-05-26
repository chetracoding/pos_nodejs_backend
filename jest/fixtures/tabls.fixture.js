import models from '../../src/models'

const { tables } = models

export const table = {
  table_number: 'A1',
}

export function insertTable(table) {
  return Promise.all(tables.create(table))
}

export function destrouTables() {
  return Promise.all(tables.deleteMany())
}

export async function setup() {
  try {
    await destrouTables()
  } catch (err) {
    console.log(err)
    throw err
  }
}
