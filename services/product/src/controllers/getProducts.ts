import {Request, Response, NextFunction} from 'express'
import prisma from '../prisma'

const getProducts = async(req:Request, res:Response, next:NextFunction):Promise<any> => {
    try{
        const products = await prisma.product.findMany({
            select: {
                id: true,
                sku: true,
                name: true,
                price: true,
                inventoryId: true
            }
        })
        return res.status(200).json({
            data: products
        })

    }catch(error){
        return next(error)
    }
}

export default getProducts