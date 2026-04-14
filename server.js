const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0'; // Обязательно для Render

// ...

const HOST = '0.0.0.0'; // Обязательно для Render!

app.listen(PORT, HOST, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`🔐 Админ-панель доступна по адресу /admin.html`);
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Создаем папку для загрузок если её нет
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// Настройка multer для загрузки изображений
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Только изображения!'));
    }
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ========== АУТЕНТИФИКАЦИЯ ==========

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        const user = result.rows[0];
        
        // Временное решение для админа
        let validPassword = false;
        if (email === 'admin@cybersites.2077' && (password === 'admin123' || user.password_hash === 'temp')) {
            validPassword = true;
        } else {
            validPassword = await bcrypt.compare(password, user.password_hash);
        }
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
        
        const token = jwt.sign(
            { id: user.id, username: user.username, is_admin: user.is_admin },
            process.env.JWT_SECRET || 'cybersites_secret_2077',
            { expiresIn: '7d' }
        );
        
        res.json({
            user: { id: user.id, username: user.username, email: user.email, is_admin: user.is_admin },
            token
        });
    } catch (error) {
        console.error('Ошибка входа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        const existing = await db.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Пользователь уже существует' });
        }
        
        const hashed = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, is_admin',
            [username, email, hashed]
        );
        
        const user = result.rows[0];
        const token = jwt.sign(
            { id: user.id, username: user.username, is_admin: user.is_admin },
            process.env.JWT_SECRET || 'cybersites_secret_2077',
            { expiresIn: '7d' }
        );
        
        res.status(201).json({ user, token });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/auth/verify', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Токен не предоставлен' });
    
    jwt.verify(token, process.env.JWT_SECRET || 'cybersites_secret_2077', (err, user) => {
        if (err) return res.status(403).json({ error: 'Недействительный токен' });
        res.json({ user });
    });
});

// ========== ТОВАРЫ ==========

app.get('/api/products', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products ORDER BY sales DESC');
        const products = result.rows.map(p => ({
            ...p,
            price: parseFloat(p.price),
            rating: parseFloat(p.rating),
            features: p.features ? JSON.parse(p.features) : [],
            image_url: p.image_url || null
        }));
        res.json(products);
    } catch (error) {
        console.error('Ошибка получения товаров:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        const product = {
            ...result.rows[0],
            price: parseFloat(result.rows[0].price),
            rating: parseFloat(result.rows[0].rating),
            features: result.rows[0].features ? JSON.parse(result.rows[0].features) : []
        };
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ========== АДМИНСКИЕ МАРШРУТЫ ==========

const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Требуется авторизация' });
    
    jwt.verify(token, process.env.JWT_SECRET || 'cybersites_secret_2077', (err, user) => {
        if (err) return res.status(403).json({ error: 'Недействительный токен' });
        req.user = user;
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (!req.user?.is_admin) return res.status(403).json({ error: 'Требуются права администратора' });
    next();
};

// Загрузка изображения
app.post('/api/upload', authenticateToken, isAdmin, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
    res.json({ url: `/uploads/${req.file.filename}` });
});

// Добавление товара
app.post('/api/products', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { title, description, price, category, features, image_url } = req.body;
        
        const result = await db.query(
            `INSERT INTO products (title, description, price, category, features, image_url, rating, sales) 
             VALUES ($1, $2, $3, $4, $5, $6, 0, 0) RETURNING *`,
            [title, description, price, category, JSON.stringify(features || []), image_url]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка добавления товара:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обновление товара
app.put('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, price, category, features, image_url } = req.body;
        
        const result = await db.query(
            `UPDATE products 
             SET title = $1, description = $2, price = $3, category = $4, 
                 features = $5, image_url = $6, updated_at = NOW()
             WHERE id = $7 RETURNING *`,
            [title, description, price, category, JSON.stringify(features || []), image_url, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка обновления товара:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Удаление товара
app.delete('/api/products/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM products WHERE id = $1', [req.params.id]);
        res.json({ message: 'Товар удален' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ========== ОТЗЫВЫ ==========

app.get('/api/reviews/product/:productId', async (req, res) => {
    try {
        const result = await db.query(
            `SELECT r.*, u.username 
             FROM reviews r 
             LEFT JOIN users u ON r.user_id = u.id 
             WHERE r.product_id = $1 
             ORDER BY r.created_at DESC`,
            [req.params.productId]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/reviews', authenticateToken, async (req, res) => {
    try {
        const { product_id, rating, comment } = req.body;
        const user_id = req.user.id;
        
        // Проверка на существующий отзыв
        const existing = await db.query(
            'SELECT * FROM reviews WHERE user_id = $1 AND product_id = $2',
            [user_id, product_id]
        );
        
        if (existing.rows.length > 0) {
            return res.status(400).json({ error: 'Вы уже оставили отзыв на этот товар' });
        }
        
        const result = await db.query(
            'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
            [user_id, product_id, rating, comment]
        );
        
        // Обновляем средний рейтинг товара
        await db.query(
            'UPDATE products SET rating = (SELECT AVG(rating) FROM reviews WHERE product_id = $1) WHERE id = $1',
            [product_id]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка создания отзыва:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ========== ЗАКАЗЫ ==========

// Создание заказа (обновлённая версия)
app.post('/api/orders', async (req, res) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        const { 
            items, 
            totalAmount,
            prepaymentAmount,
            customer_name,
            customer_contact_method,
            customer_contact,
            requirements,
            payment_method,
            comment
        } = req.body;
        
        // Определяем пользователя по токену (если есть)
        let user_id = null;
        const token = req.headers['authorization']?.split(' ')[1];
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cybersites_secret_2077');
                user_id = decoded.id;
            } catch (e) {}
        }
        
        const orderResult = await client.query(
            `INSERT INTO orders (
                user_id, total_amount, prepayment_amount, status, 
                customer_name, customer_contact_method, customer_contact,
                requirements, payment_method, comment
            ) VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8, $9) RETURNING *`,
            [user_id, totalAmount, prepaymentAmount, customer_name, 
             customer_contact_method, customer_contact, requirements, payment_method, comment]
        );
        
        const orderId = orderResult.rows[0].id;
        
        for (const item of items) {
            await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [orderId, item.id, item.quantity, item.price]
            );
        }
        
        await client.query('COMMIT');
        res.status(201).json({ 
            message: 'Заявка принята', 
            order: orderResult.rows[0] 
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Ошибка создания заказа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    } finally {
        client.release();
    }
}); 

// Админские маршруты для заказов
app.get('/api/orders', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT o.*, u.username 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/orders/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const order = await db.query(
            `SELECT o.*, u.username, u.email 
             FROM orders o 
             LEFT JOIN users u ON o.user_id = u.id 
             WHERE o.id = $1`,
            [req.params.id]
        );
        
        if (order.rows.length === 0) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }
        
        const items = await db.query(
            `SELECT oi.*, p.title as product_title 
             FROM order_items oi 
             LEFT JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = $1`,
            [req.params.id]
        );
        
        res.json({ ...order.rows[0], items: items.rows });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.put('/api/orders/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', [status, req.params.id]);
        res.json({ message: 'Статус обновлен' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Админские маршруты для отзывов
app.get('/api/reviews', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT r.*, u.username, p.title as product_title 
            FROM reviews r 
            LEFT JOIN users u ON r.user_id = u.id 
            LEFT JOIN products p ON r.product_id = p.id 
            ORDER BY r.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/api/reviews/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
        res.json({ message: 'Отзыв удален' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Контактные формы
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        await db.query(
            'INSERT INTO contact_forms (name, email, subject, message) VALUES ($1, $2, $3, $4)',
            [name, email, subject, message]
        );
        res.status(201).json({ message: 'Сообщение отправлено' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/contact', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM contact_forms ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.put('/api/contact/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE contact_forms SET status = $1 WHERE id = $2', [status, req.params.id]);
        res.json({ message: 'Статус обновлен' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/api/contact/:id', authenticateToken, isAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM contact_forms WHERE id = $1', [req.params.id]);
        res.json({ message: 'Сообщение удалено' });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Пользователи
app.get('/api/users', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, username, email, is_admin, created_at, last_login FROM users ORDER BY id'
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Статистика
app.get('/api/stats', async (req, res) => {
    try {
        const products = await db.query('SELECT COUNT(*) FROM products');
        const orders = await db.query('SELECT COUNT(*) FROM orders');
        const reviews = await db.query('SELECT COUNT(*) FROM reviews');
        const users = await db.query('SELECT COUNT(*) FROM users');
        
        res.json({
            products: parseInt(products.rows[0].count),
            orders: parseInt(orders.rows[0].count),
            reviews: parseInt(reviews.rows[0].count),
            users: parseInt(users.rows[0].count)
        });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});
// ========== НАСТРОЙКИ САЙТА ==========

// Получение всех настроек (публичный)
app.get('/api/settings', async (req, res) => {
    try {
        const result = await db.query('SELECT setting_key, setting_value FROM site_settings');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение настройки по ключу
app.get('/api/settings/:key', async (req, res) => {
    try {
        const result = await db.query(
            'SELECT setting_value FROM site_settings WHERE setting_key = $1',
            [req.params.key]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Настройка не найдена' });
        }
        res.json({ value: result.rows[0].setting_value });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Обновление настроек (админ)
app.put('/api/settings', authenticateToken, isAdmin, async (req, res) => {
    try {
        const settings = req.body;
        
        for (const [key, value] of Object.entries(settings)) {
            await db.query(
                `UPDATE site_settings 
                 SET setting_value = $1, updated_at = NOW() 
                 WHERE setting_key = $2`,
                [value, key]
            );
        }
        
        res.json({ message: 'Настройки обновлены' });
    } catch (error) {
        console.error('Ошибка обновления настроек:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение всех настроек для админки
app.get('/api/admin/settings', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM site_settings ORDER BY setting_key');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ========== ЗАПУСК ==========
app.listen(PORT, () => {
    console.log(`🚀 Сервер: http://localhost:${PORT}`);
    console.log(`🔐 Админ: http://localhost:${PORT}/admin.html`);
});
// ========== ЗАКАЗЫ ПОЛЬЗОВАТЕЛЯ ==========

// Получение заказов текущего пользователя
app.get('/api/my-orders', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Получаем заказы пользователя
        const ordersResult = await db.query(
            `SELECT o.*, 
                    (SELECT json_agg(json_build_object(
                        'id', oi.id,
                        'product_id', oi.product_id,
                        'quantity', oi.quantity,
                        'price', oi.price,
                        'title', p.title,
                        'image_url', p.image_url
                    )) 
                    FROM order_items oi 
                    LEFT JOIN products p ON oi.product_id = p.id 
                    WHERE oi.order_id = o.id) as items
             FROM orders o 
             WHERE o.user_id = $1 
             ORDER BY o.created_at DESC`,
            [userId]
        );
        
        res.json(ordersResult.rows);
    } catch (error) {
        console.error('Ошибка получения заказов:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение конкретного заказа пользователя
app.get('/api/my-orders/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const orderId = req.params.id;
        
        // Проверяем, принадлежит ли заказ пользователю
        const orderResult = await db.query(
            `SELECT o.*, u.email, u.username
             FROM orders o 
             LEFT JOIN users u ON o.user_id = u.id 
             WHERE o.id = $1 AND o.user_id = $2`,
            [orderId, userId]
        );
        
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }
        
        // Получаем товары в заказе
        const itemsResult = await db.query(
            `SELECT oi.*, p.title, p.image_url, p.category
             FROM order_items oi 
             LEFT JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = $1`,
            [orderId]
        );
        
        const order = orderResult.rows[0];
        order.items = itemsResult.rows;
        
        res.json(order);
    } catch (error) {
        console.error('Ошибка получения заказа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});