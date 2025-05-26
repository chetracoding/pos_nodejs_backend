import { Schema, model } from 'mongoose'

const CategoryScema = {
  name: {
    type: String,
    maxlength: 100,
    require: true,
  },
  store_id: {
    type: Schema.Types.ObjectId,
    ref: 'stores',
  },
  disabled: {
    type: Boolean,
    default: false,
    select: false
  },
}

const Category = model(
  'categories',
  new Schema(CategoryScema, {
    timestamps: true,
    versionKey: false,
  })
)

export default Category
