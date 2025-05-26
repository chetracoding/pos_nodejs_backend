import { Schema, model } from 'mongoose'

const UserScema = {
  first_name: {
    type: String,
    maxlength: 250,
    require: true,
  },
  last_name: {
    type: String,
    maxlength: 250,
    require: true,
  },
  email: {
    type: String,
    maxlength: 250,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
    select: false
  },
  gender: {
    type: String,
    maxlength: 6,
    require: true,
  },
  image: {
    type: String,
    require: false,
  },
  store_id: {
    type: Schema.Types.ObjectId,
    ref: 'stores',
  },
  role_id: {
    type: Schema.Types.ObjectId,
    ref: 'roles',
  },
  // posts: [
  //   {
  //     type: Schema.Types.ObjectId,
  //     ref: 'posts',
  //     select: false
  //   },
  // ],
}
const User = model(
  'users',
  new Schema(UserScema, {
    timestamps: true,
    versionKey: false,
    createdAt: 'date_creation',
  })
)

export default User
