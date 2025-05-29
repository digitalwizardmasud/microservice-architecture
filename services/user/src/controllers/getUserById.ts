import { Request, Response, NextFunction } from "express";
import { UserCreateSchema } from "../schemas";
import prisma from "../prisma";

const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { id } = req.params;
    const field = req.query.field as string;
    let user = null;

    if (field === "authUserId") {
      user = await prisma.user.findUnique({
        where: {
          authUserId: id,
        },
      });
    } else {
      user = await prisma.user.findUnique({
        where: {
          id: id,
        },
      });
    }

    if (!user) {
      return res.status(400).json({
        message: "User Not exists",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};
export default getUserById;
