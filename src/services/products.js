import { startSession, Types } from 'mongoose'
import { Double } from 'bson'
import models from '../models/index.js'
import { PROD_MODE } from '../constants/index.js'

const { Product, ProductCustomize } = models
export default {
  getAll,
  getById,
  create,
  update,
  destroy,
}

async function getAll(req, res) {
  const params = { store: req.user.store_id, disabled: false }

  // if (req.user.role_name === 'waiter') {
  //   params.is_active = true
  // }

  const products = await Product.find(params).populate({
    path: 'category',
    select: '_id name',
  })
  const data = await Promise.all(
    products.map(async (product) => {
      const product_customizes = await ProductCustomize.find({
        product: product.id,
        disabled: false,
      }).select('_id size price')
      return {
        ...product.toJSON(),
        product_customizes,
      }
    })
  )

  res.send({
    success: true,
    message: `Get all products successful.`,
    data,
  })
}

async function getById(req, res) {
  const product = await Product.findOne({
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
    const { store_id } = req.user
    const { category_id, ...payload } = req.body
    const productPayload = {
      ...payload,
      category: category_id,
      store: store_id,
    }

    const newProduct = await Product.create([productPayload], {
      ...(PROD_MODE && { session }),
    })
    const prodCusPayloads = req.body.product_customizes.map((pc) => ({
      product: newProduct[0]._id,
      ...pc,
    }))

    await ProductCustomize.insertMany(prodCusPayloads, {
      ...(PROD_MODE && { session }),
    })

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
  const { product_customizes, category_id, ...payload } = body
  const { id: product_id } = params

  try {
    const product = await Product.findOne({
      _id: product_id,
      store: user.store_id,
      disabled: false,
    })
    if (!product) {
      return res
        .status(404)
        .send({ success: false, message: `No prouct found` })
    }

    await Product.findByIdAndUpdate(
      product_id,
      { ...payload, category: category_id },
      {
        ...(PROD_MODE && { session }),
      }
    )

    await ProductCustomize.updateMany(
      {
        _id: {
          $nin: product_customizes.map(
            ({ product_customize_id }) => product_customize_id
          ),
        },
        product_id,
      },
      { $set: { disabled: true } },
      { ...(PROD_MODE && { session }) }
    )

    for (const prodCus of product_customizes) {
      const { product_customize_id, price, size } = prodCus
      const customizePayload = {
        size,
        price,
      }

      // Update product customize
      if (product_customize_id) {
        await ProductCustomize.findByIdAndUpdate(
          product_customize_id,
          customizePayload,
          { ...(PROD_MODE && { session }) }
        )
      } else {
        // Create product customize
        await ProductCustomize.create({
          ...customizePayload,
          product,
        })
      }
    }

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
  const product = await Product.findOneAndUpdate(
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
