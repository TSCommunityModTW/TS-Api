import { configCommon } from "./config.common";
import { configProd } from "./config.prod";
import { configDev } from "./config.dev";

const ENV = process.env.NODE_ENV || "development";

let env;

switch (ENV) {
    case "production":
        env = configProd;
        break;
    case "development":
        env = configDev;
        break;
    default:
        throw new Error(`no matching constants file found for env '${env}'`);
}

export const config = Object.assign(configCommon, env);
