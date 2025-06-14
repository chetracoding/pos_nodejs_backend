import models from '../models/index.js'

const { Category, Table } = models

export async function insertCategoriesAndTables(store) {
  console.log(
    '-----------> Inserting categories and tables, please wait... <-----------'
  )

  const categories = await Category.insertMany([
    {
      name: 'Pizza',
      store,
    },
    {
      name: 'Noodle',
      store,
    },
    {
      name: 'Drink',
      store,
    },
  ])

  await Table.insertMany([
    {
      table_number: 'A1',
      store,
    },
    {
      table_number: 'A2',
      store,
    },
    {
      table_number: 'A3',
      store,
    },
    {
      table_number: 'A4',
      store,
    },
    {
      table_number: 'A5',
      store,
    },
    {
      table_number: 'A6',
      store,
    },
    {
      table_number: 'A7',
      store,
    },
    {
      table_number: 'A8',
      store,
    },
    {
      table_number: 'A9',
      store,
    },
    {
      table_number: 'A10',
      store,
    },
    {
      table_number: 'A11',
      store,
    },
    {
      table_number: 'A12',
      store,
    },
    {
      table_number: 'A13',
      store,
    },
    {
      table_number: 'A14',
      store,
    },
    {
      table_number: 'A15',
      store,
    },
    {
      table_number: 'A16',
      store,
    },
  ])

  console.log('-----------> Categories and tables are inserted <-----------')

  return { categories }
}
