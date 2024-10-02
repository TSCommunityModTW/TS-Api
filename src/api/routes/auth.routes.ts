import { Application } from "express";

import AuthController from "../controllers/auth.controller";
import IRoutes from "./IRoutes";

export default class AuthRoutes extends IRoutes {

    private _authController: AuthController = new AuthController();

    constructor(app: Application) {
        super(app);
    }

    protected _loadRoutes(): void {
        this._routers.post("/oauth2/token", (req, res) => this._authController.login(req, res));
    }
}
