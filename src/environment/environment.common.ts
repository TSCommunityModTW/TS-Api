import { API_VERSION } from "../version";

export const environment = {
    api_version: API_VERSION,
    jwt: {
        increaseTime: 600000
    },
    s3_ts_launcher_metadata_bucket: "ts-launcher-metadata"
}
