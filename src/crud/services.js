import { model } from 'mongoose'
import models from '../models/index.js'
import { validRole } from '../utils/role.js'
const { products, orders, orderDetails } = models

export default function initServices(tableName, config) {
  const models = model(tableName)
  return { create, getAll, getById, update, destroy }
  async function getAll(req, res) {
    // await orders.deleteMany()
    // await orderDetails.deleteMany()
    const resData =
      tableName === 'roles'
        ? await models.find({
            name: { $nin: ['admin', 'restaurant_owner'] },
            disabled: false,
          })
        : await models
            .find({ store_id: req.user.store_id, disabled: false })
            .select('-store_id')
    res.send({
      success: true,
      message: `Get all ${tableName} successful.`,
      data: resData,
    })
  }
  async function getById(req, res) {
    if (req.params.id.length === 24) {
      const resData = await models.findById(req.params.id)
      if (!resData) {
        return res.status(404).send({ success: false, message: `Not Found.` })
      }
      return res.status(200).send({
        success: true,
        message: `Get ${tableName} successful.`,
        data: resData,
      })
    }
    res.status(400).send({ success: false, message: 'Bad request.' })
  }
  async function create(req, res) {
    const validRoleRe = validRole(req.user.role_name)
    if (!validRoleRe.success) return res.status(403).send(validRoleRe)
    const createData = req.body
    createData.store_id = req.user.store_id
    const resData = await models.create(createData)
    res.send({
      success: true,
      message: `${tableName} created successful.`,
      data: resData,
    })
  }
  async function update(req, res) {
    const validRoleRe = validRole(req.user.role_name)
    const id = tableName === 'stores' ? req.user.store_id : req.params.id
    if (!validRoleRe.success) return res.status(403).send(validRoleRe)
    if (id.length === 24) {
      const resData = await models.findByIdAndUpdate(id, req.body)
      if (!resData) {
        return res.status(404).send({ success: false, message: `Not Found.` })
      }
      return res.status(200).send({
        success: true,
        message: `${tableName} updated successful.`,
        data: await models.findById(id),
      })
    }
    res.status(400).send({ success: false, message: 'Bad request.' })
  }
  async function destroy(req, res) {
    const validRoleRe = validRole(req.user.role_name)
    if (!validRoleRe.success) return res.status(403).send(validRoleRe)
    if (req.params.id.length === 24) {
      const resData = await models.findByIdAndUpdate(req.params.id, {
        disabled: true,
      })
      if (!resData) {
        return res.status(404).send({ success: false, message: `Not Found.` })
      }
      if (tableName === 'categories') {
        await products.updateMany(
          { category_id: req.params.id },
          { disabled: true }
        )
      }
      return res
        .status(200)
        .send({ success: true, message: `${tableName} deleted successful.` })
    }
    res.status(400).send({ success: false, message: 'Bad request.' })
  }
}
