import { Router } from 'express'
import initServices from './services.js'
import ensureFields from '../middleware/ensure-fields.js'

export default function initRoutes(tableName, config) {
  const router = new Router()
  const services = initServices(tableName, config)
  // router.get('/schema', services.getSchema)
  router.get('/', services.getAll)
  router.get(
    '/:id',
    ensureFields(
      {
        id: {
          notEmpty: true,
          isLength: { options: { max: 24, min: 24 } },
        },
      },
      { limitTo: ['params'] }
    ),
    services.getById
  )
  router.post(
    '/',
    ensureFields(
      {
        ...config.rules,
      },
      { limitTo: ['body'] }
    ),
    services.create
  )
  router.put(
    '/:id',
    ensureFields(
      {
        id: {
          notEmpty: true,
          isLength: { options: { max: 24, min: 24 } },
        },
        ...config.rules,
      },
      { limitTo: ['params', 'body'] }
    ),
    services.update
  )
  router.delete(
    '/:id',
    ensureFields(
      {
        id: {
          notEmpty: true,
          isLength: { options: { max: 24, min: 24 } },
        },
      },
      { limitTo: ['params'] }
    ),
    services.destroy
  )
  return router
}
