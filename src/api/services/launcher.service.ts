import SQL from "../../sql";

export default class LauncherService {

    public async getAssetsServers(): Promise<any> {
        const queryData = await SQL.pool().query("SELECT * FROM `tsl_servers`");
        return queryData[0];
    }

    public async getAssetsServerChildrens(id: string): Promise<any> {
        const queryData = await SQL.pool().query("SELECT * FROM `tsl_server_childrens` WHERE server_id = ?", [id]);
        return queryData[0];
    }
}