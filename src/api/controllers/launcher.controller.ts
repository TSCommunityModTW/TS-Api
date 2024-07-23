import { Request, Response } from "express";
import LauncherService from "../services/launcher.service";
import Logs from "../../utils/logs";
import ReplyError from "../../utils/replyError";
import VerifyRequestParameter from "../../utils/verifyRequestParameter";

export interface IUploadServerLogoImage {
    serveId: string;
    name: string;
    size: number;
    data: string;
}
export default class LauncherController {

    private _launcherService = new LauncherService();

    public async getMetadataServerVersion(request: Request, response: Response): Promise<void> {

    }

    public async getAssetsServers(request: Request, response: Response): Promise<void> {
        try {
            const data = await this._launcherService.getAssetsServers();
            response.status(200).json(data);
        } catch (error) {
            Logs.error(error);
            ReplyError.replyServerError(response);
        }
    }

    public async getAssetsServer(request: Request, response: Response): Promise<void> {

        const serverId = request.params.serverId;

        try {
            const data = await this._launcherService.getAssetsServer(serverId);
            response.status(200).json(data[0]);
        } catch (error) {
            Logs.error(error);
            ReplyError.replyServerError(response);
        }
    }

    public async getAssetsServerChildrens(request: Request, response: Response): Promise<void> {

        const serverId = request.params.serverId;

        try {
            const data = await this._launcherService.getAssetsServerChildrens(serverId);
            response.status(200).json(data);
        } catch (error) {
            Logs.error(error);
            ReplyError.replyServerError(response);
        }
    }

    public async uploadServerLogoImage(request: Request, response: Response): Promise<void> {

        const bodyData: IUploadServerLogoImage = request.body;

        // 確保客戶端必要的參數
        if (!VerifyRequestParameter.verify(bodyData, ["serveId", "name", "size", "data"])) {
            return ReplyError.replyParameterError(response);
        }

        try {
            const upload = await this._launcherService.uploadServerLogoImage(bodyData);
            response.status(201).json(upload);
        } catch (error: any) {
            Logs.error(error);
            ReplyError.replyServerError(response);
        }
    }

    // public async getAssets(request: Request, response: Response): Promise<void> {

    // }
}