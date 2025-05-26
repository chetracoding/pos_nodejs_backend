import models from '../models/index.js'
import mongoose from 'mongoose'
const { orders } = models
const ObjectId = mongoose.Types.ObjectId

export default {
  moneyReps,
  productReps,
}

async function moneyReps(req, res) {
  const resData = await orders.aggregate([
    {
      $match: {
        $and: [
          { store_id: new ObjectId(req.user.store_id), is_paid: true },
          {
            $expr: {
              $eq: [{ $year: '$datetime' }, Number(req.query.year)],
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'order_details',
        localField: '_id',
        foreignField: 'order_id',
        as: 'details',
      },
    },
    {
      $unwind: '$details',
    },
    {
      $lookup: {
        from: 'product_customizes',
        localField: 'details.product_customize_id',
        foreignField: '_id',
        as: 'product_customize',
      },
    },
    {
      $unwind: '$product_customize',
    },
    {
      $group: {
        _id: {
          year: { $year: '$datetime' },
          month: { $month: '$datetime' },
        },
        total_money: {
          $sum: {
            $multiply: ['$details.quantity', '$product_customize.price'],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        month: '$_id.month',
        total_money: 1,
      },
    },
    {
      $sort: {
        month: 1,
      },
    },
  ])
  res.send({
    success: true,
    message: `Get money reports successful.`,
    data: resData,
  })
}

async function productReps(req, res) {
  const resData = await orders.aggregate([
    {
      $match: {
        $and: [
          { store_id: new ObjectId(req.user.store_id), is_paid: true },
          {
            $expr: {
              $and: [
                { $eq: [{ $month: '$datetime' }, Number(req.query.month)] },
                { $eq: [{ $year: '$datetime' }, Number(req.query.year)] },
              ],
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'order_details',
        localField: '_id',
        foreignField: 'order_id',
        as: 'order_detail',
      },
    },
    {
      $unwind: '$order_detail',
    },
    {
      $lookup: {
        from: 'product_customizes',
        localField: 'order_detail.product_customize_id',
        foreignField: '_id',
        as: 'product_customize',
      },
    },
    {
      $unwind: '$product_customize',
    },
    {
      $lookup: {
        from: 'products',
        localField: 'product_customize.product_id',
        foreignField: '_id',
        as: 'product',
      },
    },
    {
      $unwind: '$product',
    },
    {
      $project: {
        product: '$product.name',
        product_total: '$order_detail.quantity',
      },
    },
    {
      $group: {
        _id: {
          year: '$year',
          month: '$month',
          product: '$product',
        },
        total_orders: {
          $sum: '$product_total',
        },
      },
    },
    {
      $project: {
        _id: 0,
        product_name: '$_id.product',
        total_orders: 1,
      },
    },
    {
      $sort: {
        total_orders: 1,
      },
    },
  ])
  res.send({
    success: true,
    message: `Get product reports successful.`,
    data: resData,
  })
}
