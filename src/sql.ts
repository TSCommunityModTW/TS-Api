import { Pool, createPool } from "mysql2/promise";
import Logs from "./utils/logs";

export default class SQL {

    private static sqlPool: Pool | undefined;

    public static init(): void {

        this.sqlPool = createPool({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            connectionLimit: 30
        });

        this.sqlPool.query("SELECT 1").then(() => {
            Logs.info("SQL Pool initialized successfully.");
        }).catch((err) => {
            Logs.error(`SQL Pool initialization error: ${err}`);
        });
    }

    public static pool(): Pool {
        if (!this.sqlPool) {
            throw new Error("No SQL pool connection.")
        } else {
            return this.sqlPool;
        }
    }
}