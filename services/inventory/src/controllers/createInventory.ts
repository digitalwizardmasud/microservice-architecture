import {Request, Response, NextFunction, RequestHandler} from 'express'
import {InventoryCreateDTOSchema} from '@/src/schemas'
import prisma from "@/src/prisma"
const createInventory = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try{
        // Validate 
        const parsedBody = InventoryCreateDTOSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ error: parsedBody.error.errors });
        }


        // create inventory 
        const inventory = await prisma.inventory.create({
            data: {
                ...parsedBody.data,
                histories: {
                    create: {
                        actionType: 'IN',
                        quantityChanged: parsedBody.data.quantity,
                        lastQuantity: 0,
                        newQuantity: parsedBody.data.quantity
                    }
                }
            },
            select: {
                id: true,
                quantity: true
            }
            
        })
        console.log(inventory, "✅ inventory")
        return res.status(201).json(inventory);
    }catch(error){
        console.log(error, "✅ inventory")
         next(error)
    }
}

export default createInventory