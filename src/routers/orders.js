import { Router } from 'express'
import orderService from '../services/orders.js'
import ensureFields from '../middleware/ensure-fields.js'
import ensurePermissions from '../middleware/ensure-roles.js'

export default function initRoutes() {
  const router = new Router()
  // router.get('/schema', services.getSchema)
  router.get(
    '/',
    ensurePermissions({ CASHIER: 'GET', CHEF: 'GET' }),
    orderService.filter
  )
  router.get(
    '/:id',
    ensurePermissions({ CASHIER: 'GET', CHEF: 'GET' }),
    ensureFields(
      {
        id: {
          notEmpty: true,
          isLength: { options: { max: 24, min: 24 } },
        },
      },
      { limitTo: ['params'] }
    ),
    orderService.getById
  )
  router.post(
    '/',
    ensurePermissions({ WAITER: 'POST' }),
    ensureFields(
      {
        table_id: {
          notEmpty: true,
          isString: { options: { max: 24, min: 24 } },
        },
        datetime: {
          notEmpty: true,
          toDate: true,
        },
        product_customizes: {
          optional: false,
          isArray: { options: { min: 1 } },
        },
        'product_customizes.*.product_customize_id': {
          notEmpty: true,
          isLength: {
            options: { max: 24, min: 24 },
          },
        },
        'product_customizes.*.quantity': {
          notEmpty: true,
          toInt: true,
          isInt: true,
        },
      },
      { limitTo: ['body'] }
    ),
    orderService.create
  )
  router.put(
    '/:id',
    ensurePermissions({ CASHIER: 'PUT', CHEF: 'PUT' }),
    ensureFields(
      {
        id: {
          notEmpty: true,
          isLength: { options: { min: 24, max: 24 } },
        },
        is_completed: {
          notEmpty: false,
          toBoolean: true,
          isBoolean: true,
        },
        is_paid: {
          notEmpty: false,
          toBoolean: true,
          isBoolean: true,
        },
      },
      { limitTo: ['params', 'body'] }
    ),
    orderService.update
  )
  // router.delete('/:id', orderService.destroy)
  return router
}
