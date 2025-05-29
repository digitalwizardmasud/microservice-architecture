"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schemas_1 = require("../schemas");
const prisma_1 = __importDefault(require("../prisma"));
const createUser = async (req, res, next) => {
    try {
        const parsedBody = schemas_1.UserCreateSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({
                message: "Invalid request body",
                errors: parsedBody.error,
            });
        }
        const existingUser = await prisma_1.default.user.findUnique({
            where: {
                authUserId: parsedBody.data.authUserId
            },
        });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }
        console.log(parsedBody, "✅");
        const user = await prisma_1.default.user.create({
            data: parsedBody.data,
        });
        console.log("User created successfully", user.id);
        return res.status(201).json(user);
    }
    catch (error) {
        return next(error);
    }
};
exports.default = createUser;
//# sourceMappingURL=createUser.js.map