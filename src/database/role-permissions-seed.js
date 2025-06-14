import { readFileSync } from 'node:fs'
import * as path from 'path'
import models from '../models/index.js'
import { ROLE_NAMES, PERMISSION_NAMES } from '../constants/index.js'

const { Role, Permission, RolePermission } = models

export async function insertRolePermissions() {
  console.log(
    '-----------> Inserting role permissions, please wait... <-----------'
  )

  await Role.insertMany(ROLE_NAMES)
  await Permission.insertMany(PERMISSION_NAMES)

  const permissionsConfig = JSON.parse(
    readFileSync(path.resolve(`${process.cwd()}/config/permissions.json`))
  )

  for (const key of Object.keys(permissionsConfig)) {
    const roleConfig = permissionsConfig[key]
    const role = await Role.findOne({ name: key })

    for (const permissionKey of Object.keys(roleConfig.permissions)) {
      const permission = await Permission.findOne({ name: permissionKey })

      const allows = roleConfig.permissions[permissionKey]
      const permissionCan = {
        read: false,
        create: false,
        update: false,
        delete: false,
      }

      if (allows.includes('ALL')) {
        // Set all permissions to true
        Object.keys(permissionCan).forEach((key) => {
          permissionCan[key] = true
        })
      } else {
        // Set only the specified permissions to true
        allows.forEach((key) => {
          if (permissionCan.hasOwnProperty(key)) {
            permissionCan[key] = true
          }
        })
      }

      await RolePermission.create({
        role: role._id,
        permission: permission._id,
        ...permissionCan,
      })
    }
  }

  console.log('-----------> Role permissions are inserted <-----------')
}
