import { Router, Application } from "express";
import AuthJwtVerify from "../middlewares/authJwtVerify";
import Logs from "../../utils/logs";

export default abstract class IRoutes {

    protected _routers: Router;
    protected _authJwtVerify = new AuthJwtVerify();

    constructor(app: Application, routerRoot?: string) {
        this._routers = Router();
        this._loadRoutes();

        if (!routerRoot) {
            app.use(this._routers);
            Logs.info(`Initialized routes: NULL`);
        } else {
            app.use(routerRoot, this._routers);
            Logs.info(`Initialized routes: ${routerRoot}`);
        }
    }

    protected abstract _loadRoutes(): void;
}
