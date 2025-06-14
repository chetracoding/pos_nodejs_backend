import { Schema, model } from 'mongoose'

const ProductScema = {
  name: {
    type: String,
    maxlength: 255,
    require: true,
  },
  product_code: {
    type: String,
    maxlength: 255,
    require: true,
  },
  description: {
    type: String,
    maxlength: 255,
    require: false,
  },
  image: {
    type: String,
    maxlength: 255,
    require: true,
  },
  is_active: {
    type: Boolean,
    require: true,
    default: true,
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'stores',
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'categories',
  },
  // product_customizes: [
  //   {
  //     type: Schema.Types.ObjectId,
  //     ref: 'product_customizes'
  //   },
  // ],
  disabled: {
    type: Boolean,
    default: false,
    select: false,
  },
}

const Product = model(
  'products',
  new Schema(ProductScema, {
    timestamps: true,
    versionKey: false,
  })
)

export default Product
