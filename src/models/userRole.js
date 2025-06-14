import { Schema, model } from 'mongoose'

const scema = {
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    require: true,
  },
  role: {
    type: Schema.Types.ObjectId,
    ref: 'roles',
    require: true,
  },
}

const UserRole = model(
  'user_has_roles',
  new Schema(scema, {
    timestamps: false,
    versionKey: false,
  })
)

export default UserRole
