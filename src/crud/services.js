import { model, startSession } from 'mongoose'
import models from '../models/index.js'
import { validRole } from '../utils/role.js'
import { PROD_MODE } from '../constants/index.js'
import { ROLE_NAME } from '../constants/index.js'
import { paginate } from '../utils/paginate.js'

const { Product } = models

export default function initServices(tableName, config) {
  const models = model(tableName)
  return { create, getAll, getById, update, destroy }
  async function getAll(req, res) {
    const { store_id } = req.user
    const { sort, filter } = req.query
    const { skip, limit } = paginate(req.query)
    const filters = {
      disabled: false,
      ...(tableName === 'roles' && { name: { $nin: [ROLE_NAME.SUPER_ADMIN] } }),
      ...(tableName !== 'roles' && { store: store_id }),
      ...(filter && { ...filter }),
    }

    const [rows, count] = await Promise.all([
      models
        .find(filters)
        .skip(skip)
        .limit(limit)
        .sort(sort || {}),
      models.countDocuments(filters),
    ])

    res.send({
      success: true,
      message: `Get all ${tableName} successful.`,
      data: { count, rows },
    })
  }

  async function getById(req, res) {
    const { id } = req.params

    if (id.length !== 24) {
      return res.status(400).send({ success: false, message: 'Bad request.' })
    }

    const data = await models.findById(id)
    if (!data) {
      return res.status(404).send({ success: false, message: `Not Found.` })
    }

    return res.status(200).send({
      success: true,
      data,
    })
  }

  async function create(req, res) {
    const session = await startSession()
    session.startTransaction()

    try {
      const validRoleRe = validRole(req.user.role_name)
      if (!validRoleRe.success) return res.status(403).send(validRoleRe)

      const payload = req.body
      payload.store_id = req.user.store_id
      await models.create([payload], { ...(PROD_MODE && { session }) })

      await session.commitTransaction()
      res.send({
        success: true,
      })
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  async function update(req, res) {
    const session = await startSession()
    session.startTransaction()

    try {
      const validRoleRe = validRole(req.user.role_name)
      const id = tableName === 'stores' ? req.user.store_id : req.params.id
      if (!validRoleRe.success) return res.status(403).send(validRoleRe)

      if (id.length !== 24) {
        return res.status(400).send({ success: false, message: 'Bad request.' })
      }

      const resData = await models.findByIdAndUpdate(id, req.body, {
        ...(PROD_MODE && { session }),
      })
      if (!resData) {
        return res.status(404).send({ success: false, message: `Not Found.` })
      }

      await session.commitTransaction()
      res.status(200).send({
        success: true,
      })
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  async function destroy(req, res) {
    const session = await startSession()
    session.startTransaction()
    const { id } = req.params

    try {
      const validRoleRe = validRole(req.user.role_name)
      if (!validRoleRe.success) return res.status(403).send(validRoleRe)

      if (id.length !== 24) {
        return res.status(400).send({ success: false, message: 'Bad request.' })
      }

      const resData = await models.findByIdAndUpdate(
        id,
        {
          disabled: true,
        },
        { ...(PROD_MODE && { session }) }
      )
      if (!resData) {
        return res.status(404).send({ success: false, message: `Not Found.` })
      }

      if (tableName === 'categories') {
        await Product.updateMany(
          { category_id: id },
          { disabled: true },
          { ...(PROD_MODE && { session }) }
        )
      }

      await session.commitTransaction()
      res.status(200).send({
        success: true,
      })
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }
}
