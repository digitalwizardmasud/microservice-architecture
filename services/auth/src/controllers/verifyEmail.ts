import { Response, Request, NextFunction } from "express";
import prisma from "../prisma";
import jwt from "jsonwebtoken";
import { EmailVerificationSchema } from "../schemas";
import { EMAIL_SERVICE_URL } from "../config";
import axios from "axios";
const verifyEmail = async (req: Request, res: Response, next: NextFunction):Promise<any> => {
    try{
        const parsedBody = EmailVerificationSchema.safeParse(req.body)
        if(!parsedBody.success){
            return res.status(400).json({errors: parsedBody.error.errors})
        }
        const { email, code } = parsedBody.data;
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                verified: true,
                status: true,
                createdAt: true,
                updatedAt: true
            }
        })
        if(!user){
            return res.status(404).json({message: 'User not found'})
        }

        // Find verification code 
        const verificationCode = await prisma.verificationCode.findFirst({
            where: {
                userId: user.id,
                code,
            }
        })

        if(!verificationCode){
            return res.status(400).json({message: 'Invalid verification code'})
        }
        if(verificationCode.status === 'USED'){
            return res.status(400).json({message: 'Code already used'})
        }
        if(verificationCode.expiresAt < new Date()){
            return res.status(400).json({message: 'Verification code expired'})
        }
        // Update user verified status
        await prisma.user.update({
            where: { id: user.id },
            data: { verified: true, status: 'ACTIVE' }
        })

        // update verificationCode status 
        await prisma.verificationCode.update({
            where: { id: verificationCode.id },
            data: { status: 'USED', verifiedAt: new Date() }
        })

        // send success email 
        await axios.post(`${EMAIL_SERVICE_URL}/emails/send`, {
            recipient: user.email,
            subject: 'Email Verified',
            body: `Hello ${user.name}, your email has been successfully verified.`,
            source: 'verify-email'
        })
        return res.status(200).json({
            message: 'Email verified successfully',
            user
        })
    }catch(error) {
        return next(error)
    }
}
export default verifyEmail;