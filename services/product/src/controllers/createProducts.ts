import { Request, Response, NextFunction } from "express";
import { ProductCreateSchema } from "../schemas";
import prisma from "../prisma";
import { INVENTORY_URL } from "../config";
import axios from "axios";
const createProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const parsedBody = ProductCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: parsedBody.error,
      });
    }

    const existingProduct = await prisma.product.findUnique({
      where: {
        sku: parsedBody.data.sku,
      },
    });

    if (existingProduct) {
      return res.status(400).json({
        message: "Product with the same SKU already exists",
      });
    }

    // create product
    console.log(parsedBody, "✅");
    const product = await prisma.product.create({
      data: parsedBody.data,
    });
    console.log("Product created successfully", product.id);

    // create inventory record for the product
    const { data: inventory } = await axios.post(
      `${INVENTORY_URL}/inventories`,
      {
        productId: product.id,
        sku: product.sku,
      }
    );
    console.log("Inventory created successfully", inventory.id);

    await prisma.product.update({
      where: {
        id: product.id,
      },
      data: {
        inventoryId: inventory.id,
      },
    });
    console.log("Product updated successfully with inventory id", inventory.id);
    return res.status(201).json({ ...product, inventoryId: inventory.id });
  } catch (error) {
    return next(error);
  }
};
export default createProducts;
