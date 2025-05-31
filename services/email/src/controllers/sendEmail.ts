import { Request, Response, NextFunction } from "express";
import prisma from "../prisma";
import { EmailSchema } from "../schemas";
import { DEFAULT_SENDER_EMAIL, transporter } from "../config";

const sendEmail = async (req: Request, res: Response, next: NextFunction):Promise<any> => {
    try{
        const parsedBody = EmailSchema.safeParse(req.body);
        if(!parsedBody.success) {
            return res.status(400).json({ errors: parsedBody.error.errors});
        }

        // create mail option 
        const {sender, recipient, subject, body, source} = parsedBody.data;
        const from = sender || DEFAULT_SENDER_EMAIL
        const mailOptions = {
            from,
            to: recipient,
            subject,
            text: body,
        }

        // send mail 
        const {accepted, rejected} = await transporter.sendMail(mailOptions)
        if(rejected.length > 0) {
            console.log('Email rejected:', rejected)
            return res.status(500).json({ message: "Failed to send email", rejected });
        }
   
        await prisma.email.create({
            data: {
                sender: from,
                recipient,
                subject,
                body,
                source,
            }
        })
        return res.status(200).json({ message: "Email sent successfully", accepted });

    }catch (error) {
        next(error)
    }
}

export default sendEmail;