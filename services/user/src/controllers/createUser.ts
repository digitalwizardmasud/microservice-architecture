import { Request, Response, NextFunction } from "express";
import { UserCreateSchema } from "../schemas";
import prisma from "../prisma";

const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const parsedBody = UserCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: parsedBody.error,
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        authUserId: parsedBody.data.authUserId
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // create product
    console.log(parsedBody, "✅");
    const user = await prisma.user.create({
      data: parsedBody.data,
    });
    console.log("User created successfully", user.id);

    
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
};
export default createUser;
