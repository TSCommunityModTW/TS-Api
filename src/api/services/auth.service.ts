import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import { IOAuth2 } from "../controllers/auth.controller";
import { RowDataPacket } from "mysql2";
import SQL from "../../sql";
import { config } from "../../config/config";

export default class AuthService {

    public async verify(verifyData: IOAuth2): Promise<{ accessToken: string, permissions: Permissions }> {

        // 驗證 OAuth 2.0 授權類型
        if (!verifyData.grant_type || (verifyData.grant_type !== "password" && verifyData.grant_type !== "token")) {
            throw {
                error: "unsupported_response_type",
                error_description: "授權伺服器不支援要求中的回應類型，本伺服器僅支持 Password 與 Token 類型。"
            };
        }

        if (verifyData.grant_type === "token") {

            // if (!verifyData.token || !verifyData.secret) {
            //     throw {
            //         error: "invalid_request"
            //     }
            // }

            if (!verifyData.token) {
                throw {
                    error: "invalid_request"
                }
            }

            const [authorizeRows] = await SQL.pool().query<IAuthorize[]>("SELECT * FROM `authorize` WHERE token = ?", [verifyData.token]);

            if (authorizeRows.length === 0) {
                throw {
                    error: "invalid_client",
                    error_description: "用戶端驗證失敗。"
                }
            }

            // 產生 OAuth 2.0 和 JWT 的 JSON 格式令牌訊息
            const payload = {
                _id: authorizeRows[0].id,
                iss: authorizeRows[0].username,
                sub: "TS API OAuth 2.0 Verify Token.",
                permissions: authorizeRows[0].permissions
            }

            const accessToken = jwt.sign(payload, authorizeRows[0].secret, {
                algorithm: "HS256",
                expiresIn: `${config.jwt.increaseTime}ms`
            });

            return {
                accessToken: accessToken,
                permissions: authorizeRows[0].permissions
            }
        }

        if (verifyData.grant_type === "password") {

            // if (!verifyData.password || !verifyData.username || !verifyData.secret) {
            //     throw {
            //         error: "invalid_request"
            //     }
            // }

            if (!verifyData.password || !verifyData.username) {
                throw {
                    error: "invalid_request"
                }
            }

            const passwordCrypto = crypto.createHash("md5").update(verifyData.password).digest("hex");

            const [authorizeRows] = await SQL.pool().query<IAuthorize[]>("SELECT * FROM `authorize` WHERE username = ? AND password = ?", [verifyData.username, passwordCrypto]);

            if (authorizeRows.length === 0) {
                throw {
                    error: "invalid_client",
                    error_description: "用戶端驗證失敗。"
                }
            }

            // 產生 OAuth 2.0 和 JWT 的 JSON 格式令牌訊息
            const payload = {
                _id: authorizeRows[0].id,
                iss: authorizeRows[0].username,
                sub: "TS API OAuth 2.0 Verify Password.",
                permissions: authorizeRows[0].permissions
            }

            const accessToken = jwt.sign(payload, authorizeRows[0].secret, {
                algorithm: "HS256",
                expiresIn: `${config.jwt.increaseTime}ms`
            });

            return {
                accessToken: accessToken,
                permissions: authorizeRows[0].permissions
            }
        }

        throw {
            error: "unsupported_response_type",
            error_description: "授權伺服器回應類型錯誤"
        };
    }
}


export interface IAuthorize extends RowDataPacket {
    id: string;
    type: "Password" | "Token";
    token: string;
    secret: string;
    username: string;
    password: string;
    permissions: Permissions
}

export type Permissions = "Launcher";