import got, { OptionsOfJSONResponseBody, Response } from "got";
import Logs from "../utils/logs";

export default class Got {

    private static readonly _FETCH_ATTEMPTS = 3;

    public static async get<T>(url: string | URL, options?: OptionsOfJSONResponseBody): Promise<Response<T> | undefined> {

        let attempt = 0;

        while (++attempt <= this._FETCH_ATTEMPTS) {
            try {
                return await got.get<T>(url, options);
            } catch (e) {
                Logs.debug(`[Got] 取得檔案失敗，嘗試重新取得，嘗試次數: ${attempt}`);
            }
        }

        Logs.error(`[Got] 嘗試重新取得失敗, url: ${url}`);
        return undefined;
    }
}