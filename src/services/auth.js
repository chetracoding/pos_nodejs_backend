import models from '../models/index.js'
import Jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { mailTransporter } from '../utils/mailer.js'

const { User, UserStore, UserRole, RolePermission } = models

export default {
  register,
  login,
  sendPwd,
  checkPwd,
  resetPwd,
  changePwd,
  mySelf,
  updateStaff,
  deleteStaff,
}

async function register(req, res) {
  try {
    // if (!req.body.password) {
    //   return res
    //     .status(400)
    //     .send({ success: false, field: 'password', type: 'isNull' })
    // }
    const { first_name, last_name, email, gender, password, role_id } = req.body
    const findRole = await User.findById(role_id)
    if (findRole.name === 'admin' || findRole.name === 'restaurant_owner') {
      return res.status(400).send({ success: false, message: 'Bad request.' })
    }
    const userByEmail = await User.find({ email: email })
    if (userByEmail.length > 0) {
      return res.status(409).send({ success: false, message: 'Bad request.' })
    }
    const encryptedPassword = await bcrypt.hash(password, 10)
    const params = {
      first_name,
      last_name,
      email,
      gender,
      password: encryptedPassword,
      role_id,
      store_id:
        req.user.role_name === 'admin' ? req.body.store_id : req.user.store_id,
    }
    const resUser = await User.create(params)
    const token = Jwt.sign(
      {
        user_id: resUser.id,
        store_id: params.store_id,
        role_id: params.role_id,
      },
      'TOKEN-KEY',
      {
        expiresIn: '24h',
      }
    )
    const resObject = {
      success: true,
      message: 'Regiter is successful.',
      user: {
        _id: resUser.id,
        first_name,
        last_name,
        email,
        gender,
        role_id,
        store_id: params.store_id,
      },
      token,
    }
    res.send(resObject)
  } catch (error) {
    res.status(400).send(errorObject)
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email: email }).select('+password')

    if (!user || (user && !(await bcrypt.compare(password, user.password)))) {
      return res
        .status(404)
        .send({ success: false, message: 'Invalid email address or password' })
    }

    const { store } = await UserStore.findOne({
      user: user._id,
    }).populate('store')
    if (!store) {
      return res
        .status(400)
        .send({ success: false, message: "User doesn't has store" })
    }

    const { role } = await UserRole.findOne({
      user: user.id,
    }).populate('role')
    if (!role) {
      return res
        .status(400)
        .send({ success: false, message: "User doesn't has role" })
    }

    const permissions = await RolePermission.find({ role: role.id })
      .select('-_id -role')
      .populate({ path: 'permission', select: '-_id +name' })

    const token = Jwt.sign(
      {
        user_id: user.id,
        store_id: store.id,
        role: role,
      },
      'TOKEN-KEY',
      {
        expiresIn: '24h',
      }
    )

    const userData = user.toJSON()
    delete userData.password

    const data = {
      success: true,
      data: {
        user: userData,
        store,
        role,
        permissions,
      },
      token,
      message: 'Login is successful.',
    }

    return res.send(data)
  } catch (error) {
    throw error
  }
}

async function sendPwd(req, res) {
  const { email } = req.body
  const resUser = await User.findOne({ email: email })
  if (!resUser)
    return res.status(404).send({ success: false, message: 'Invalid email.' })

  try {
    const token = Jwt.sign(
      {
        email: email,
      },
      'EMAIL-KEY',
      {
        expiresIn: '20min',
      }
    )
    const restLink = `${process.env.APP_FRONTEND_URL}/reset_password/${token}`
    const mailOptions = {
      from: `"POS System" <${process.env.MAIL_ADDRESS_FROM}>`,
      to: email,
      subject: 'Reset Password Account',
      html: `
      <p>Dear <strong>${resUser.first_name} ${resUser.last_name}</strong>,</p>

      <p>We received a request to reset your password. Please click the link below to proceed with resetting your password:</p>

      <p>Reset password link: <strong><a href="${restLink}">click here</a></strong></p>

      <p>If you did not request this, please ignore this email.</p>

      <p>For security reasons, do not share this link with anyone.</p>

      <p>Best regards,</p>
      <p><strong>POS System</strong></p>
      <p>supports@pos.com</p>
      `,
    }

    await mailTransporter.sendMail(mailOptions)
    res.send({ success: true, message: 'Send email successful.' })
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: 'Something wrong while sending email.' })
  }
}

async function checkPwd(req, res) {
  try {
    const { token } = req.body
    const decode = Jwt.verify(token, 'EMAIL-KEY')
    res.send({
      success: true,
      message: `Found email successful.`,
      data: {
        email: decode.email,
      },
    })
  } catch (error) {
    res.status(404).send({ success: false, message: 'Invalid token.' })
  }
}

async function resetPwd(req, res) {
  try {
    const { token, password } = req.body
    const decode = Jwt.verify(token, 'EMAIL-KEY')
    const encryptedPassword = await bcrypt.hash(password, 10)
    await User.findOneAndUpdate(
      { email: decode.email },
      { password: encryptedPassword }
    )
    res.send({
      success: true,
      message: `Change password for ${decode.email} successful.`,
    })
  } catch (error) {
    res.status(404).send({ success: false, message: 'Invalid token.' })
  }
}

async function changePwd(req, res) {
  try {
    const { old_pwd, new_pwd } = req.body
    const resUser = await User.findById(req.user.user_id).select('+password')
    if (await bcrypt.compare(old_pwd, resUser.password)) {
      const encryptedPassword = await bcrypt.hash(new_pwd, 10)
      await User.findByIdAndUpdate(req.user.user_id, {
        password: encryptedPassword,
      })
      return res.send({
        success: true,
        message: `Change password successful.`,
      })
    }
    res.status(400).send({
      success: false,
      message: 'Bad request.',
    })
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Something wrong while changing password.',
    })
  }
}

async function mySelf(req, res) {
  const user = await User.findById(req.user.user_id)
  if (!user) {
    return res.status(403).send({ success: false, message: '403 Forbidden.' })
  }

  const { store } = await UserStore.findOne({
    user: user._id,
  }).populate('store')
  if (!store) {
    return res
      .status(400)
      .send({ success: false, message: "User doesn't has store" })
  }

  const { role } = await UserRole.findOne({
    user: user.id,
  }).populate('role')
  if (!role) {
    return res
      .status(400)
      .send({ success: false, message: "User doesn't has role" })
  }

  const permissions = await RolePermission.find({ role: role.id })
    .select('-_id -role')
    .populate({ path: 'permission', select: '-_id +name' })

  res.send({ success: true, data: { user, store, role, permissions } })
}

async function updateStaff(req, res) {
  const findUser = await User.findById(req.params.id)
  if (!findUser)
    return res.status(404).send({ success: false, message: `Not Found.` })

  const { first_name, last_name, email, gender, image, password, role_id } =
    req.body
  const userByEmail = await User.find({ email: email })

  if (userByEmail.length > 0) {
    if (userByEmail[0].id !== req.params.id)
      return res.status(409).send({ success: false, message: 'Bad request.' })
  }
  const userObj = { first_name, last_name, email, gender }
  if (password) userObj.password = await bcrypt.hash(password, 10)
  if (image) userObj.image = image
  if (role_id) userObj.role_id = role_id
  const resUser = await User.findByIdAndUpdate(req.params.id, userObj)
  Object.keys(userObj).forEach((key) => {
    resUser[key] = userObj[key]
  })

  res.send({
    success: true,
    message: 'User updated successful.',
    data: resUser,
  })
}

async function deleteStaff(req, res) {
  const resData = await User.findByIdAndDelete(req.params.id)
  if (!resData) {
    return res.status(404).send({ success: false, message: `Not Found.` })
  }

  res.status(200).send({ success: true, message: `User deleted successful.` })
}
