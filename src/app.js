import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
app.use(cors({ origin: process.env.APP_CORES_ORIGIN }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

export default app
