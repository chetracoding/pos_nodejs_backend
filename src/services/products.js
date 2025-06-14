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

  if (req.user.role_name === 'waiter') {
    params.is_active = true
  }

  const data = await Product.find(params).populate('category')
  // .populate({
  //   path: 'product_customizes',
  //   match: { disabled: false },
  // })

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
    console.log(req.body)
    const { store_id } = req.user
    const { category_id, ...payload } = req.body
    const productPayload = {
      ...payload,
      category: category_id,
      store: store_id,
    }

    // productPayload.store_id = req.user.store_id
    // productPayload.product_customizes = []

    const newProduct = await Product.create([productPayload], {
      ...(PROD_MODE && { session }),
    })

    // req.body._id = newProduct.id

    // for (const prodCus of req.body.product_customizes) {
    //   prodCus.product = newProduct.id
    //   productPayload.product_customizes.push(newProdCus.id)
    // }

    const prodCusPayloads = req.body.product_customizes.map((pc) => ({
      product: newProduct[0]._id,
      ...pc,
    }))

    await ProductCustomize.insertMany(prodCusPayloads, {
      ...(PROD_MODE && { session }),
    })

    // await Product.findByIdAndUpdate(
    //   newProduct.id,
    //   {
    //     product_customizes: productPayload.product_customizes,
    //   },
    //   { ...(PROD_MODE && { session }) }
    // )

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
    const product = await Product.findOne({
      _id: product_id,
      store_id: user.store_id,
      disabled: false,
    })
    if (!product) {
      return res.status(404).send({ success: false, message: `Not Found.` })
    }

    await ProductCustomize.updateMany(
      {
        _id: {
          $nin: body.product_customizes.map(
            ({ product_customize_id }) => product_customize_id
          ),
        },
        product_id,
      },
      { $set: { disabled: true } },
      { ...(PROD_MODE && { session }) }
    )

    for (const prodCus of body.product_customizes) {
      const { product_customize_id, price, size } = prodCus
      const customizePayload = {
        size,
        price: new Double(price),
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
        const newProdCus = await ProductCustomize.create({
          ...customizePayload,
          product_id,
        })
        product.product_customizes.push(newProdCus.id)
      }
    }

    body.product_customizes = product.product_customizes
    await Product.findByIdAndUpdate(product_id, body, {
      ...(PROD_MODE && { session }),
    })

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
