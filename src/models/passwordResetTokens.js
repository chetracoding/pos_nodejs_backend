import { Schema, model } from 'mongoose'

const PasswordResetTokenSchema = {
  email: {
    type: String,
    maxlength: 250,
    require: true,
  },
  token: {
    type: String,
    maxlength: 250,
    require: true,
  },
}

const PasswordResetToken = model(
  'password_reset_tokens',
  new Schema(PasswordResetTokenSchema, {
    timestamps: true,
    versionKey: false,
  })
)

export default PasswordResetToken
