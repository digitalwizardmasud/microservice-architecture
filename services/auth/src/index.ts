import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { userLogin, userRegisgration, verifyToken } from './controllers'


dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "UP" })
})

// Routes 
app.post('/auth/registration', userRegisgration)
app.post('/auth/login', userLogin)
app.post('/auth/verify', verifyToken)

// Error Handler 
app.use((_req, res)=>{
    res.status(404).json({ error: "Not Found" })
})

const PORT = process.env.PORT || 4003
const serviceName = process.env.SERVICE_NAME || 'Auth-Service'

app.listen(PORT, () => {
  console.log(`${serviceName} is running on port ${PORT}`)
})
