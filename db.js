const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Ошибка подключения к базе данных:', err.stack);
    }
    console.log('✅ Успешное подключение к базе данных cybersites_db');
    release();
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool
};