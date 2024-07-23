import { S3Client } from "@aws-sdk/client-s3";
import Logs from "./utils/logs";

export default class S3 {

    private static _s3Client: S3Client | undefined;

    public static init(): void {

        this._s3Client = new S3Client({
            region: "path-style",
            forcePathStyle: true,
            endpoint: "http://s3api.bdstw.org:9800",
            credentials: {
                accessKeyId: process.env.S3_ACCESS_TOKEN as string,
                secretAccessKey: process.env.S3_SECRET as string,
            }
        });

        Logs.info("S3 initialized successfully.");
    }

    public static client(): S3Client {
        if (this._s3Client) {
            return this._s3Client;
        } else {
            throw new Error("No S3 connection.");
        }
    }
}