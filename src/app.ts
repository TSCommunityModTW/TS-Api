import * as express from "express";
import * as cors from "cors";
import * as morgan from "morgan";

import Logs from "./utils/logs";

import { environment } from "./environment/environment";
import Mysql from "./mysql";

export default class App {

    private _app: express.Application;
    private _morganFormat = '[:date[iso]] :remote-addr - :remote-user ":method :url :status :response-time ms';

    constructor() {
        this._app = express();
        this._init();
    }

    private _init(): void {
        Logs.info(`Api Service start model: ${process.env.NODE_ENV}`);
        Logs.info(`Api Service Version: ${environment.api_version}`);
        Mysql.init();
    }

    private _middleware(): void {

        if (process.env.NODE_ENV === "production") {
            this._app.use(cors());
        }

        this._app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : this._morganFormat));
        this._app.use(express.json({ limit: "10MB" }));
        this._app.use(express.urlencoded({ extended: true }));
    }

    private _routes(): void {

    }
}