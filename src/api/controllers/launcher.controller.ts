import { Request, Response } from "express";
import LauncherService, { IAssetsServer, IAssetsServerChildren } from "../services/launcher.service";
import Logs from "../../utils/logs";
import ReplyError from "../../utils/replyError";
import VerifyRequestParameter from "../../utils/verifyRequestParameter";
import fileUpload = require("express-fileupload");

export interface IUploadServerLogoImage {
    serveId: string;
    name: string;
    size: number;
    data: any;
}

export default class LauncherController {

    private _launcherService = new LauncherService();

    // public async getMetadataServerVersion(request: Request, response: Response): Promise<void> {

    // }

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
            response.status(200).json(data);
        } catch (error) {
            Logs.error(error);
            ReplyError.replyServerError(response);
        }
    }

    public async patchAssetsServer(request: Request, response: Response): Promise<void> {

        const serverId = request.params.serverId;
        const bodyData: IAssetsServer = request.body;

        try {

            const updateAssetsServer = await this._launcherService.updateAssetsServer(serverId, bodyData);

            if (updateAssetsServer.modified) {
                response.status(201).json({
                    message: "success"
                });
            } else {
                response.status(304).send();
            }

        } catch (error: any) {

            if (error.error === "not_replace_data") {

                response.status(400).json({
                    error: error.error,
                    error_description: error.error_description
                });

            } else {

                Logs.error(error);
                ReplyError.replyServerError(response);

            }

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

    public async patchAssetsServerChildren(request: Request, response: Response): Promise<void> {

        const serverId = request.params.serverId;
        const childrenId = request.params.childrenId;
        const bodyData: IAssetsServerChildren = request.body;

        try {

            const updateAssetsServerChildren = await this._launcherService.updateAssetsServerChildren(serverId, childrenId, bodyData);

            if (updateAssetsServerChildren.modified) {
                response.status(201).json({
                    message: "success"
                });
            } else {
                response.status(304).send();
            }

        } catch (error: any) {

            if (error.error === "not_replace_data") {

                response.status(400).json({
                    error: error.error,
                    error_description: error.error_description
                });

            } else {

                Logs.error(error);
                ReplyError.replyServerError(response);

            }

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

    public async uploadModpack(request: Request, response: Response): Promise<void> {

        if (request.files === null || !request.files) {
            response.status(400).end();
            return;
        }

        try {
            const upload = await this._launcherService.uploadModpack(request.files?.file as fileUpload.UploadedFile);
            response.status(201).json(upload);
        } catch (err) {
            Logs.error(err);
            ReplyError.replyServerError(response);
        }

    }

    public async getAssetsMetadataServerVersions(request: Request, response: Response): Promise<void> {

        const childrenId = request.params.childrenId;

        try {
            const data = await this._launcherService.getAssetsMetadataServerVersions(childrenId);
            response.status(200).json(data);
        } catch (error) {
            Logs.error(error);
            ReplyError.replyServerError(response);
        }
    }

    // public async getAssets(request: Request, response: Response): Promise<void> {

    // }
}