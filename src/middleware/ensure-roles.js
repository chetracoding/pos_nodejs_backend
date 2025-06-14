import models from '../models/index.js'

const { RolePermission } = models

export default function ensurePermissions(requirements) {
  return async function verifyRoles(req, res, next) {
    const permissions =
      (await RolePermission.find({ role: req.user.role._id })
        .select('-_id -role')
        .populate({
          path: 'permission',
          select: '-_id +name',
        })) || []

    if (userCan({ permissions, requirements })) {
      return next()
    }

    res.status(403).send({ success: false, message: '403 Forbidden.' })
  }
}

function userCan({ permissions, requirements }) {
  const permissionName = Object.keys(requirements)[0]
  const permission = permissions.find(
    ({ permission }) => permission.name == permissionName
  )
  if (!permission) return false

  return permission[requirements[permissionName]]
}
