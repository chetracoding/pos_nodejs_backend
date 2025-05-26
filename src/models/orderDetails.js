import { Schema, model } from 'mongoose'

const OrderDetailScema = {
  quantity: {
    type: Number,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  product_customize_id: {
    type: Schema.Types.ObjectId,
    ref: 'product_customizes',
  },
  order_id: {
    type: Schema.Types.ObjectId,
    ref: 'orders',
  },
}

const OrderDetail = model(
  'order_details',
  new Schema(OrderDetailScema, {
    timestamps: true,
    versionKey: false,
  })
)

export default OrderDetail
