import models from '../models/index.js'

const { User, Role, UserRole, UserStore } = models

export default {
  getUsers,
  createUser,
}

async function getUsers(req, res) {
  const usersInStore = await UserStore.find({
    store: req.user.store_id,
  }).select('-_id -store')
  const users = await User.find({
    _id: {
      $in: usersInStore.map(({ user }) => user),
    },
  })
  const data = await Promise.all(
    users.map(async (user) => {
      const { role } = await UserRole.findOne({ user: user.id }).populate(
        'role'
      )
      return {
        ...user.toJSON(),
        role,
      }
    })
  )

  res.send({ success: true, data })
}

async function createUser({ role_name, store_id, ...payload }) {
  const user = await User.create(payload)
  const role = await Role.findOne({ name: role_name })

  await UserRole.create({
    user: user._id,
    role: role._id,
  })
  await UserStore.create({
    user: user._id,
    store: store_id,
  })
}
