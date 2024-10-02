import * as http from "http";
import * as jwt from "jsonwebtoken";
import { Server, Socket } from "socket.io";
import Logs from "../utils/logs";
import SocketEvent from "./events/SocketEvent";
import LauncherServerFile from "./events/LauncherServerFile";

export default class SocketIo {

    private _containers: Map<string, Socket> = new Map();
    private _httpServer: http.Server;

    constructor(httpServer: http.Server) {
        this._httpServer = httpServer;
    }

    public init() {

        Logs.info("Socket initialized successfully, listening...");;

        const io = new Server(this._httpServer, {
            cors: {
                origin: "*",
            }
        });

        // io.use(async (socket, next) => {

        //     const token = socket.handshake.headers.authorization;
        //     const secret = socket.handshake.headers.secret as string | undefined;

        //     if (!token) {
        //         return next(new Error("缺少授權標頭（Token）。請提供有效的授權標頭。"));
        //     }

        //     if (!secret) {
        //         return next(new Error("缺少 Secret。請提供有效的 Secret。"));
        //     }

        //     try {
        //         // 驗證 token 的有效性
        //         jwt.verify(token, secret);
        //         // 驗證成功，繼續處理連接
        //         return next();
        //     } catch (err: any) {

        //         // 根據錯誤類型處理不同情況
        //         switch (err.name) {
        //             // JWT 過期
        //             case "TokenExpiredError":
        //                 return next(new Error("Token 已過期。請重新登入以獲取新的 Token。"));
        //             // JWT 無效
        //             case "JsonWebTokenError":
        //                 return next(new Error("無效的 Token 或 Secret。請檢查 Token 和 Secret 的正確性。"));
        //             // 其他未預期的錯誤
        //             default:
        //                 return next(new Error("驗證過程發生錯誤。請稍後再試。"));
        //         }

        //     }
        // });

        io.on("connection", (socket) => {

            Logs.info(`Socket connected: ${socket.id}`);

            socket.on("disconnect", () => {
                Logs.info(`Socket disconnected from server: ${socket.id}`);
            });

            new SocketEvent(socket).register([
                new LauncherServerFile()
            ]);

            socket.on("TEST", () => {
                console.log("Test event fired");
            })

            this._containers.set(socket.id, socket);
        });

        io.on("connect_error", (socket) => {
            Logs.warn(`Socket connect error: ${socket.id}`);
        });
    }
}