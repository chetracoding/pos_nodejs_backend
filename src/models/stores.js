import { Schema, model } from 'mongoose'

const StoreScema = {
  name: {
    type: String,
    maxlength: 250,
    require: true,
  },
  street: {
    type: String,
    maxlength: 250,
    require: true,
  },
  city: {
    type: String,
    maxlength: 250,
    require: true,
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: 'users',
      select: false
    },
  ],
  disabled: {
    type: Boolean,
    default: false,
    select: false
  },
}
const Store = model(
  'stores',
  new Schema(StoreScema, {
    timestamps: true,
    versionKey: false,
  })
)

export default Store
