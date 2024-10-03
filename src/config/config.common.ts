import { API_VERSION } from "../version";

export const configCommon = {
    api_version: API_VERSION,
    jwt: {
        increaseTime: 600000
    },
    s3_ts_launcher_metadata_bucket: "ts-launcher-metadata",
    s3_ts_launcher_metadata_url: "http://s3api.tshosts.com:9800/ts-launcher-metadata"
}
