"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../prisma"));
const schemas_1 = require("../schemas");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = require("../config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_2 = require("@/generated/prisma");
const createLoginHistory = async (info) => {
    await prisma_1.default.loginHistory.create({
        data: {
            userId: info.userId,
            userAgent: info.userAgent,
            ipAddress: info.ipAddress,
            attempt: info.attempt,
        },
    });
};
const userLogin = async (req, res, next) => {
    try {
        const parsedBody = schemas_1.UserLoginSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ errors: parsedBody.error.errors });
        }
        const ipAddress = req.headers["x-forwarded-for"] || req.ip || "";
        const userAgent = req.headers["user-agent"] || "";
        const user = await prisma_1.default.user.findUnique({
            where: {
                email: parsedBody.data.email,
            },
        });
        if (!user) {
            await createLoginHistory({
                userId: "Guest",
                userAgent: userAgent,
                ipAddress: ipAddress,
                attempt: prisma_2.LoginAttempt.FAILED,
            });
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }
        const isMatch = await bcryptjs_1.default.compare(parsedBody.data.password, user.password);
        if (!isMatch) {
            await createLoginHistory({
                userId: user.id,
                userAgent: userAgent,
                ipAddress: ipAddress,
                attempt: prisma_2.LoginAttempt.FAILED,
            });
            return res.status(400).json({ message: "Invalid credentials" });
        }
        if (!user.verified) {
            await createLoginHistory({
                userId: user.id,
                userAgent: userAgent,
                ipAddress: ipAddress,
                attempt: prisma_2.LoginAttempt.FAILED,
            });
            return res.status(400).json({ message: "User not verified" });
        }
        if (user.status !== "ACTIVE") {
            await createLoginHistory({
                userId: user.id,
                userAgent: userAgent,
                ipAddress: ipAddress,
                attempt: prisma_2.LoginAttempt.FAILED,
            });
            return res.status(400).json({
                message: `Your account is ${user.status.toLocaleLowerCase()}`,
            });
        }
        const accessToken = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, config_1.JWT_SECRET ?? "Secret", { expiresIn: "2h" });
        await createLoginHistory({
            userId: user.id,
            userAgent: userAgent,
            ipAddress: ipAddress,
            attempt: prisma_2.LoginAttempt.SUCCESS,
        });
        return res.status(200).json({ accessToken });
    }
    catch (error) {
        next(error);
    }
};
exports.default = userLogin;
//# sourceMappingURL=userLogin.js.map