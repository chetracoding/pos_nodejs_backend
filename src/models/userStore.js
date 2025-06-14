import { Schema, model } from 'mongoose'

const scema = {
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    require: true,
  },
  store: {
    type: Schema.Types.ObjectId,
    ref: 'stores',
    require: true,
  },
}

const UserStore = model(
  'user_has_stores',
  new Schema(scema, {
    timestamps: false,
    versionKey: false,
  })
)

export default UserStore
