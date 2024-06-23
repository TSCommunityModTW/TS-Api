import "dotenv/config";

import App from "./app";
import { environment } from "./environment/environment";

new App().listen(environment.port);
