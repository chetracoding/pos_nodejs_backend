import { Router } from 'express'
import reportService from '../services/reports.js'
import ensureFields from '../middleware/ensure-fields.js'
import ensurePermissions from '../middleware/ensure-roles.js'

export default function initRoutes() {
  const router = new Router()

  router.get(
    '/money',
    ensurePermissions({ RESTAURANT_OWNER: 'GET' }),
    ensureFields(
      {
        year: {
          notEmpty: true,
          toInt: true,
          isInt: true,
        },
      },
      { limitTo: ['query'] }
    ),
    reportService.moneyReps
  )
  router.get(
    '/product',
    ensurePermissions({ RESTAURANT_OWNER: 'GET' }),
    ensureFields(
      {
        month: {
          notEmpty: true,
          toInt: true,
          isInt: true,
        },
        year: {
          notEmpty: true,
          toInt: true,
          isInt: true,
        },
      },
      { limitTo: ['query'] }
    ),
    reportService.productReps
  )
  return router
}
