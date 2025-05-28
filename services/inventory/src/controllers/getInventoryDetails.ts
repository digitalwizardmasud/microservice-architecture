import {Request, Response, NextFunction} from 'express'
import prisma from "../prisma"

const getInventoryDetails = async(req:Request, res:Response, next:NextFunction):Promise<any> => {
    try{
        const {id} = req.params
        const inventory = await prisma.inventory.findUnique({
            where: {id},
            include: {
                histories: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        })
        return res.status(200).json(inventory)
        
    }
    catch(error){
        return next(error)
    }
}

export default getInventoryDetails