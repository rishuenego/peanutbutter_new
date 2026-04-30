import mysql from 'mysql2/promise';
const connectionString = process.env.DATABASE_URL;
let poolConfig;
if (connectionString) {
    poolConfig = {
        uri: connectionString,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    };
}
else {
    poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'nutbaba',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 10000, // 10 seconds
        maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
        idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    };
}
export const pool = mysql.createPool(poolConfig);
export async function query(sql, params) {
    const [results] = await pool.query(sql, params);
    return results;
}
export async function getOne(sql, params) {
    const [rows] = await pool.query(sql, params);
    const results = rows;
    return results.length > 0 ? results[0] : null;
}
export async function getMany(sql, params) {
    const [rows] = await pool.query(sql, params);
    return rows;
}
export async function execute(sql, params) {
    const [result] = await pool.query(sql, params);
    return result;
}
