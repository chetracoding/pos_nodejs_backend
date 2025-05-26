import models from '../models/index.js'
import Jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import transporter from '../common/mailer/index.js'
import { validRole } from '../utils/role.js'
import { snakeToCamel, getDefinedValues } from '../helpers/index.js'
const { user, roles } = models
export default {
  register,
  login,
  sendPwd,
  checkPwd,
  resetPwd,
  changePwd,
  mySelf,
  getStaff,
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
    const findRole = await roles.findById(role_id)
    if (findRole.name === 'admin' || findRole.name === 'restaurant_owner') {
      return res.status(400).send({ success: false, message: 'Bad request.' })
    }
    const userByEmail = await user.find({ email: email })
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
    const resUser = await user.create(params)
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
    const resUser = await user
      .findOne({ email: email })
      .select('+password')
      .populate({ path: 'store_id role_id' })
    if (resUser && (await bcrypt.compare(password, resUser.password))) {
      const { id, store_id, role_id } = resUser
      const token = Jwt.sign(
        {
          user_id: id,
          store_id: store_id.id,
          role_id: role_id.id,
          role_name: role_id.name,
        },
        'TOKEN-KEY',
        {
          expiresIn: '24h',
        }
      )
      resUser.password = 'hidden'
      const resObject = {
        success: true,
        user: resUser,
        token,
        message: 'Login is successful.',
      }
      return res.send(resObject)
    }
    res.status(404).send({ success: false, message: 'Invalid credentials.' })
  } catch (error) {
    res
      .status(500)
      .send({ success: false, message: 'Something wrong while logining.' })
  }
}

async function sendPwd(req, res) {
  const { email } = req.body
  const resUser = await user.findOne({ email: email })
  if (!resUser)
    return res.status(404).send({ success: false, message: 'Invalid email.' })
  try {
    const token = Jwt.sign(
      {
        email: email,
      },
      'EMAIL-KEY',
      {
        expiresIn: '5min',
      }
    )
    const mailOptions = {
      from: 'hongchetra12@gmail.com',
      to: email,
      subject: 'Booking Now | Recover Password Account',
      html: `
      <p>Please reset a new password for account <span style="font-weight: bold; text-decoration: none;">${email}</span>.</p>
      <button style="background: #F25657; border: none; border-radius: 10px; padding: 8px 16px;"><a style="text-decoration: none; color:white;" href="${process.env.CORE_URL}/reset_password/${token}">Reset Password</a></button>
      <br>
      <p>Thanks for using Booking Now.</p>
      <p>Sincerely yours,</p>
      <p style="font-weight: bold;">Booking Now</p>
      `,
    }
    await transporter.sendMail(mailOptions)
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
    await user.findOneAndUpdate(
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
    const resUser = await user.findById(req.user.user_id).select('+password')
    if (await bcrypt.compare(old_pwd, resUser.password)) {
      const encryptedPassword = await bcrypt.hash(new_pwd, 10)
      await user.findByIdAndUpdate(req.user.user_id, {
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
  const resUser = await user
    .findById(req.user.user_id)
    .populate({ path: 'role_id', select: '-createdAt -updatedAt -users' })
    .populate({ path: 'store_id', select: '-createdAt -updatedAt' })
  res.send({ success: true, data: resUser })
}

async function getStaff(req, res) {
  const resStaff = await user
    .find({
      store_id: req.user.store_id,
    })
    .populate({ path: 'role_id', select: '-createdAt -updatedA -users' })
  res.send({ success: true, data: resStaff })
}

async function updateStaff(req, res) {
  const findUser = await user.findById(req.params.id)
  if (!findUser)
    return res.status(404).send({ success: false, message: `Not Found.` })

  const { first_name, last_name, email, gender, image, password, role_id } =
    req.body
  const userByEmail = await user.find({ email: email })

  if (userByEmail.length > 0) {
    if (userByEmail[0].id !== req.params.id)
      return res.status(409).send({ success: false, message: 'Bad request.' })
  }
  const userObj = { first_name, last_name, email, gender }
  if (password) userObj.password = await bcrypt.hash(password, 10)
  if (image) userObj.image = image
  if (role_id) userObj.role_id = role_id
  const resUser = await user.findByIdAndUpdate(req.params.id, userObj)
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
  const resData = await user.findByIdAndDelete(req.params.id)
  if (!resData) {
    return res.status(404).send({ success: false, message: `Not Found.` })
  }
  return res
    .status(200)
    .send({ success: true, message: `User deleted successful.` })
}
