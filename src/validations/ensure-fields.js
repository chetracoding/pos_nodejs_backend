import { validationResult } from 'express-validator'
export default function ensureFields(req, res) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400)
    res.send(errors)
    return
  }
}
