import { Schema, model } from 'mongoose'

const OnesignalSchema = {
  player_id: {
    type: String,
    maxlength: 250,
    require: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
}

const Onesignal = model(
  'onesignals',
  new Schema(OnesignalSchema, {
    timestamps: true,
    versionKey: false,
  })
)

export default Onesignal
