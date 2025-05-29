import { Response, Request, NextFunction } from "express";
import prisma from "../prisma";
import jwt from "jsonwebtoken";
import { AccessTokenSchema } from "../schemas";
import { JWT_SECRET } from "../config";

const verifyToken = async (req: Request, res: Response, next: NextFunction):Promise<any> => {
  try {
    const parsedBody = AccessTokenSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }

    const { accessToken } = parsedBody.data;
    if (!accessToken) {
      return res.status(401).json({ message: "Access token is required" });
    }

    const decoded: any = jwt.verify(accessToken, JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ message: "Invalid access token" });
    }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.status(200).json({message: 'Authorized', user})

  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export default verifyToken;