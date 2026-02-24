import mysql from "mysql2/promise"

// production
export const chatmate = mysql.createPool({
    host: process.env.DB_HOST || "db",
    user: process.env.DB_USER || "tlcuser",
    password: process.env.DB_PASSWORD || "StrongAppPass123!",
    database: process.env.DB_NAME || "tlcchatmate",
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});



// localhost
/*
export const chatmate = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "tlcchatmate",
    port: 3306,
});

*/
