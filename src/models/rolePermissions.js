import { Schema, model } from 'mongoose'

const scema = {
  role: {
    type: Schema.Types.ObjectId,
    ref: 'roles',
    require: true,
  },
  permission: {
    type: Schema.Types.ObjectId,
    ref: 'permissions',
    require: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
  create: {
    type: Boolean,
    default: false,
  },
  update: {
    type: Boolean,
    default: false,
  },
  delete: {
    type: Boolean,
    default: false,
  },
}

const RolePermission = model(
  'role_has_permissions',
  new Schema(scema, {
    timestamps: false,
    versionKey: false,
  })
)

export default RolePermission
