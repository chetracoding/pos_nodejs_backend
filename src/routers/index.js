import middleware from '../middleware/auth.js'
import initProductsRoutes from './products.js'
import initOrdersRoutes from './orders.js'
import initReportsRoutes from './reports.js'
import initAuthRoutes from './auth.js'
export default function initAppRoutes(app) {
  app.use('/api/products', middleware, initProductsRoutes())
  app.use('/api/orders', middleware, initOrdersRoutes())
  app.use('/api/reports', middleware, initReportsRoutes())
  app.use('/api/auth', initAuthRoutes(middleware))
}
