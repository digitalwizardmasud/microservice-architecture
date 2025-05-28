import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import morgan from 'morgan'
import { createInventory, getInventoryById, getInventoryDetails, updateInventory } from './controllers'


dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "UP" })
})

// Routes 
app.get('/inventories/:id/details', getInventoryDetails)
app.put('/inventories/:id', updateInventory)
app.get('/inventories/:id', getInventoryById)
app.post('/inventories', createInventory)

// Error Handler 
app.use((_req, res)=>{
    res.status(404).json({ error: "Not Found" })
})

const PORT = process.env.PORT || 4002
const serviceName = process.env.SERVICE_NAME || 'Inventory Service'

app.listen(PORT, () => {
  console.log(`${serviceName} is running on port ${PORT}`)
})
