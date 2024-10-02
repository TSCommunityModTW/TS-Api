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

            const token = request.headers.authorization;
            const secret = request.headers.secret as string | undefined;

            // 沒有 token
            if (!token) {
                return response.status(401).json({
                    error: "invalid_client",
                    error_description: "缺少 Token。請提供有效的 Token。"
                });
            }

            if (!secret) {
                return response.status(401).json({
                    error: "invalid_client",
                    error_description: "缺少 Secret。請提供有效的 Secret。"
                });
            }

            // 驗證 token 是否有效
            // request.user = jwt.verify(token, secret) as IDecoded;
            jwt.verify(token, secret);

            // 驗證成功，繼續下一個中介程式
            return next();

        } catch (error: any) {

            // 根據錯誤類型處理不同的錯誤情況
            switch (error.name) {
                // JWT 過期
                case "TokenExpiredError":
                    return response.status(400).json({
                        error: "invalid_grant",
                        error_description: "Token 已過期。請重新登入獲取新的 Token。"
                    });
                // JWT 無效
                case "JsonWebTokenError":
                    return response.status(400).json({
                        error: "invalid_grant",
                        error_description: "Token 或 Secret 無效。請檢查 Token 和 Secret 的正確性。"
                    });
                // 其他未預期的錯誤
                default:
                    return response.status(500).json({
                        error: "server_error",
                        error_description: "伺服器錯誤。請稍後再試。"
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
