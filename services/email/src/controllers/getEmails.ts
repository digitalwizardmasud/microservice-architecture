import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";

const getEmails = async (req: Request, res: Response, next: NextFunction):Promise<any> => {
    try{
        const emails = await prisma.email.findMany()
        res.json(emails)
    }catch (error) {
        next(error);
    }
}

export default getEmails;