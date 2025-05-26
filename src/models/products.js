import { Schema, model } from 'mongoose'

const ProductScema = {
  name: {
    type: String,
    maxlength: 250,
    require: true,
  },
  product_code: {
    type: String,
    maxlength: 50,
    require: true,
  },
  description: {
    type: String,
    maxlength: 250,
    require: false,
  },
  image: {
    type: String,
    require: true,
  },
  is_active: {
    type: Boolean,
    require: true,
    default: false
  },
  store_id: {
    type: Schema.Types.ObjectId,
    ref: 'stores',
  },
  category_id: {
    type: Schema.Types.ObjectId,
    ref: 'categories',
  },
  product_customizes: [
    {
      type: Schema.Types.ObjectId,
      ref: 'product_customizes'
    },
  ],
  disabled: {
    type: Boolean,
    default: false,
    select: false
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
