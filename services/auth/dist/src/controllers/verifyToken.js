"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const schemas_1 = require("../schemas");
const config_1 = require("../config");
const verifyToken = async (req, res, next) => {
    try {
        const parsedBody = schemas_1.AccessTokenSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ errors: parsedBody.error.errors });
        }
        const { accessToken } = parsedBody.data;
        if (!accessToken) {
            return res.status(401).json({ message: "Access token is required" });
        }
        const decoded = jsonwebtoken_1.default.verify(accessToken, config_1.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Invalid access token" });
        }
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: { id: true, email: true, name: true, role: true }
        });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        return res.status(200).json({ message: 'Authorized', user });
    }
    catch (error) {
        console.error("Error verifying token:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
exports.default = verifyToken;
//# sourceMappingURL=verifyToken.js.map