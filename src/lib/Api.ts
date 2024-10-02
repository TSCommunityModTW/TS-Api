import got from "got";
import Got from "./Got";
import { error } from "console";

export default class Api {

    private static readonly _curseForgeBaseUrl = "https://api.curseforge.com/v1";

    public static async getCurseForgeModInfo(projectId: string, fileId: string): Promise<ICurseforgeModuleInfo | undefined> {

        // curseForgeResponse.body.forEach((item) => console.log(item.name));
        // console.log(curseForgeResponse.body.length);

        // const curseForgeResponse = await got.get<any>("https://api.curseforge.com/v1/mods/search?gameId=432&classId=6&sortField=2&sortOrder=desc&pageSize=20&index=2000", {
        //     headers: {
        //         "Accept":"application/json",
        //         "x-api-key": process.env.CURSEFORGE_KEY
        //     },
        //     responseType: "json"
        // });

        // curseForgeResponse.body.data.forEach((item: any) => console.log(item.name));

        const response = await Got.get<ICurseforgeModuleInfo>(this._curseForgeBaseUrl + `/mods/${projectId}/files/${fileId}`, {
            headers: {
                "Accept": "application/json",
                "x-api-key": process.env.CURSEFORGE_KEY
            },
            responseType: "json"
        });

        // if (response === null) {
        //     throw {
        //         error: "request_error",
        //         error_description: "Request failed error."
        //     }
        // }

        // if (response.statusCode !== 200) {
        //     throw {
        //         error: "request_curseforge_error",
        //         error_description: "Request CurseForge Error."
        //     };
        // }

        if (!response || response.statusCode !== 200) {
            return undefined;
        } else {
            return response.body;
        }
    }

    public static async getMods(modIds: Array<string>): Promise<any> {

        const curseForgeModsResponse = await got.post<any>(this._curseForgeBaseUrl + "/mods", {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "x-api-key": process.env.CURSEFORGE_KEY
            },
            responseType: "json",
            json: {
                modIds: modIds
            }
        });

        if (curseForgeModsResponse.statusCode !== 200) {
            throw {
                error: "request_curseforge_error",
                error_description: "Request CurseForge Error."
            };
        }

        return curseForgeModsResponse.body;
    }

    public static async getModFiles(modFileIds: Array<string>): Promise<any> {

        const curseForgeModFilesResponse = await got.post<any>(this._curseForgeBaseUrl + "/mods/files", {
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "x-api-key": process.env.CURSEFORGE_KEY
            },
            responseType: "json",
            json: {
                fileIds: modFileIds
            }
        });

        if (curseForgeModFilesResponse.statusCode !== 200) {
            throw {
                error: "request_curseforge_error",
                error_description: "Request CurseForge Error."
            };
        }

        return curseForgeModFilesResponse.body;
    }
}

interface ICurseforgeModuleInfo {
    data: {
        id: number
        gameId: number
        modId: number
        isAvailable: boolean
        displayName: string
        fileName: string
        releaseType: number
        fileStatus: number
        hashes: Array<{
            value: string
            algo: number
        }>
        fileDate: string
        fileLength: number
        downloadCount: number
        downloadUrl: string
        gameVersions: string[]
        sortableGameVersions: Array<{
            gameVersionName: string
            gameVersionPadded: string
            gameVersion: string
            gameVersionReleaseDate: string
            gameVersionTypeId: number
        }>
        dependencies: any[]
        alternateFileId: number
        isServerPack: boolean
        fileFingerprint: number
        modules: Array<{
            name: string
            fingerprint: number
        }>
    }
}
