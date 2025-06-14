import {Express, Request, Response} from 'express'
import config from './config.json'
import axios from 'axios'
import middlewares from './middlewares'

export const getMiddleware = (names:string[]) =>{
    const midd =  names.map((name)=>{
        return middlewares[name]
    })
   return midd.filter(item=>item != undefined)
}



export const createHandler = (hostname:string, path:string, method:string) =>{
    return async (req:Request, res:Response) => {
        try{
            let url = `${hostname}${path}`
            req.params && Object.keys(req.params).forEach(param=>{
                url = url.replace(`:${param}`, req.params[param])
            })

            const {data} = await axios({
            method, 
            url,
            data: req.body,
            headers: {
                origin: 'http://localhost:8081', // API Gateway origin
                'x-user-id': req.headers['x-user-id'],
                'x-user-email': req.headers['x-user-email'],
                'x-user-role': req.headers['x-user-role'],
                'x-user-name': req.headers['x-user-name'],
                'user-agent': req.headers['user-agent']   
            }
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
                const middleware = getMiddleware(route.middleware || [])
                const handler = createHandler(hostname, route.path, method)
                if(middleware && middleware.length>0){
                    app[method](`/api${route.path}`, middleware, handler)
                }else{
                    app[method](`/api${route.path}`, handler)
                }
            })
        })

        return 
    })
}


