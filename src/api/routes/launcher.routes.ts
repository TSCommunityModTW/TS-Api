import { Application } from "express";

import LauncherController from "../controllers/launcher.controller";
import IRoutes from "./IRoutes"

export default class LauncherRouter extends IRoutes {

    private _launcherController = new LauncherController();

    constructor(app: Application) {
        super(app, "/launcher");
    }

    protected _loadRoutes(): void {
        this._routers.route("/servers/metadata")
            .get((req, res) => this._launcherController.getMetadataAssetsServers(req, res));
        this._routers.route("/servers")
            .get((req, res) => this._launcherController.getAssetsServers(req, res));
        this._routers.route("/servers/:serverId")
            .get((req, res) => this._launcherController.getAssetsServer(req, res))
            .patch((req, res) => this._launcherController.patchAssetsServer(req, res));
        this._routers.route("/servers/:serverId/children")
            .get((req, res) => this._launcherController.getAssetsServerChildrens(req, res));
        this._routers.route("/servers/:serverId/children/:childrenId")
            .patch((req, res) => this._launcherController.patchAssetsServerChildren(req, res));
        this._routers.route("/servers/:serverId/logo")
            .post((req, res) => this._launcherController.uploadServerLogoImage(req, res));
        this._routers.route("/modpacks/upload/temporary")
            .post((req, res) => this._launcherController.uploadModpack(req, res));
        this._routers.route("/children/:childrenId/versions/metadata")
            .get((req, res) => this._launcherController.getAssetsMetadataServerVersions(req, res));
        this._routers.route("/servers/:serverId/children/:childrenId/versions/:version/metadata")
            .get((req, res) => this._launcherController.getAssetsMetadataVersionMetadata(req, res));
    }
}
