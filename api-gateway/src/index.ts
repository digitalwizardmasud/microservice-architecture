import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import dotenv from 'dotenv'
import express, {Request, Response, NextFunction} from 'express'
import helmet from 'helmet'
import {configureRoutes} from './utils'

dotenv.config()

const app = express()

app.use(helmet())

const limiter = rateLimit({
    windowMs: 15*60*1000,
    max: 100,
    handler: (req, res) => {
        res.status(429)
        .json({
            message: 'Too many requests, Please try again later.'
        })
    }
})


app.use('/api', limiter)
app.use(morgan('dev'))
app.use(express.json())

// TODO: Auth Middleware 

// Routes 
configureRoutes (app)

// Health check 
app.get("/health", (_req, res)=>{
    res.json({message:"API Gateway is running"})
})

// Not Found 
app.use((_req, res)=>{
    res.status(404).json({message: "Not Found"})
})

// Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction)=>{
    console.error(err.stack)
    res.status(500).json({
        message: ' Internal Server Error'
    })
})


const PORT = process.env.PORT || 8081;
app.listen(PORT, ()=>{
    console.log(`API gateway is running on port: ${PORT} `)
})