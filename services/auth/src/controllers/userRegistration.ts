import { Response, Request, NextFunction } from "express";
import prisma from "../prisma";
import { UserCreateSchema } from "../schemas";
import bcrypt from 'bcryptjs'
import axios from "axios";
import { USER_SERVICE_URL } from "../config";
const userRegistration = async(req:Request, res:Response, next:NextFunction):Promise<any>=> {
    try{
        const parsedBody = UserCreateSchema.safeParse(req.body)
        if(!parsedBody.success){
            return res.status(400).json({errors: parsedBody.error.errors})
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email: parsedBody.data.email
            }
        })
        if(existingUser){
            return res.status(400).json({
                message: 'User already exists'
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(parsedBody.data.password, salt)

        // create user 
        const user = await prisma.user.create({
            data: {
                ...parsedBody.data,
                password: hashedPassword
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true,
                verified: true,
             }
        })
        console.log("User created", user)

        // create user profile 
        await axios.post(`${USER_SERVICE_URL}/users`,{
            authUserId: user.id,
            name: user.name,
            email: user.email
        })

        // TODO: Generate verification code
        // TODO: Send verification email
        
        return res.status(201).json(user)
    }catch(error){
        next(error)
    }
}

export default userRegistration