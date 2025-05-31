import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { getEmails, sendEmail } from './controllers'


dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "UP" })
})

// Routes 
app.post('/emails/send', sendEmail)
app.get('/emails', getEmails)

// Error Handler 
app.use((_req, res)=>{
    res.status(404).json({ error: "Not Found" })
})

const PORT = process.env.PORT || 4005
const serviceName = process.env.SERVICE_NAME || 'Email-Service'

app.listen(PORT, () => {
  console.log(`${serviceName} is running on port ${PORT}`)
})
