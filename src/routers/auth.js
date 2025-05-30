import { Router } from 'express'
import authService from '../services/auth.js'
import ensureFields from '../middleware/ensure-fields.js'
import ensurePermissions from '../middleware/ensure-roles.js'

export default function initRoutes(middleware) {
  const router = Router()
  router.post(
    '/register',
    middleware,
    ensurePermissions({ RESTAURANT_OWNER: 'POST' }),
    ensureFields(
      {
        first_name: {
          notEmpty: true,
          isLength: { options: { max: 250, min: 1 } },
        },
        last_name: {
          notEmpty: true,
          isLength: { options: { max: 250, min: 1 } },
        },
        email: {
          notEmpty: true,
          isEmail: true,
          isLength: { options: { max: 250 } },
        },
        password: {
          notEmpty: true,
          isLength: { options: { min: 8 } },
        },
        gender: {
          notEmpty: true,
          isLength: { options: { max: 6, min: 1 } },
        },
        role_id: {
          notEmpty: true,
          isString: { options: { max: 24, min: 24 } },
        },
        store_id: {
          optional: true,
          isString: { options: { max: 24, min: 24 } },
        },
      },
      { limitTo: ['body'] }
    ),
    authService.register
  )
  router.post(
    '/login',
    ensureFields(
      {
        email: {
          notEmpty: true,
          isEmail: true,
        },
        password: {
          notEmpty: true,
        },
      },
      { limitTo: ['body'] }
    ),
    authService.login
  )
  router.post(
    '/send-pwd',
    ensureFields(
      {
        email: {
          notEmpty: true,
          isEmail: true,
        },
      },
      { limitTo: ['body'] }
    ),
    authService.sendPwd
  )
  router.post(
    '/check-pwd',
    ensureFields(
      {
        token: {
          notEmpty: true,
        },
      },
      { limitTo: ['body'] }
    ),
    authService.checkPwd
  )
  router.post(
    '/reset-pwd',
    ensureFields(
      {
        password: {
          notEmpty: true,
        },
        token: {
          notEmpty: true,
        },
      },
      { limitTo: ['body'] }
    ),
    authService.resetPwd
  )
  router.post(
    '/change-pwd',
    middleware,
    ensureFields(
      {
        old_pwd: {
          notEmpty: true,
        },
        new_pwd: {
          notEmpty: true,
        },
      },
      { limitTo: ['body'] }
    ),
    authService.changePwd
  )
  router.get('/user', middleware, authService.mySelf)
  router.get(
    '/staff',
    middleware,
    ensurePermissions({ RESTAURANT_OWNER: 'GET' }),
    authService.getStaff
  )
  router.put(
    '/user/:id',
    middleware,
    ensureFields(
      {
        id: {
          notEmpty: true,
          isLength: { options: { max: 24, min: 24 } },
        },
        first_name: {
          notEmpty: true,
          isLength: { options: { max: 250, min: 1 } },
        },
        last_name: {
          notEmpty: true,
          isLength: { options: { max: 250, min: 1 } },
        },
        email: {
          notEmpty: true,
          isEmail: true,
          isLength: { options: { max: 250 } },
        },
        password: {
          optional: true,
          isLength: { options: { min: 8 } },
        },
        gender: {
          notEmpty: true,
          isLength: { options: { max: 6, min: 1 } },
        },
        role_id: {
          optional: true,
          isString: { options: { max: 24, min: 24 } },
        },
      },
      { limitTo: ['params', 'body'] }
    ),
    authService.updateStaff
  )
  router.delete(
    '/staff/:id',
    middleware,
    ensurePermissions({ RESTAURANT_OWNER: 'DELETE' }),
    ensureFields(
      {
        id: {
          notEmpty: true,
          isLength: { options: { max: 24, min: 24 } },
        },
      },
      { limitTo: ['params'] }
    ),
    authService.deleteStaff
  )
  return router
}
