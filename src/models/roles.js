import { Schema, model } from 'mongoose'

const RoleScema = {
  name: {
    type: String,
    maxlength: 20,
    require: true,
  },
  disabled: {
    type: Boolean,
    default: false,
    select: false
  },
}

const Role = model(
  'roles',
  new Schema(RoleScema, {
    timestamps: true,
    versionKey: false,
  })
)

export default Role
