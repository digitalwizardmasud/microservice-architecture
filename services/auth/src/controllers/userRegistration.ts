import { Response, Request, NextFunction } from "express";
import prisma from "../prisma";
import { UserCreateSchema } from "../schemas";
import bcrypt from 'bcryptjs'
import axios from "axios";
import { EMAIL_SERVICE_URL, USER_SERVICE_URL } from "../config";

const generateVerificationCode = () => {
    const timestamp = new Date().getTime().toString()
    const randomNum = Math.floor(10+Math.random() * 90).toString()
    let code = (timestamp + randomNum).slice(-5)
    return code
}

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

        // Generate verification code
        const code = generateVerificationCode()
        await prisma.verificationCode.create({
            data: {
                userId: user.id,
                code,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            }
        })
        // TODO: Send verification email
        await axios.post(`${EMAIL_SERVICE_URL}/emails/send`, {
            recipient: user.email,
            subject: 'Email Verification',
            body: `Your verification code is ${code}. It will expire in 24 hours.`,
            source: 'user-registration'
        })
        
        return res.status(201).json({message: 'User registered successfully', user})
    }catch(error){
        next(error)
    }
}

export default userRegistration