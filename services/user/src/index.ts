import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { createUser, getUserById } from './controllers'


dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "UP" })
})

// Routes 
app.get('/users/:id', getUserById)
app.post('/users', createUser)

// Error Handler 
app.use((_req, res)=>{
    res.status(404).json({ error: "Not Found" })
})

const PORT = process.env.PORT || 4004
const serviceName = process.env.SERVICE_NAME || 'User-Service'

app.listen(PORT, () => {
  console.log(`${serviceName} is running on port ${PORT}`)
})
