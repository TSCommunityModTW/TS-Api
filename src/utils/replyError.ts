import { Response } from "express";

export default class ReplyError {

    public static replyServerError(response: Response): void {
        response.status(500).json({
            error: "server_error",
            error_description: "伺服器發生非預期的錯誤。"
        });
    }

    public static replyParameterError(response: Response): void {
        response.status(400).json({
            error: "invalid_request",
            error_description: "通訊協定錯誤，遺漏必要的參數或者參數格式錯誤。"
        });
    }

}
