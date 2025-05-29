import { Response, Request, NextFunction } from "express";
import prisma from "../prisma";
import { UserLoginSchema } from "../schemas";
import bcrypt from "bcryptjs";
import axios from "axios";
import { JWT_SECRET, USER_SERVICE_URL } from "../config";
import jwt from "jsonwebtoken";
import { LoginAttempt } from "@/generated/prisma";

type LoginHistory = {
  userId: string;
  userAgent: string | undefined;
  ipAddress: string | undefined;
  attempt: LoginAttempt;
};

const createLoginHistory = async (info: LoginHistory) => {
  await prisma.loginHistory.create({
    data: {
      userId: info.userId,
      userAgent: info.userAgent,
      ipAddress: info.ipAddress,
      attempt: info.attempt,
    },
  });
};

const userLogin = async (req: Request, res: Response, next: NextFunction):Promise<any> => {
  try {
    const parsedBody = UserLoginSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ errors: parsedBody.error.errors });
    }

    const ipAddress = req.headers["x-forwarded-for"] || req.ip || "";
    const userAgent = req.headers["user-agent"] || "";

    const user = await prisma.user.findUnique({
      where: {
        email: parsedBody.data.email,
      },
    });

    if (!user) {
      await createLoginHistory({
        userId: "Guest",
        userAgent: userAgent as string,
        ipAddress: ipAddress as string,
        attempt: LoginAttempt.FAILED,
      });

      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(
      parsedBody.data.password,
      user.password
    );
    if (!isMatch) {
      await createLoginHistory({
        userId: user.id,
        userAgent: userAgent as string,
        ipAddress: ipAddress as string,
        attempt: LoginAttempt.FAILED,
      });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.verified) {
      await createLoginHistory({
        userId: user.id,
        userAgent: userAgent as string,
        ipAddress: ipAddress as string,
        attempt: LoginAttempt.FAILED,
      });
      return res.status(400).json({ message: "User not verified" });
    }

    if (user.status !== "ACTIVE") {
      await createLoginHistory({
        userId: user.id,
        userAgent: userAgent as string,
        ipAddress: ipAddress as string,
        attempt: LoginAttempt.FAILED,
      });
      return res.status(400).json({
        message: `Your account is ${user.status.toLocaleLowerCase()}`,
      });
    }

    // Generate access token
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET ?? "Secret",
      { expiresIn: "2h" }
    );
  
    await createLoginHistory({
      userId: user.id,
      userAgent: userAgent as string,
      ipAddress: ipAddress as string,
      attempt: LoginAttempt.SUCCESS,
    });

    return res.status(200).json({ accessToken });
  } catch (error) {
    next(error);
  }
};

export default userLogin;
