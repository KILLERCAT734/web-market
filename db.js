const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'cybersites_db',
    port: process.env.DB_PORT || 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Ошибка подключения к базе данных:', err.stack);
        console.error('💡 Проверьте, что PostgreSQL запущен и база данных cybersites_db создана');
        return;
    }
    console.log('✅ Успешное подключение к базе данных cybersites_db');
    release();
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool: pool
};