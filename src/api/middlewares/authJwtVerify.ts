import { Request, Response, NextFunction } from "express";

import * as jwt from "jsonwebtoken";

interface IDecoded {
    _id: string;
    iss: string;
    sub: string;
    iat: number;
    exp: number;
    role: string;
}

export default class AuthJwtVerify {

    public verifyToken(request: Request, response: Response, next: NextFunction) {

        try {

            const token = request.headers.authorization as string;

            // 沒有 token
            if (!token) {
                return response.status(401).json({
                    error: "invalid_client",
                    error_description: "沒有 Token。"
                });
            }

            request.user = jwt.verify(token, (process.env.JWT_SECRET as string)) as IDecoded;

            return next();

        } catch (error: any) {

            switch (error.name) {
                // JWT 過期
                case "TokenExpiredError":
                    return response.status(400).json({
                        error: "invalid_grant",
                        error_description: "Token 過期。"
                    });
                // JWT 無效
                case "JsonWebTokenError":
                    return response.status(400).json({
                        error: "invalid_grant",
                        error_description: "Token 無效。"
                    });
            }

        }

    }

    public accessControl(request: Request, response: Response, next: NextFunction) {

        // 如不是 admin，則無權限
        switch (request.user.role) {
            case null:
            case "user":
            case "guest":
                return response.status(400).json({
                    error: "unauthorized_client",
                    error_description: "無權限。"
                });
        }

        return next();

    }
}
