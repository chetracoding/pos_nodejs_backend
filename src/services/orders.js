import models from '../models/index.js'

const { ProductCustomize, Order, OrderDetail } = models

export default {
  filter,
  getById,
  create,
  update,
}

async function filter(req, res) {
  const options = {
    store_id: req.user.store_id,
  }
  if (req.query.is_completed) {
    options.is_completed = req.query.is_completed == 'true' ? true : false
  }
  if (req.query.is_paid) {
    options.is_paid = req.query.is_paid == 'true' ? true : false
  }

  const resData = await Order.find(options)
    .populate({ path: 'table_id order_details', select: '_id table_number' })
    .populate({ path: 'store_id', select: '_id name' })
    .populate({
      path: 'order_details',
      select: '-createdAt -updatedAt -order_id',
      populate: {
        path: 'product_customize_id',
        select: '-createdAt -updatedAt',
        populate: {
          path: 'product',
          select: '-product_customizes -store -createdAt -updatedAt',
        },
      },
    })
    .sort({ createdAt: -1 })

  res.send({
    success: true,
    message: 'Get all orders successful.',
    data: resData,
  })
}

async function getById(req, res) {
  const resData = await Order.findById(req.params.id)
    .populate({ path: 'table_id order_details', select: '_id table_number' })
    .populate({
      path: 'order_details',
      select: '-createdAt -updatedAt -order_id',
      populate: {
        path: 'product_customize_id',
        select: '-createdAt -updatedAt',
        populate: {
          path: 'product_id',
          select: '-product_customizes -store_id -createdAt -updatedAt',
        },
      },
    })
  if (!resData) {
    return res.status(404).send({ success: false, message: `Not Found.` })
  }
  return res.status(200).send({
    success: true,
    message: `Get order successful.`,
    data: resData,
  })
}

async function create(req, res) {
  const { table_id, datetime, product_customizes } = req.body
  const orderCreate = {
    is_completed: false,
    is_paid: false,
    datetime,
    table_id,
    store_id: req.user.store_id,
  }
  const resOrder = await Order.create(orderCreate)
  const orderDetIds = []
  for (const { product_customize_id, quantity } of product_customizes) {
    const redProdCus = await ProductCustomize.findById(product_customize_id)
    const orderDetCreate = {
      quantity,
      price: redProdCus.price * quantity,
      product_customize_id,
      order_id: resOrder.id,
    }
    const resOrderDet = await OrderDetail.create(orderDetCreate)
    orderDetIds.push(resOrderDet.id)
  }
  await Order.findByIdAndUpdate(resOrder.id, { order_details: orderDetIds })

  res.send({
    success: true,
    message: `products created successful.`,
    data: req.body,
  })
}
async function update(req, res) {
  const resOrd = await Order.findOne({
    _id: req.params.id,
    store_id: req.user.store_id,
  })
    .populate({ path: 'table_id order_details', select: '_id table_number' })
    .populate({
      path: 'order_details',
      select: '-createdAt -updatedAt -order_id',
      populate: {
        path: 'product_customize_id',
        select: '-createdAt -updatedAt',
        populate: {
          path: 'product_id',
          select: '-product_customizes -store_id -createdAt -updatedAt',
        },
      },
    })
  if (!resOrd) {
    return res.status(404).send({ success: false, message: `Not Found.` })
  }
  const options = {
    is_completed:
      req.body.is_completed !== undefined
        ? req.body.is_completed
        : resOrd.is_completed,
    is_paid: req.body.is_paid !== undefined ? req.body.is_paid : resOrd.is_paid,
  }
  await Order.findByIdAndUpdate(req.params.id, options)
  resOrd.is_completed = options.is_completed
  resOrd.is_paid = options.is_paid

  res.status(200).send({
    success: true,
    message: `products updated successful.`,
    data: resOrd,
  })
}
