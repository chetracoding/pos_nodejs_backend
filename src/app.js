import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()
const app = express()
app.use(cors({ origin: process.env.CORE_URL }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

export default app
