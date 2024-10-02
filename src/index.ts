import "dotenv/config";

import App from "./app";
import { config } from "./config/config";

new App().listen(config.port);
