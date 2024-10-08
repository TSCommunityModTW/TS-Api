import got from "got";
import * as admZip from "adm-zip";
import Logs from "../utils/logs";
import S3 from "../s3";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import Api from "./Api";
import { Socket } from "socket.io";
import SQL from "../sql";
import { RowDataPacket } from "mysql2";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/config";
import * as crypto from "crypto";

export class Homemade {

    private _socket: Socket;
    private _name: string;
    private _version: string;

    constructor(socket: Socket, name: string, newVersion: string) {
        this._socket = socket;
        this._name = name;
        this._version = newVersion.replace("v", "");
    }

    public async handle(url: string): Promise<void> {

        this._socket.emit("LAUNCHET_SERVER_FILE_REPLY_LOG", { type: "INFO", messages: `Download file to api server... (${url})` });

        const buffer = await got.get(url).buffer();

        const zip = new admZip(buffer);
        const zipEntries = zip.getEntries();

        let manifestData: IManifestJson | undefined;

        zipEntries.forEach((entry) => {
            if (entry.name === "manifest.json") {
                manifestData = JSON.parse(entry.getData().toString());
            }
        });

        // Logs.debug(manifestData);

        if (!manifestData) {
            return Promise.reject({ error: "Invalid_manifest", errorMessage: "Invalid manifest.json file date." });
        }

        this._socket.emit("LAUNCHET_SERVER_FILE_REPLY_LOG", { type: "INFO", messages: "Parse manifest file..." });
        const manifest = await parseManifest(manifestData, this._socket);

        if (manifest.errorModIds.length > 0) {
            this._socket.emit("LAUNCHET_SERVER_FILE_REPLY_ERROR", { type: "GET_MODULE_ERROR", modIds: manifest.errorModIds });
            // TODO:
        } else {
            this._socket.emit("LAUNCHET_SERVER_FILE_REPLY_OK");
        }

        let filesAllSize: number = 0;
        const files: Array<IVersionManifestFile> = new Array();

        this._socket.once("LAUNCHET_SERVER_FILE_OK", async (data: { serverId: string, childrenId: string }) => {
            // Handle upload mod files
            for (const mod of manifest.mods) {

                const buffer = await got.get(mod.downloadUrl).buffer();

                const fileKey = `assets/game_files/${data.serverId}/${data.childrenId}/${this._version}/mods/${mod.fileName}`;

                const uploadParams = {
                    Bucket: "ts-launcher-metadata",
                    Key: fileKey,
                    Body: buffer
                };

                S3.client().send(new PutObjectCommand(uploadParams))
                    .then(() => {
                        const log = `Upload mod successful file ${fileKey}`;
                        this._socket.emit("LAUNCHET_SERVER_FILE_REPLY_LOG", { type: "INFO", messages: log });
                        Logs.debug(log);
                    })
                    .catch((err) => {
                        const log = `Failed to upload ${fileKey}: ${err}`;
                        this._socket.emit("LAUNCHET_SERVER_FILE_REPLY_LOG", { type: "ERROR", messages: log });
                        Logs.error(log);
                    });

                let hash: string = "";

                try {
                    hash = crypto.createHash("sha1").update(buffer).digest("hex");
                } catch (err) {
                    const log = `Failed to generate a SHA1 hash for ${fileKey}: ${err}`;
                    this._socket.emit("LAUNCHET_SERVER_FILE_REPLY_LOG", { type: "ERROR", messages: log });
                    Logs.error(log);
                }

                files.push({
                    name: mod.name,
                    fileName: mod.fileName,
                    projectId: mod.projectId,
                    fileId: mod.fileId,
                    platform: mod.platform,
                    downloadUrl: encodeURI(`${config.s3.ts_launcher_metadata_url}/${fileKey}`),
                    installPath: `mods/${mod.fileName}`,
                    size: buffer.byteLength,
                    hash
                });

                filesAllSize += buffer.byteLength;
            }


            // Handle upload other files
            for (const entry of zipEntries) {
                if (entry.entryName.split("/")[0] === "overrides" && !entry.isDirectory && entry.name !== ".DS_Store") {

                    const fileKey = `assets/game_files/${data.serverId}/${data.childrenId}/${this._version}/${entry.entryName.replace("overrides/", "")}`;
                    const buffer = entry.getData();

                    const uploadParams = {
                        Bucket: "ts-launcher-metadata",
                        Key: fileKey,
                        Body: buffer
                    };

                    S3.client().send(new PutObjectCommand(uploadParams))
                        .then(() => {
                            const log = `Upload successful file ${fileKey}`;
                            this._socket.emit("LAUNCHET_SERVER_FILE_REPLY_LOG", { type: "INFO", messages: log });
                            Logs.debug(log);
                        })
                        .catch((err) => {
                            const log = `Failed to upload ${fileKey}: ${err}`;
                            this._socket.emit("LAUNCHET_SERVER_FILE_REPLY_LOG", { type: "ERROR", messages: log });
                            Logs.error(log);
                        });

                    let hash: string = "";

                    try {
                        hash = crypto.createHash("sha1").update(buffer).digest("hex");
                    } catch (err) {
                        const log = `Failed to generate a SHA1 hash for ${fileKey}: ${err}`;
                        this._socket.emit("LAUNCHET_SERVER_FILE_REPLY_LOG", { type: "ERROR", messages: log });
                        Logs.error(log);
                    }

                    files.push({
                        name: entry.name,
                        fileName: entry.name,
                        downloadUrl: encodeURI(`${config.s3.ts_launcher_metadata_url}/${fileKey}`),
                        installPath: entry.entryName.replace("overrides/", ""),
                        size: buffer.byteLength,
                        hash
                    });

                    filesAllSize += buffer.byteLength;
                }
            }

            const getModLoaderType = () => {
                if (manifest.modLoaderId.split("-")[0].toLowerCase() === "forge") {
                    return "Forge";
                } else if (manifest.modLoaderId.split("-")[0].toLowerCase() === "fabric") {
                    return "Fabric";
                } else {
                    throw {
                        error: "Unknown manifest type",
                        error_description: "Unknown manifest modloader type."
                    }
                }
            }

            const versionManifest: IVersionManifest = {
                version: this._version,
                name: this._name,
                size: filesAllSize,
                serverId: data.serverId,
                childrenServerId: data.childrenId,
                minecraft: {
                    version: manifest.minecraftVersion
                },
                modloader: {
                    type: getModLoaderType(),
                    version: manifest.modLoaderId.split("-")[1]
                },
                files: files
            }
            const versionManifestKey = `assets/game_files/${data.serverId}/${data.childrenId}/${this._version}/version_manifest.json`;
            await S3.client().send(new PutObjectCommand({
                Bucket: "ts-launcher-metadata",
                Key: versionManifestKey,
                Body: JSON.stringify(versionManifest),
                ContentType: "application/json"
            }));

            const [metadateRows] = await SQL.pool().query<IAssetsMetadata[]>("SELECT * FROM `assets_metadata` WHERE server_id = ? AND children_id = ?", [data.serverId, data.childrenId]);
            if (metadateRows.length === 0) {
                const assets_metadata_body = {
                    id: uuidv4().split("-")[0],
                    server_id: data.serverId,
                    children_id: data.childrenId,
                    latest: this._version,
                    version: this._version // TODO: 暫時使用相同的 value
                }
                await SQL.pool().query("INSERT INTO `assets_metadata` SET ?", [assets_metadata_body]);
            } else {
                await SQL.pool().query("UPDATE `assets_metadata` SET latest = ?, version = ? WHERE server_id = ? AND children_id = ?", [this._version, this._version, data.serverId, data.childrenId]); // TODO: version 暫時使用相同的 value
            }
            const [metadateVersionRows] = await SQL.pool().query<IAssetsMetadataVersion[]>("SELECT * FROM `assets_metadata_versions` WHERE children_id = ? AND version = ?", [data.childrenId, this._version]);
            const assets_metadata_versions_body = {
                id: uuidv4().split("-")[0],
                server_id: data.serverId,
                children_id: data.childrenId,
                name: this._name,
                version: this._version,
                manifest_url: `${config.s3.ts_launcher_metadata_url}/${versionManifestKey}`
            }
            if (metadateVersionRows.length === 0) {
                await SQL.pool().query("INSERT INTO `assets_metadata_versions` SET ?", [assets_metadata_versions_body]);
            } else {
                // TODO: TEST 有需要嗎？
                await SQL.pool().query("UPDATE `assets_metadata_versions` SET manifest_url = ?", [`${config.s3.ts_launcher_metadata_url}/${versionManifestKey}`]);
            }

            //* Remove s3 metadata temporary modpacks object
            await S3.client().send(new DeleteObjectCommand({
                Bucket: "ts-launcher-metadata",
                Key: url.split("ts-launcher-metadata/")[1],
            }));

            const log = "Upload version_manifest.json completed successfully.";
            this._socket.emit("LAUNCHET_SERVER_FILE_REPLY_LOG", { type: "INFO", messages: log });
            Logs.debug(log);

            this._socket.emit("LAUNCHET_SERVER_FILE_REPLY_S3_UPLOAD_OK");
        });
    }
}

async function parseManifest(manifestjsonData: IManifestJson, socket?: Socket) {

    const manifestMods: any[] = manifestjsonData.files;
    const mods: IManifestMod[] = [];

    const errorModIds: Array<{ projectId: string, fileId: string }> = new Array();

    for (let i = 0; i < manifestMods.length; i++) {

        const mod = manifestMods[i];

        try {
            const modInfo = await Api.getCurseForgeModInfo(mod.projectID, mod.fileID);

            if (!modInfo) {
                errorModIds.push({ projectId: mod.projectID, fileId: mod.fileID });
                Logs.debug(`[Error] Cannot find modInfo for ProjectID:"${mod.projectID}" FileID:"${mod.fileID}"`)
                continue;
            }

            const module = modInfo.data;

            const log = `Get module ${i + 1}/${manifestMods.length} Name: ${module.displayName}`;
            if (socket) socket.emit("LAUNCHET_SERVER_FILE_REPLY_LOG", { type: "INFO", messages: log });
            Logs.debug(log);

            mods.push({
                name: module.displayName,
                platform: "CurseForge",
                projectId: module.modId,
                fileId: module.id,
                fileName: module.fileName,
                downloadUrl: module.downloadUrl ? module.downloadUrl : flxCurseforgeDownloadUrlNullIssues(module.id, module.fileName),
                fileFingerprint: module.fileFingerprint,
                size: module.fileLength
            });
        } catch (error: any) {
            Logs.error(error);
        }
    }

    return {
        mods: mods,
        modLoaderId: manifestjsonData.minecraft.modLoaders[0].id,
        minecraftVersion: manifestjsonData.minecraft.version,
        errorModIds: errorModIds
    }
}

//! Flx curseforge api downloadUrl null issues
function flxCurseforgeDownloadUrlNullIssues(fileId: number, fileName: string, socket?: Socket): string {
    const forgecdnBaseUrl = "https://edge.forgecdn.net";
    const fileIdSplit = fileId.toString().split("");
    const url1 = fileIdSplit.slice(0, 4).join("");
    const url2 = fileIdSplit.slice(4).join("").replace(/^[0]+|$/g, "");
    const flxUrl = `${forgecdnBaseUrl}/files/${url1}/${url2}/${fileName}`;
    // console.log(chalk.bold.yellow(`\n Flx CurseForge Url Not Null. Name: ${fileName} Url: ${flxUrl}`));
    const log = `\n Flx CurseForge Url Not Null. Name: ${fileName} Url: ${flxUrl}`;
    if (socket) socket.emit("LAUNCHET_SERVER_FILE_REPLY_LOG", { type: "INFO", messages: log });
    Logs.debug(log);
    // if (spinner) spinner.update({ text: `Flx CurseForge Url Not Null. Name: ${fileName}` });
    return flxUrl;
}

interface IAssetsMetadata extends RowDataPacket {
    id: string;
    server_id: string;
    children_id: string;
    latest: string;
    version: string;
}

interface IAssetsMetadataVersion extends RowDataPacket {
    id: string;
    server_id: string;
    children_id: string;
    name: string;
    version: string;
    manifest_url: string;
}

interface IManifestMod {
    name: string;
    platform: "CurseForge" | "Modrinth";
    projectId: number;
    fileId: number;
    fileName: string;
    downloadUrl: string;
    fileFingerprint: any;
    size: number;
}

interface IManifestJson {
    minecraft: {
        version: string;
        modLoaders: Array<{
            id: string;
            primary: boolean;
        }>
    };
    manifestType: string;
    manifestVersion: number;
    name: string;
    version: string;
    author: string;
    files: Array<{
        projectID: number;
        fileID: number;
        required: boolean;
    }>
}

export interface IVersionManifest {
    version: string;
    name: string;
    size: number;
    serverId: string;
    childrenServerId: string;
    minecraft: {
        version: string;
    };
    modloader: {
        type: "Forge" | "Fabric",
        version: string;
    }
    files: Array<IVersionManifestFile>
}

interface IVersionManifestFile {
    name: string;
    fileName: string;
    projectId?: number;
    fileId?: number;
    platform?: "CurseForge" | "Modrinth",
    downloadUrl: string;
    installPath: string;
    size: number;
    hash: string;
}

// interface IAssetsMetadata {
//     servers: Array<{
//         name: string;
//         serverId: string;
//         childrens: Array<{
//             name: string;
//             id: string;
//             latest: string;
//             game_files: Array<{
//                 version: string
//                 manifest_url: string;
//             }>
//         }>
//     }>
// }