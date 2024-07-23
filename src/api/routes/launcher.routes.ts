import { Application } from "express";

import LauncherController from "../controllers/launcher.controller";
import IRoutes from "./IRoutes"

export default class LauncherRouter extends IRoutes {

    private _launcherController = new LauncherController();

    constructor(app: Application) {
        super(app, "/launcher");
    }

    protected _loadRoutes(): void {
        this._routers.route("/metadata/server/version")
            .get((req, res) => this._launcherController.getMetadataServerVersion(req, res));
        this._routers.route("/assets/servers")
            .get((req, res) => this._launcherController.getAssetsServers(req, res));
        this._routers.route("/assets/servers/:serverId")
            .get((req, res) => this._launcherController.getAssetsServer(req, res));
        this._routers.route("/assets/servers/:serverId/childrens")
            .get((req, res) => this._launcherController.getAssetsServerChildrens(req, res));
        this._routers.route("/assets/server/logo/image")
            .post((req, res) => this._launcherController.uploadServerLogoImage(req, res));

        // .get((req, res) => this._launcherController.getAssets(req, res));
    }
}
