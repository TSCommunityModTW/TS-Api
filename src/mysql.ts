import { Pool, createPool } from "mysql2/promise";

export default class Mysql {

    private static mysqlPool: Pool | undefined;

    public static init(): void {
        this.mysqlPool = createPool({
            host: process.env.MYSQL_HOST,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_PASSWORD,
            database: process.env.MYSQL_DATABASE,
            connectionLimit: 30
        });
    }

    public static pool(): Pool {
        if (!this.mysqlPool) {
            throw new Error("No MySQL pool connection.")
        } else {
            return this.mysqlPool;
        }
    }
}