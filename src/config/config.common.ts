import { API_VERSION } from "../version";

const S3_TS_LAUNCHER_METADATA_BUCKET = "ts-launcher-metadata";

export const configCommon = {
    api_version: API_VERSION,
    jwt: {
        increaseTime: 600000
    },
    s3: {
        ts_launcher_metadata_bucket: S3_TS_LAUNCHER_METADATA_BUCKET,
        ts_launcher_metadata_url: `https://s3api.tshosts.com/${S3_TS_LAUNCHER_METADATA_BUCKET}`
    }
}
