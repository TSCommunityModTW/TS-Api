import { Router, Application } from "express";
import AuthJwtVerify from "../middlewares/authJwtVerify";

export default abstract class IRoutes {

    protected _routers: Router;
    protected _authJwtVerify = new AuthJwtVerify();

    constructor(app: Application, routerRoot?: string) {
        this._routers = Router();
        this._loadRoutes();

        if (routerRoot === undefined) {
            app.use(this._routers);
        } else {
            app.use(routerRoot, this._routers);
        }
    }

    protected abstract _loadRoutes(): void;
}
