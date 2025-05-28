import { Request, Response, NextFunction, RequestHandler } from "express";
import { InventoryUpdateDTOSchema } from "@/src/schemas";
import prisma from "@/src/prisma";
const updateInventory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Validate
    const { id } = req.params;
    const inventory = await prisma.inventory.findUnique({
      where: { id },
    });
    if (!inventory) {
      return res.status(404).json({ message: "Inventory not found." });
    }
    const parsedBody = InventoryUpdateDTOSchema.safeParse(req.body);
    console.log("Parsed Body:", parsedBody);
    if (!parsedBody.success) {
      return res.status(400).json({
        message: "Invalid request body.",
        errors: parsedBody.error.errors,
      });
    }

    const lastHistory = await prisma.history.findFirst({
      where: { id },
      orderBy: {
        createdAt: "desc",
      },
    });

    // calculate new quantity
    let newQuantity = inventory.quantity;
    if (parsedBody.data.actionType == "IN") {
      newQuantity += parsedBody.data.quantity;
    } else if (parsedBody.data.actionType == "OUT") {
      newQuantity -= parsedBody.data.quantity;
    } else {
      res.status(400).json({
        message: "Invalid action type.",
      });
    }

    // Update inventory
    const updatedInventory = await prisma.inventory.update({
      where: { id },
      data: {
        quantity: newQuantity,
        histories: {
          create: {
            actionType: parsedBody.data.actionType,
            quantityChanged: parsedBody.data.quantity,
            lastQuantity: lastHistory?.newQuantity || 0,
            newQuantity,
          },
        },
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    return res.status(200).json(updatedInventory);
  } catch (error) {
    next(error);
  }
};

export default updateInventory;
