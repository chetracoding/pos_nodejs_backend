import { startSession, Types } from 'mongoose'
import models from '../models/index.js'

const { products, productCustomizes } = models
export default {
  getAll,
  getById,
  create,
  update,
  destroy,
}

async function getAll(req, res) {
  const params = { store_id: req.user.store_id, disabled: false }

  if (req.user.role_name === 'waiter') {
    params.is_active = true
  }

  const data = await products
    .find(params)
    .populate('category_id')
    .populate({
      path: 'product_customizes',
      match: { disabled: false },
    })

  res.send({
    success: true,
    message: `Get all products successful.`,
    data,
  })
}

async function getById(req, res) {
  const product = await products.findOne({
    _id: req.params.id,
    store_id: req.user.store_id,
    disabled: false,
  })

  if (!product) {
    return res.status(404).send({ success: false, message: `Not Found.` })
  }

  return res.status(200).send({
    success: true,
    message: `Get product successful.`,
    data: product,
  })
}

async function create(req, res) {
  const session = await startSession()
  session.startTransaction()

  try {
    const productPayload = { ...req.body }
    productPayload.store_id = req.user.store_id
    productPayload.product_customizes = []

    const newProduct = await products.create([productPayload], { session })
    req.body._id = newProduct.id

    for (const prodCus of req.body.product_customizes) {
      prodCus.product_id = newProduct.id
      const newProdCus = await productCustomizes.create([prodCus], { session })
      productPayload.product_customizes.push(newProdCus.id)
    }

    await products.findByIdAndUpdate(
      newProduct.id,
      {
        product_customizes: productPayload.product_customizes,
      },
      { session }
    )

    await session.commitTransaction()

    res.send({
      success: true,
      message: `Product created successful.`,
    })
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

async function update(req, res) {
  const session = await startSession()
  session.startTransaction()
  const { params, body, user } = req
  const { id: product_id } = params

  try {
    const product = await products.findOne({
      _id: product_id,
      store_id: user.store_id,
      disabled: false,
    })
    if (!product) {
      return res.status(404).send({ success: false, message: `Not Found.` })
    }

    await productCustomizes.updateMany(
      {
        _id: {
          $nin: body.product_customizes.map(
            ({ product_customize_id }) => product_customize_id
          ),
        },
        product_id,
      },
      { $set: { disabled: true } },
      { session }
    )

    for (const prodCus of body.product_customizes) {
      const { product_customize_id, price, size } = prodCus
      const customizePayload = {
        size,
        price: Number(price),
      }

      // Update product customize
      if (product_customize_id) {
        await productCustomizes.findByIdAndUpdate(
          product_customize_id,
          customizePayload,
          { session }
        )
      } else {
        // Create product customize
        const newProdCus = await productCustomizes.create({
          ...customizePayload,
          product_id,
        })
        product.product_customizes.push(newProdCus.id)
      }
    }

    body.product_customizes = product.product_customizes
    await products.findByIdAndUpdate(product_id, body, { session })

    await session.commitTransaction()
    return res.status(200).send({
      success: true,
      message: `Product updated successful.`,
    })
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

async function destroy(req, res) {
  const product = await products.findOneAndUpdate(
    {
      _id: req.params.id,
      store_id: req.user.store_id,
      disabled: false,
    },
    {
      disabled: true,
    }
  )
  if (!product) {
    return res.status(404).send({ success: false, message: `Not Found.` })
  }
  return res
    .status(200)
    .send({ success: true, message: `Product deleted successful.` })
}
