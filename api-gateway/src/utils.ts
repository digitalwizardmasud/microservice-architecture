import {Express, Request, Response} from 'express'
import config from './config.json'
import axios from 'axios'

export const createHandler = (hostname:string, path:string, method:string) =>{
    return async (req:Request, res:Response) => {
        try{
            let url = `${hostname}${path}`
            req.params && Object.keys(req.params).forEach(param=>{
                url = url.replace(`:${param}`, req.params[param])
            })
            console.log(url, 'url')
            const {data} = await axios({
            method, 
            url,
            data: req.body
        })
        res.json(data)
        }catch(error){
            if (error instanceof axios.AxiosError){
                return res.status(error.response?.status || 500)
                .json(error.response?.data)
            }
            return res.status(500).json({message: 'Internal Server Error'})
        }
    }
    
}

export const configureRoutes = (app:any) => {
    Object.entries(config.services).forEach(([name, service])=>{
        const hostname = service.url 
        service.routes.forEach(route=>{
            route.methods.forEach((method)=>{
                const handler = createHandler(hostname, route.path, method)
                app[method](`/api${route.path}`, handler)
            })
        })

        return 
    })
}


