import models from '../models/index.js'

const { Product, ProductCustomize } = models

export async function insertProducts(store, categories) {
  console.log('-----------> Inserting products, please wait... <-----------')

  const productsToCreate = [
    {
      store,
      category: categories[0]._id,
      name: 'Original Burger',
      product_code: 'C5',
      description: 'This is description.',
      image:
        'https://firebasestorage.googleapis.com/v0/b/vue-firebase-f1df3.appspot.com/o/IMG_7006.jpeg?alt=media&token=03c14bc1-9222-4d72-a4da-c6d12fffdd2a',
      is_active: true,
      product_customizes: [
        {
          size: 'Small',
          price: 5.99,
        },
        {
          size: 'Large',
          price: 9.99,
        },
      ],
    },
    {
      store,
      category: categories[0]._id,
      name: 'California Pizza',
      product_code: 'B10',
      description: 'This is description ',
      image:
        'https://firebasestorage.googleapis.com/v0/b/vue-firebase-f1df3.appspot.com/o/california-pizza.jpg?alt=media&token=c398e34f-1a2e-4c9d-aaa4-4995dbd8c3ba',
      is_active: true,
      product_customizes: [
        {
          size: 'Small',
          price: 5.99,
        },
        {
          size: 'Large',
          price: 9.99,
        },
      ],
    },
    {
      store,
      category: categories[0]._id,
      name: 'New York Pizza',
      product_code: 'D1',
      description: 'This is description.',
      image:
        'https://firebasestorage.googleapis.com/v0/b/vue-firebase-f1df3.appspot.com/o/new-york-pizza.jpg?alt=media&token=12983c4d-06be-470c-a9ee-aab4050b327f',
      is_active: true,
      product_customizes: [
        {
          size: 'Small',
          price: 5.99,
        },
        {
          size: 'Large',
          price: 9.99,
        },
      ],
    },
    {
      store,
      category: categories[0]._id,
      name: 'Cheese Pizza',
      product_code: 'B11',
      description: 'This is description.',
      image:
        'https://firebasestorage.googleapis.com/v0/b/vue-firebase-f1df3.appspot.com/o/IMG_7013.jpeg?alt=media&token=ad045fee-654b-445c-924f-f0c8eec27931',
      is_active: true,
      product_customizes: [
        {
          size: 'Small',
          price: 5.99,
        },
        {
          size: 'Large',
          price: 9.99,
        },
      ],
    },
  ]

  for (const { product_customizes, ...payload } of productsToCreate) {
    const newProduct = await Product.create(payload)

    const productCustomizesPayload = product_customizes.map((pc) => ({
      ...pc,
      product: newProduct.id,
    }))
    await ProductCustomize.insertMany(productCustomizesPayload)
  }

  console.log('-----------> Products are inserted <-----------')
}
