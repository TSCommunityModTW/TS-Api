import { v4 as uuidv4 } from "uuid";

import SQL from "../../sql";
import { IUploadServerLogoImage } from "../controllers/launcher.controller";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import S3 from "../../s3";
import Logs from "../../utils/logs";
import { Upload } from "@aws-sdk/lib-storage";
import fileUpload = require("express-fileupload");
import { RowDataPacket } from "mysql2";
import { config } from "../../config/config";

export default class LauncherService {

    public async getAssetsMetadataServerVersions(childrenId: string): Promise<Array<IAssetsMetadataVersion>> {
        const [IAssetsMetadataVersionRows] = await SQL.pool().query<IAssetsMetadataVersionRow[]>("SELECT * FROM assets_metadata_versions WHERE children_id = ?", [childrenId]);
        return IAssetsMetadataVersionRows;
    }

    public async getAssetsServers(): Promise<Array<IAssetsServer>> {
        const [assetsServerRows] = await SQL.pool().query<IAssetsServerRow[]>("SELECT * FROM servers");
        return assetsServerRows;
    }

    public async getAssetsServer(id: string): Promise<IAssetsServer> {
        const [assetsServerRows] = await SQL.pool().query<IAssetsServerRow[]>("SELECT * FROM servers WHERE id = ?", [id]);
        return assetsServerRows[0];
    }

    public async updateAssetsServer(id: string, bodyData: IAssetsServer): Promise<{ modified: boolean }> {

        const [assetsServerRows] = await SQL.pool().query<IAssetsServerRow[]>("SELECT * FROM servers WHERE id = ?", [id]);

        if (assetsServerRows.length === 0) {
            throw {
                error: "not_replace_data",
                error_description: "沒有可替換的資源，請先新增資源。"
            };
        }

        await SQL.pool().query("UPDATE servers SET name = ?, image_url = ?, description = ?, official_web_link_url = ? WHERE id = ?", [
            bodyData.name,
            bodyData.image_url,
            bodyData.description,
            bodyData.official_web_link_url,
            id
        ]);

        return { modified: true };
    }

    public async getAssetsServerChildrens(id: string): Promise<Array<IAssetsServerChildren>> {
        const [assetsServerChildrenRows] = await SQL.pool().query<IAssetsServerChildrenRow[]>("SELECT * FROM servers_children WHERE server_id = ?", [id]);
        return assetsServerChildrenRows;
    }

    public async updateAssetsServerChildren(server_id: string, id: string, bodyData: IAssetsServerChildren): Promise<{ modified: boolean }> {

        const [assetsServerChildrenRows] = await SQL.pool().query<IAssetsServerChildrenRow[]>("SELECT * FROM servers_children WHERE server_id = ? AND id = ?", [server_id, id]);

        if (assetsServerChildrenRows.length === 0) {
            throw {
                error: "not_replace_data",
                error_description: "沒有可替換的資源，請先新增資源。"
            }
        }

        await SQL.pool().query("UPDATE servers_children SET ip = ?, name = ?, image_url = ?, minecraft_type = ?, minecraft_version = ?, action_rule = ? WHERE server_id = ? AND id = ?", [
            bodyData.ip,
            bodyData.name,
            bodyData.image_url,
            bodyData.minecraft_type,
            bodyData.minecraft_version,
            bodyData.action_rule,
            server_id,
            id
        ]);

        return { modified: true };
    }

    public async uploadServerLogoImage(bodyData: IUploadServerLogoImage): Promise<{ fileKey: string }> {

        const fileKey = `/server/images/logo/${bodyData.serveId}/${uuidv4()}`;

        const uploadParams = {
            Bucket: config.s3_ts_launcher_metadata_bucket,
            Key: fileKey,
            Body: bodyData.data
        };

        try {
            await S3.client().send(new PutObjectCommand(uploadParams));
            return { fileKey };
        } catch (error) {
            Logs.error(`Upload 'Server Logo Image' failed with error: ${error}`);
            throw new Error(`Upload 'Server Logo Image' failed with error: ${error}`);
        }
    }

    public async uploadModpack(file: fileUpload.UploadedFile): Promise<{ fileKey: string }> {

        const fileKey = `/temporary/modpacks/${file.name}`;

        try {
            const upload = new Upload({
                client: S3.client(),
                params: {
                    Bucket: config.s3_ts_launcher_metadata_bucket,
                    Key: fileKey,
                    Body: file.data,
                },
            });

            await upload.done();

            return { fileKey };
        } catch (err) {
            Logs.error(`Upload 'Modpack' failed with error: ${err}`);
            throw new Error(`Upload 'Modpack' failed with error: ${err}`);
        }
    }
}

export interface IAssetsServer {
    id: string;
    name: string;
    image_url: string;
    description: string;
    official_web_link_url: string;
}

interface IAssetsServerRow extends IAssetsServer, RowDataPacket { }

export interface IAssetsMetadataVersion {
    id: string;
    server_id: string;
    children_id: string;
    name: string;
    version: string;
    manifest_url: string;
}

interface IAssetsMetadataVersionRow extends IAssetsMetadataVersion, RowDataPacket { }

export interface IAssetsServerChildren {
    server_id: string;
    id: string;
    ip: string;
    name: string;
    image_url: string;
    minecraft_type: "MODPACK" | "VANILLA",
    minecraft_version: string;
    action_rule: "ALL" | "WHITELIST" | "BLACKLIST"
}

interface IAssetsServerChildrenRow extends IAssetsServerChildren, RowDataPacket { }