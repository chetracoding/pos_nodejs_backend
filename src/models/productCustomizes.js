import { Schema, model } from 'mongoose'

const ProductCustomizeScema = {
  size: {
    type: String,
    maxlength: 50,
    require: true,
  },
  price: {
    type: Number,
    require: true,
  },
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'products',
  },
}

const ProductCustomize = model(
  'product_customizes',
  new Schema(ProductCustomizeScema, {
    timestamps: true,
    versionKey: false,
  })
)

export default ProductCustomize
