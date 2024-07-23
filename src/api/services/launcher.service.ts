import { v4 as uuidv4 } from "uuid";

import SQL from "../../sql";
import { IUploadServerLogoImage } from "../controllers/launcher.controller";
import { environment } from "../../environment/environment";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import S3 from "../../s3";
import Logs from "../../utils/logs";

export default class LauncherService {

    public async getAssetsServers(): Promise<any> {
        const queryData = await SQL.pool().query("SELECT * FROM `tsl_servers`");
        return queryData[0];
    }

    public async getAssetsServer(id: string): Promise<any> {
        const queryData = await SQL.pool().query("SELECT * FROM `tsl_servers` WHERE id = ?", [id]);
        return queryData[0];
    }

    public async getAssetsServerChildrens(id: string): Promise<any> {
        const queryData = await SQL.pool().query("SELECT * FROM `tsl_server_childrens` WHERE server_id = ?", [id]);
        return queryData[0];
    }

    public async uploadServerLogoImage(bodyData: IUploadServerLogoImage): Promise<{ fileKey: string }> {

        const fileKey = `/server/images/logo/${bodyData.serveId}/${uuidv4()}`;

        const uploadParams = {
            Bucket: environment.s3_ts_launcher_metadata_bucket,
            Key: fileKey,
            Body: bodyData.data
        };

        try {
            await S3.client().send(new PutObjectCommand(uploadParams));
            return { fileKey };
        } catch (error) {
            Logs.error(`Upload failed with error: ${error}`);
            throw new Error(`Upload failed with error: ${error}`);
        }
    }
}