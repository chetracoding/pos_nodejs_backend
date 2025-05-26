import { Schema, model } from 'mongoose'

const TableScema = {
  table_number: {
    type: String,
    maxlength: 20,
    require: true,
  },
  store_id: {
    type: Schema.Types.ObjectId,
    ref: 'stores',
  },
  disabled: {
    type: Boolean,
    default: false,
    select: false
  },
}

const Table = model(
  'tables',
  new Schema(TableScema, {
    timestamps: true,
    versionKey: false,
  })
)

export default Table
