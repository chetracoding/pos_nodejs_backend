import { Schema, model } from 'mongoose'

const PermissionScema = {
  name: {
    type: String,
    maxlength: 255,
    require: true,
  },
}

const Permission = model(
  'permissions',
  new Schema(PermissionScema, {
    timestamps: false,
    versionKey: false,
  })
)

export default Permission
