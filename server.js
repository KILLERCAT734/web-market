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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Создаем папку для загрузок
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads', { recursive: true });
}

// Настройка multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Только изображения!'));
    }
});

// Middleware для проверки JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'cybersites_local_secret_key_2077', (err, user) => {
        if (err) return res.status(403).json({ error: 'Недействительный токен' });
        req.user = user;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (!req.user || !req.user.is_admin) {
        return res.status(403).json({ error: 'Требуются права администратора' });
    }
    next();
};

// ========== ГЛАВНАЯ ==========
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ========== АУТЕНТИФИКАЦИЯ ==========
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }
        
        const existing = await db.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2', 
            [email, username]
        );
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
            process.env.JWT_SECRET || 'cybersites_local_secret_key_2077',
            { expiresIn: '7d' }
        );
        
        res.status(201).json({ user, token });
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        const user = result.rows[0];
        let validPassword = false;
        
        if (email === 'admin@cybersites.2077' && password === 'admin123') {
            validPassword = true;
        } else {
            try {
                validPassword = await bcrypt.compare(password, user.password_hash);
            } catch (e) {
                validPassword = false;
            }
        }
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        
        await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
        
        const token = jwt.sign(
            { id: user.id, username: user.username, is_admin: user.is_admin },
            process.env.JWT_SECRET || 'cybersites_local_secret_key_2077',
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

app.get('/api/auth/verify', authenticateToken, (req, res) => {
    res.json({ user: req.user });
});

// ========== ЗАГРУЗКА ИЗОБРАЖЕНИЙ ==========
app.post('/api/upload', authenticateToken, requireAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'Файл не загружен' });
        const url = `/uploads/${req.file.filename}`;
        res.json({ url });
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ========== ТОВАРЫ ==========
app.get('/api/products', async (req, res) => {
    try {
        const { sort } = req.query;
        let query = 'SELECT * FROM products';
        
        switch(sort) {
            case 'price-asc':
                query += ' ORDER BY price ASC';
                break;
            case 'price-desc':
                query += ' ORDER BY price DESC';
                break;
            case 'rating-desc':
                query += ' ORDER BY rating DESC';
                break;
            case 'rating-asc':
                query += ' ORDER BY rating ASC';
                break;
            default:
                query += ' ORDER BY sales DESC';
        }
        
        const result = await db.query(query);
        const products = result.rows.map(p => ({
            ...p,
            price: parseFloat(p.price),
            rating: parseFloat(p.rating),
            features: p.features ? JSON.parse(p.features) : []
        }));
        res.json(products);
    } catch (error) {
        console.error('Ошибка товаров:', error);
        res.json([]);
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Товар не найден' });
        const p = result.rows[0];
        p.price = parseFloat(p.price);
        p.rating = parseFloat(p.rating);
        p.features = p.features ? JSON.parse(p.features) : [];
        res.json(p);
    } catch (error) {
        console.error('Ошибка товара:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title, description, price, category, features, image_url } = req.body;
        const result = await db.query(
            `INSERT INTO products (title, description, price, category, features, image_url) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [title, description, price, category, JSON.stringify(features || []), image_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка создания товара:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.put('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title, description, price, category, features, image_url } = req.body;
        const result = await db.query(
            `UPDATE products 
             SET title = $1, description = $2, price = $3, category = $4, features = $5, image_url = $6, updated_at = NOW()
             WHERE id = $7 RETURNING *`,
            [title, description, price, category, JSON.stringify(features || []), image_url, req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Товар не найден' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка обновления товара:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/api/products/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Товар не найден' });
        res.json({ message: 'Товар удален' });
    } catch (error) {
        console.error('Ошибка удаления товара:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ========== КОНТАКТЫ ==========
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        await db.query(
            'INSERT INTO contact_forms (name, email, subject, message) VALUES ($1, $2, $3, $4)',
            [name, email, subject, message]
        );
        res.status(201).json({ message: 'Сообщение отправлено' });
    } catch (error) {
        console.error('Ошибка контакта:', error);
        res.status(201).json({ message: 'Сообщение отправлено' });
    }
});

app.get('/api/contact', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM contact_forms ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.json([]);
    }
});

app.put('/api/contact/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE contact_forms SET status = $1 WHERE id = $2', [status, req.params.id]);
        res.json({ message: 'Статус обновлен' });
    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.delete('/api/contact/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        await db.query('DELETE FROM contact_forms WHERE id = $1', [req.params.id]);
        res.json({ message: 'Сообщение удалено' });
    } catch (error) {
        console.error('Ошибка удаления:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ========== ЗАКАЗЫ ==========
app.post('/api/orders', async (req, res) => {
    try {
        const { items, totalAmount, customer_name, customer_contact_method, customer_contact, requirements, payment_method, comment } = req.body;
        
        console.log('📦 Новый заказ от:', customer_name);
        
        let userId = null;
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cybersites_local_secret_key_2077');
                userId = decoded.id;
            } catch (e) {}
        }
        
        const prepayment = Math.round(totalAmount * 0.3);
        
        const orderResult = await db.query(
            `INSERT INTO orders (user_id, total_amount, status, customer_name, customer_contact_method, customer_contact, requirements, payment_method, prepayment_amount, comment) 
             VALUES ($1, $2, 'pending', $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [userId, totalAmount, customer_name, customer_contact_method, customer_contact, requirements, payment_method, prepayment, comment]
        );
        
        const orderId = orderResult.rows[0].id;
        
        for (const item of items) {
            await db.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [orderId, item.id, item.quantity, item.price]
            );
            await db.query('UPDATE products SET sales = sales + $1 WHERE id = $2', [item.quantity, item.id]);
        }
        
        console.log('✅ Заказ создан, ID:', orderId);
        res.status(201).json({ message: 'Заявка принята', order: orderResult.rows[0] });
    } catch (error) {
        console.error('❌ Ошибка заказа:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

app.get('/api/orders', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await db.query(`
            SELECT o.*, u.username 
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            ORDER BY o.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.json([]);
    }
});

// ВАЖНО: этот маршрут должен быть ДО /api/my-orders
app.get('/api/orders/:id', async (req, res) => {
    try {
        const orderResult = await db.query(
            `SELECT o.*, u.username, u.email 
             FROM orders o
             LEFT JOIN users u ON o.user_id = u.id
             WHERE o.id = $1`,
            [req.params.id]
        );
        
        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }

        const itemsResult = await db.query(
            `SELECT oi.*, p.title as product_title 
             FROM order_items oi
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
            [req.params.id]
        );

        const order = orderResult.rows[0];
        order.items = itemsResult.rows;
        
        res.json(order);
    } catch (error) {
        console.error('Ошибка получения заказа:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.put('/api/orders/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', [status, req.params.id]);
        res.json({ message: 'Статус обновлен' });
    } catch (error) {
        console.error('Ошибка обновления статуса:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

app.get('/api/my-orders', authenticateToken, async (req, res) => {
    try {
        const ordersResult = await db.query(
            `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
            [req.user.id]
        );
        
        const orders = [];
        for (const order of ordersResult.rows) {
            const itemsResult = await db.query(
                `SELECT oi.*, p.title 
                 FROM order_items oi
                 LEFT JOIN products p ON oi.product_id = p.id
                 WHERE oi.order_id = $1`,
                [order.id]
            );
            order.items = itemsResult.rows;
            orders.push(order);
        }
        
        res.json(orders);
    } catch (error) {
        console.error('Ошибка заказов пользователя:', error);
        res.json([]);
    }
});

// ========== ОТЗЫВЫ ==========
app.get('/api/reviews', authenticateToken, requireAdmin, async (req, res) => {
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
        console.error('Ошибка получения отзывов:', error);
        res.json([]);
    }
});

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
        console.error('Ошибка отзывов:', error);
        res.json([]);
    }
});

app.post('/api/reviews', authenticateToken, async (req, res) => {
    try {
        const { product_id, rating, comment } = req.body;
        
        if (!product_id || !rating || !comment) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }
        
        const productCheck = await db.query('SELECT id FROM products WHERE id = $1', [product_id]);
        if (productCheck.rows.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        
        const existingReview = await db.query(
            'SELECT id FROM reviews WHERE user_id = $1 AND product_id = $2',
            [req.user.id, product_id]
        );
        
        if (existingReview.rows.length > 0) {
            return res.status(400).json({ error: 'Вы уже оставляли отзыв на этот товар' });
        }
        
        const result = await db.query(
            'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.user.id, product_id, rating, comment]
        );
        
        await db.query(`
            UPDATE products 
            SET rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = $1), 0)
            WHERE id = $1
        `, [product_id]);
        
        console.log(`✅ Отзыв создан: пользователь ${req.user.id}, товар ${product_id}, рейтинг ${rating}`);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Ошибка создания отзыва:', error);
        res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
    }
});

app.delete('/api/reviews/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const reviewResult = await db.query('SELECT product_id FROM reviews WHERE id = $1', [req.params.id]);
        if (reviewResult.rows.length === 0) {
            return res.status(404).json({ error: 'Отзыв не найден' });
        }
        
        const productId = reviewResult.rows[0].product_id;
        
        await db.query('DELETE FROM reviews WHERE id = $1', [req.params.id]);
        
        if (productId) {
            await db.query(`
                UPDATE products 
                SET rating = COALESCE((SELECT AVG(rating) FROM reviews WHERE product_id = $1), 0)
                WHERE id = $1
            `, [productId]);
        }
        
        console.log(`✅ Отзыв ${req.params.id} удален`);
        res.json({ message: 'Отзыв удален' });
    } catch (error) {
        console.error('Ошибка удаления отзыва:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ========== ПОЛЬЗОВАТЕЛИ ==========
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await db.query('SELECT id, username, email, is_admin, created_at, last_login FROM users ORDER BY id');
        res.json(result.rows);
    } catch (error) {
        res.json([]);
    }
});

// ========== СТАТИСТИКА ==========
app.get('/api/stats', authenticateToken, requireAdmin, async (req, res) => {
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
        res.json({ products: 0, orders: 0, reviews: 0, users: 0 });
    }
});

// ========== НАСТРОЙКИ ==========
app.get('/api/settings', async (req, res) => {
    try {
        const result = await db.query('SELECT setting_key, setting_value FROM site_settings');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });
        res.json(settings);
    } catch (error) {
        res.json({
            hero_title: 'ДОБРО ПОЖАЛОВАТЬ В БУДУЩЕЕ',
            hero_subtitle: 'МЫ СОЗДАЕМ САЙТЫ, КОТОРЫЕ ВЫВОДЯТ ВАШ БИЗНЕС В 2077 ГОД',
            contact_address: 'НЕБОСКРЕБ "КИБЕР-ТАУЭР", УЛ. БУДУЩЕГО, 2077, НЕО-ТОКИО',
            contact_phone: '+7 (2077) 123-45-67',
            contact_email: 'INFO@CYBERSITES.2077'
        });
    }
});

app.get('/api/admin/settings', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM site_settings ORDER BY setting_key');
        res.json(result.rows);
    } catch (error) {
        res.json([]);
    }
});

app.put('/api/settings', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const settings = req.body;
        for (const [key, value] of Object.entries(settings)) {
            await db.query(
                `INSERT INTO site_settings (setting_key, setting_value) VALUES ($1, $2)
                 ON CONFLICT (setting_key) DO UPDATE SET setting_value = $2, updated_at = NOW()`,
                [key, value]
            );
        }
        res.json({ message: 'Настройки сохранены' });
    } catch (error) {
        console.error('Ошибка сохранения настроек:', error);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// ========== ЗАПУСК ==========
app.listen(PORT, () => {
    console.log(`🚀 Сервер: http://localhost:${PORT}`);
    console.log(`🔐 Админ: http://localhost:${PORT}/admin.html`);
    console.log(`📧 Логин: admin@cybersites.2077 | Пароль: admin123`);
});