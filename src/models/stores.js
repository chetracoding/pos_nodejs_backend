import { Schema, model } from 'mongoose'

const scema = {
  name: {
    type: String,
    maxlength: 255,
    require: true,
  },
  street: {
    type: String,
    maxlength: 255,
    require: false,
  },
  city: {
    type: String,
    maxlength: 255,
    require: false,
  },
  disabled: {
    type: Boolean,
    default: false,
    select: false,
  },
}

const Store = model(
  'stores',
  new Schema(scema, {
    timestamps: true,
    versionKey: false,
  })
)

export default Store
