import http from 'http'
import app from './app.js'
import initDb from '../mongodb/index.js'
import initAppRoutes from './routers/index.js'
import initCrud from './crud/index.js'
import { Server } from 'socket.io'

const server = http.createServer(app)
const io = new Server(server, { cors: { origin: process.env.CORE_URL } })
const PORT = process.env.PORT || 5000

io.on('connection', (socket) => {
  console.log(`- A socket client ID:${socket.id} is connected`)

  socket.on('msg_to_server', (ms) => {
    io.emit('msg_to_client', ms)
  })
})

await initCrud(app)
await initDb()
initAppRoutes(app)

server.listen(PORT, () => {
  console.info(
    `-----------> Server is now avialable on url: http://localhost:${PORT} <----------`
  )
})
