import { Schema, model } from 'mongoose'

const RoleScema = {
  name: {
    type: String,
    maxlength: 50,
    require: true,
  },
  label: {
    type: String,
    maxlength: 50,
    require: true,
  },
}

const Role = model(
  'roles',
  new Schema(RoleScema, {
    timestamps: false,
    versionKey: false,
  })
)

export default Role
