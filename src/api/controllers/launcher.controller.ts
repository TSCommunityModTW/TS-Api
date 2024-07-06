import { Request, Response } from "express";
import LauncherService from "../services/launcher.service";
import Logs from "../../utils/logs";
import ReplyError from "../../utils/replyError";

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

    // public async getAssets(request: Request, response: Response): Promise<void> {

    // }
}