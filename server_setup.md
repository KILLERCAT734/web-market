# Настройка серверной части для постоянного хостинга

## 1. Требования к хостингу

Для развертывания сайта с базой данных вам понадобится:
- **Хостинг с поддержкой Node.js** (например, Heroku, Render, Railway, AWS, DigitalOcean)
- **База данных MySQL/PostgreSQL** (можно использовать бесплатные планы на AWS RDS, PlanetScale, Neon)
- **Доменное имя** (опционально, но рекомендуется для production)

## 2. Установка и настройка

### 2.1. Установите Node.js
```bash
# Установите Node.js (если еще не установлен)
# Скачайте с https://nodejs.org/ или используйте nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
nvm install 18
```

### 2.2. Создайте проект
```bash
mkdir cyber-sites-server
cd cyber-sites-server
npm init -y
npm install express mysql2 cors dotenv jsonwebtoken bcryptjs
```

### 2.3. Создайте файл `server.js`
```javascript
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json());

// Подключение к базе данных
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Создание таблиц (если их нет)
async function createTables() {
    const connection = await pool.getConnection();

    // Таблица пользователей
    await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            email VARCHAR(100) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            is_admin BOOLEAN DEFAULT FALSE
        )
    `);

    // Таблица товаров
    await connection.query(`
        CREATE TABLE IF NOT EXISTS products (
            id INT AUTO_INCREMENT PRIMARY KEY,
            title VARCHAR(100) NOT NULL,
            description TEXT,
            price DECIMAL(10, 2) NOT NULL,
            category VARCHAR(50) NOT NULL,
            rating DECIMAL(3, 1) DEFAULT 0.0,
            sales INT DEFAULT 0,
            features TEXT,
            image_url VARCHAR(255),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `);

    // Таблица заказов
    await connection.query(`
        CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            total_amount DECIMAL(10, 2) NOT NULL,
            status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Таблица товаров в заказах
    await connection.query(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            product_id INT NOT NULL,
            quantity INT NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    `);

    // Таблица отзывов
    await connection.query(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            product_id INT NOT NULL,
            rating DECIMAL(3, 1) NOT NULL,
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (product_id) REFERENCES products(id)
        )
    `);

    // Таблица контактных форм
    await connection.query(`
        CREATE TABLE IF NOT EXISTS contact_forms (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            subject VARCHAR(200),
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status ENUM('new', 'read', 'processed') DEFAULT 'new'
        )
    `);

    connection.release();
}

// Заполнение базы данных тестовыми данными
async function seedDatabase() {
    const connection = await pool.getConnection();

    // Проверяем, есть ли уже данные
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM products');
    if (rows[0].count > 0) {
        connection.release();
        return;
    }

    // Вставляем товары
    const products = [
        { title: "НЕОН-КОРП", description: "Футуристический корпоративный сайт с голографическими элементами и ИИ-ассистентом для бизнеса 2077 года.", price: 125000, category: "corporate", rating: 4.9, sales: 42, features: "Голографический дизайн, ИИ-чаты, VR-туры, Блокчейн-интеграция" },
        { title: "КИБЕР-ПОРТФОЛИО", description: "Портфолио для кибер-дизайнеров с анимацией неоновых частиц и 3D-галереей работ.", price: 45000, category: "portfolio", rating: 4.7, sales: 38, features: "3D-галерея, Партикул-эффекты, Адаптивный ИИ, Голосовое управление" },
        { title: "ТЕХНО-МАРКЕТ", description: "Онлайн-магазин высокотехнологичных гаджетов с виртуальной примерочной и криптоплатежами.", price: 87000, category: "ecommerce", rating: 4.8, sales: 56, features: "Виртуальная примерка, Криптоплатежи, AR-просмотр, ИИ-рекомендации" },
        { title: "ДАТА-БЛОГ", description: "Блог о кибер-безопасности с интерактивными инфографиками и нейросетевым переводчиком.", price: 28000, category: "blog", rating: 4.6, sales: 29, features: "Интерактивная инфографика, Нейро-перевод, Голосовые посты, VR-контент" },
        { title: "НЕЙРО-КОРП", description: "Корпоративный сайт с нейроинтерфейсом и системой управления мыслями для топ-менеджмента.", price: 185000, category: "corporate", rating: 5.0, sales: 18, features: "Нейроинтерфейс, Мысле-управление, Голографические встречи, Квантовая безопасность" },
        { title: "ГОЛО-ПОРТФОЛИО", description: "Портфолио с голографической проекцией работ и системой распознавания жестов для навигации.", price: 62000, category: "portfolio", rating: 4.9, sales: 31, features: "Голографическая проекция, Распознавание жестов, Нейро-отзывы, 3D-аватары" },
        { title: "КВАНТ-МАРКЕТ", description: "Квантовый маркетплейс с мгновенной доставкой через телепортацию и квантовыми платежами.", price: 150000, category: "ecommerce", rating: 4.9, sales: 14, features: "Квантовая доставка, Телепортация товаров, Квантовые платежи, ИИ-логистика" },
        { title: "СИНТЕТИК-БЛОГ", description: "Блог о синтетической биологии с интерактивными 3D-моделями организмов и виртуальными экспериментами.", price: 35000, category: "blog", rating: 4.7, sales: 23, features: "3D-модели организмов, Виртуальные эксперименты, Генетический конструктор, Нейро-обучение" },
        { title: "АЙОН-КОРП", description: "Корпоративный сайт с системой искусственного интеллекта, управляющей всеми бизнес-процессами.", price: 210000, category: "corporate", rating: 5.0, sales: 12, features: "Супер-ИИ управление, Автоматизированный маркетинг, Предсказательная аналитика, Квантовый хостинг" },
        { title: "НЕОН-АРТ", description: "Портфолио цифрового художника с генеративным искусством на основе нейросетей и AR-галереей.", price: 55000, category: "portfolio", rating: 4.8, sales: 45, features: "Генеративное искусство, AR-галерея, Нейро-стили, NFT-интеграция" },
        { title: "ТЕСЛА-ШОП", description: "Интернет-магазин электротранспорта будущего с виртуальными тест-драйвами и ИИ-консультантом.", price: 95000, category: "ecommerce", rating: 4.9, sales: 27, features: "Виртуальные тест-драйвы, ИИ-консультант, AR-просмотр, Автопилот-интеграция" },
        { title: "КИБЕР-НОВОСТИ", description: "Новостной портал о кибер-технологиях с нейросетевым переводом и голографическими репортажами.", price: 42000, category: "blog", rating: 4.6, sales: 34, features: "Голографические репортажи, Нейро-перевод, ИИ-аналитика, VR-конференции" },
        { title: "ОМЕГА-КОРП", description: "Корпоративный мега-портал с системой управления галактическими филиалами и межзвездной логистикой.", price: 275000, category: "corporate", rating: 5.0, sales: 8, features: "Галактическая логистика, Межзвездные транзакции, ИИ-директор, Квантовая связь" },
        { title: "ПИКСЕЛЬ-АРТ", description: "Портфолио пиксель-арта с ретро-футуристическим дизайном и интерактивными 8-битными анимациями.", price: 38000, category: "portfolio", rating: 4.5, sales: 51, features: "8-битные анимации, Ретро-футуризм, Интерактивные спрайты, Чиптюн-саундтрек" },
        { title: "НАНО-ШОП", description: "Магазин нано-технологий с молекулярным конструктором товаров и нано-доставкой.", price: 110000, category: "ecommerce", rating: 4.8, sales: 19, features: "Молекулярный конструктор, Нано-доставка, Атомная сборка, Квантовые скидки" },
        { title: "ФУТУРО-БЛОГ", description: "Блог о будущих технологиях с временными прогнозами и симуляцией альтернативных реальностей.", price: 32000, category: "blog", rating: 4.7, sales: 28, features: "Временные прогнозы, Альтернативные реальности, Квантовые предсказания, ИИ-футуролог" },
        { title: "АЛЬФА-КОРП", description: "Элитный корпоративный сайт с биометрической аутентификацией и системой управления ресурсами планеты.", price: 310000, category: "corporate", rating: 5.0, sales: 5, features: "Биометрическая аутентификация, Планетарное управление, ИИ-советники, Квантовый блокчейн" },
        { title: "ВЕКТОР-АРТ", description: "Портфолио векторной графики с динамическими морфинг-анимациями и генеративным дизайном.", price: 48000, category: "portfolio", rating: 4.7, sales: 36, features: "Морфинг-анимации, Генеративный дизайн, Векторные фильтры, ИИ-коллаборации" },
        { title: "РОБО-ШОП", description: "Магазин роботов и дронов с системой кастомизации и виртуальным полигоном для тестирования.", price: 135000, category: "ecommerce", rating: 4.9, sales: 15, features: "Кастомизация роботов, Виртуальный полигон, ИИ-пилотирование, Нейро-интерфейс" },
        { title: "ТЕХНО-БЛОГ", description: "Технический блог с интерактивными схемами устройств и симулятором электронных цепей.", price: 29000, category: "blog", rating: 4.6, sales: 40, features: "Интерактивные схемы, Симулятор цепей, 3D-разборки, ИИ-туториалы" },
        { title: "ГАЛАКТИК-КОРП", description: "Межгалактический корпоративный портал с системой управления звездными системами и квантовой бухгалтерией.", price: 380000, category: "corporate", rating: 5.0, sales: 3, features: "Управление звездными системами, Квантовая бухгалтерия, ИИ-галактика, Телепортационные встречи" },
        { title: "СВЕТ-АРТ", description: "Портфолио светового дизайна с интерактивными голографическими инсталляциями и лазерными шоу.", price: 52000, category: "portfolio", rating: 4.8, sales: 22, features: "Голографические инсталляции, Лазерные шоу, Световая музыка, Нейро-синхронизация" },
        { title: "КОСМО-ШОП", description: "Космический маркетплейс с доставкой на орбиту и виртуальными экскурсиями по космическим станциям.", price: 185000, category: "ecommerce", rating: 4.9, sales: 7, features: "Орбитальная доставка, Виртуальные экскурсии, Нулевая гравитация, Квантовые контракты" },
        { title: "КИБЕР-БЛОГ", description: "Блог о кибер-имплантах с интерактивным конструктором модификаций и симулятором киборгов.", price: 45000, category: "blog", rating: 4.7, sales: 18, features: "Конструктор модификаций, Симулятор киборгов, Нейро-совместимость, ИИ-хирург" },
        { title: "ТИТАН-КОРП", description: "Корпоративный титан индустрии с системой управления планетарными ресурсами и ИИ-советом директоров.", price: 420000, category: "corporate", rating: 5.0, sales: 2, features: "Планетарные ресурсы, ИИ-совет директоров, Квантовый менеджмент, Межзвездная логистика" },
        { title: "ЗВУК-АРТ", description: "Портфолио звукового дизайна с интерактивными аудио-инсталляциями и нейро-синтезатором музыки.", price: 42000, category: "portfolio", rating: 4.6, sales: 33, features: "Аудио-инсталляции, Нейро-синтезатор, 3D-звук, ИИ-композитор" },
        { title: "НАНО-ШОП", description: "Нано-маркет с молекулярной сборкой товаров на дому и системой самообновления продуктов.", price: 125000, category: "ecommerce", rating: 4.8, sales: 11, features: "Молекулярная сборка, Самообновление, Нано-доставка, Квантовые гарантии" },
        { title: "БУДУЩЕЕ-БЛОГ", description: "Блог о будущем человечества с симулятором эволюции и квантовыми прогнозами развития цивилизации.", price: 55000, category: "blog", rating: 4.7, sales: 14, features: "Симулятор эволюции, Квантовые прогнозы, ИИ-футуролог, Виртуальные цивилизации" },
        { title: "КОСМОС-КОРП", description: "Космическая корпорация с управлением орбитальными станциями и межпланетной торговлей.", price: 510000, category: "corporate", rating: 5.0, sales: 1, features: "Орбитальные станции, Межпланетная торговля, ИИ-космонавты, Квантовая навигация" },
        { title: "ЦИФРА-АРТ", description: "Портфолио цифрового искусства с генеративными NFT-коллекциями и виртуальными выставками в метaverse.", price: 68000, category: "portfolio", rating: 4.9, sales: 9, features: "Генеративные NFT, Виртуальные выставки, Метaverse-интеграция, ИИ-куратор" }
    ];

    for (const product of products) {
        await connection.query(
            'INSERT INTO products (title, description, price, category, rating, sales, features) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [product.title, product.description, product.price, product.category, product.rating, product.sales, product.features]
        );
    }

    connection.release();
}

// Создание таблиц при старте сервера
createTables().then(() => {
    console.log('Таблицы созданы');
    seedDatabase().then(() => {
        console.log('База данных заполнена тестовыми данными');
    });
});

// API эндпоинты

// Получение списка товаров
app.get('/api/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение товара по ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Регистрация пользователя
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Хэширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание пользователя
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: 'Пользователь создан' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Авторизация пользователя
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Поиск пользователя
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        const user = rows[0];

        // Проверка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }

        // Генерация JWT токена
        const token = jwt.sign(
            { userId: user.id, isAdmin: user.is_admin },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, user: { id: user.id, username: user.username, email: user.email, isAdmin: user.is_admin } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Получение текущего пользователя
app.get('/api/auth/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Токен не предоставлен' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const [rows] = await pool.query('SELECT id, username, email, is_admin FROM users WHERE id = ?', [decoded.userId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера' });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
```

### 2.4. Создайте файл `.env`
```env
DB_HOST=ваш_хост_базы_данных
DB_USER=ваше_имя_пользователя
DB_PASSWORD=ваш_пароль
DB_NAME=имя_базы_данных
JWT_SECRET=ваш_секретный_ключ_dla_JWT
PORT=5000
```

### 2.5. Обновите клиентский код для работы с API

В файле `script.js` замените локальное хранение на вызовы API:

```javascript
// Пример: Загрузка товаров с сервера
async function loadProducts() {
    try {
        const response = await fetch('https://ваш-сайт.com/api/products');
        const data = await response.json();
        displayProducts(data);
    } catch (err) {
        console.error('Ошибка загрузки товаров:', err);
    }
}

// Пример: Добавление товара в корзину
async function addToCart(productId) {
    try {
        const response = await fetch('https://ваш-сайт.com/api/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ productId })
        });

        if (response.ok) {
            alert('Товар добавлен в корзину');
        }
    } catch (err) {
        console.error('Ошибка добавления в корзину:', err);
    }
}
```

## 3. Развертывание на хостинге

### 3.1. Heroku

1. Установите Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Создайте новый проект:
```bash
heroku create ваше-приложение
```
3. Добавьте PostgreSQL:
```bash
heroku addons:create heroku-postgresql:hobby-dev
```
4. Запустите миграции:
```bash
heroku run node server.js
```
5. Разверните:
```bash
git push heroku main
```

### 3.2. Render

1. Зарегистрируйтесь на https://render.com
2. Создайте новый веб-сервис
3. Выберите Node.js
4. Укажите порт 5000
5. Подключите базу данных PostgreSQL

### 3.3. Railway

1. Зарегистрируйтесь на https://railway.app
2. Создайте новый проект
3. Добавьте сервис Node.js и базу данных PostgreSQL

## 4. Настройка домена (опционально)

1. Купите домен на https://reg.ru или https://nic.ru
2. Настройте DNS записи:
   - A запись: ваш-домен.com → IP-адрес вашего хостинга
   - CNAME запись: www.ваш-домен.com → ваше-приложение.herokuapp.com
3. Настройте SSL сертификат (Let's Encrypt)

## 5. Бесплатные альтернативы для базы данных

- **PlanetScale** (MySQL-совместимый): https://planetscale.com
- **Neon** (PostgreSQL): https://neon.tech
- **Supabase** (PostgreSQL): https://supabase.com
- **ElephantSQL** (PostgreSQL): https://www.elephantsql.com

## 6. Мониторинг и логи

- **Logging**: Используйте `winston` или `morgan` для логирования
- **Monitoring**: Установите `pm2` для мониторинга сервера
- **Analytics**: Интегрируйте Google Analytics или Yandex Metrika

## 7. Безопасность

1. **HTTPS**: Всегда используйте HTTPS (Heroku предоставляет бесплатный SSL)
2. **CORS**: Настройте CORS для вашего домена
3. **Rate Limiting**: Установите `express-rate-limit` для защиты от DDoS
4. **Helmet**: Установите `helmet` для защиты от XSS и других атак

## 8. CI/CD

Настройте автоматические развертывания с GitHub Actions:

```yaml
name: Deploy to Heroku

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: "ваше-приложение"
          heroku_email: "ваша-почта@example.com"
```

## 9. Бэкап базы данных

Регулярно создавайте бэкапы вашей базы данных:

```bash
# Для PostgreSQL
pg_dump -h ваш-хост -U ваш-пользователь -d ваша-база -f backup.sql

# Для MySQL
mysqldump -h ваш-хост -u ваш-пользователь -p ваша-база > backup.sql
```

Храните бэкапы в безопасном месте (Google Drive, AWS S3, Dropbox).

## 10. Масштабирование

Когда трафик увеличится, рассмотрите возможность:
- **Load Balancing**: Настройте балансировку нагрузки
- **Database Replicas**: Создайте реплики базы данных
- **CDN**: Используйте Cloudflare или AWS CloudFront для статических файлов
- **Caching**: Установите Redis для кэширования

Эта документация предоставляет полное руководство по настройке серверной части вашего сайта для постоянного хостинга с базой данных.