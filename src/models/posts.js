import { Schema, model } from 'mongoose'

const PostsScema = {
  // id: {
  //   type: DataTypes.INTEGER,
  //   autoIncrement: true,
  //   allowNull: false,
  //   primaryKey: true,
  //   unique: true,
  // },
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: false,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  createdDate: {
    type: Date,
    alias: 'date_creation'
  },
  updatedAt: {
    type: Date,
    alias: 'date_modification'
  },
}
const Posts = model(
  'posts',
  new Schema(PostsScema, {
    timestamps: true,
    versionKey: false
  })
)

export default Posts
