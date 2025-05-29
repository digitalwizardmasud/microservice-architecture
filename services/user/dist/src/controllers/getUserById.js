"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../prisma"));
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const field = req.query.field;
        let user = null;
        if (field === "authUserId") {
            user = await prisma_1.default.user.findUnique({
                where: {
                    authUserId: id,
                },
            });
        }
        else {
            user = await prisma_1.default.user.findUnique({
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
    }
    catch (error) {
        return next(error);
    }
};
exports.default = getUserById;
//# sourceMappingURL=getUserById.js.map