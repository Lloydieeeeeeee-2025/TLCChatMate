import mysql from "mysql2/promise"

export const chatmate = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "kmlV3@VVVE$$56nnmh",
    database: process.env.DB_NAME || "tlcchatmate",
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});


/*
export const chatmate = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "tlcchatmate",
    port: 3306,
});
*/

// latest wgen september 21, 2025
{/*
export const chatmate = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatmate",
    port: 3306
})    
*/}

// latest when september 15, 2025
{/*
export const chatmate = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "capstone",
    port: 3306
})
*/}
{/*
export const chatmate = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "chatmate",
    port: 3306
})    
*/}
{/*
export const tlcchatmatedb = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "tlcchatmate",
    port: 3306
})    
*/}