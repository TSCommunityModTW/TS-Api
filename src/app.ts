import * as express from "express";
import * as cors from "cors";
import * as morgan from "morgan";
import * as http from "http";
import * as fileUpload from "express-fileupload";

import Logs from "./utils/logs";
import SQL from "./sql";

import LauncherRouter from "./api/routes/launcher.routes";
import S3 from "./s3";
import SocketIo from "./socket/SocketIo";
import AuthRoutes from "./api/routes/auth.routes";
import { config } from "./config/config";

export default class App {

    private _app: express.Application;
    private _morganFormat = '[:date[iso]] :remote-addr - :remote-user ":method :url :status :response-time ms';

    constructor() {
        Logs.info(`Start model: ${process.env.NODE_ENV}`);
        Logs.info(`Version: ${config.api_version}`);
        this._app = express();
        this._init();
        this._middleware();
        this._routes();
    }

    private _init(): void {
        SQL.init();
        S3.init();
    }

    private _middleware(): void {

        // if (process.env.NODE_ENV === "development") {
        //     this._app.use(cors());
        // }
        this._app.use(cors());

        this._app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : this._morganFormat));
        this._app.use(express.json({ limit: "10MB" }));
        this._app.use(express.urlencoded({ extended: true }));
        this._app.use(fileUpload())
    }

    private _routes(): void {
        new LauncherRouter(this._app);
        new AuthRoutes(this._app);
    }

    public listen(port: number): void {
        this._app.set("port", port || 3000);
        const httpServer = http.createServer(this._app);
        httpServer.listen(port, () => {
            Logs.info("HTTP Api Service listening on PORT " + this._app.get("port"));
        });
        new SocketIo(httpServer).init();
    }
}