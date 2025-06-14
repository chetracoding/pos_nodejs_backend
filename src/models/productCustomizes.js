import { Schema, model } from 'mongoose'

const ProductCustomizeScema = {
  size: {
    type: String,
    maxlength: 50,
    require: true,
  },
  price: {
    type: Schema.Types.Double,
    require: true,
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'products',
    require: true,
  },
  disabled: {
    type: Boolean,
    default: false,
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
