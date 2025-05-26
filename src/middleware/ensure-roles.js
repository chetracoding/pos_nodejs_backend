import { readFileSync } from 'node:fs'
import * as path from 'path'

export default function ensurePermissions(roles) {
  return function verifyRoles(req, res, next) {
    const permissionsConfig = JSON.parse(
      readFileSync(path.resolve(`${process.cwd()}/config/permissions.json`))
    )
    for (const key of Object.keys(roles)) {
      if (!permissionsConfig[key]) {
        throw new Error('Invalid value for using method ensurePermissions().')
      }
    }
    const role = req.user.role_name.toUpperCase()
    if (!roles[role])
      return res.status(403).send({ success: false, message: '403 Forbidden.' })
    next()
  }
}
