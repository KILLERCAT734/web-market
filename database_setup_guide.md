# Руководство по созданию базы данных в pgAdmin 4

## 1. Установка и настройка pgAdmin 4

### 1.1. Установка PostgreSQL с pgAdmin 4

```bash
# Скачать и установить PostgreSQL с pgAdmin 4
# Скачайте установщик с официального сайта: https://www.postgresql.org/download/

# Или установите через пакетный менеджер (Windows)
choco install postgresql15 pgadmin4 -y

# Linux (Debian/Ubuntu)
sudo apt-get install postgresql postgresql-contrib pgadmin4

# MacOS (с помощью Homebrew)
brew install postgresql
brew install --cask pgadmin4
```

### 1.2. Запуск pgAdmin 4

1. Откройте pgAdmin 4 (через меню Пуск или из браузера по адресу `http://localhost:5050`)
2. Авторизуйтесь (по умолчанию: email - `user@domain.com`, пароль - `Свой пароль при установке`)

## 2. Создание базы данных

### 2.1. Подключение к серверу

1. В левой панели выберите **Servers**
2. Дважды кликните на **PostgreSQL 15** (или вашу версию)
3. Введите пароль (по умолчанию: `postgres` или ваш пароль)

### 2.2. Создание новой базы данных

1. Правой кнопкой на **Databases** → **Create** → **Database...**
2. Заполните форму:
   - **Name**: `cybersites_db` (или любое имя по вашему выбору)
   - **Owner**: `postgres` (или ваш пользователь)
   - **Encoding**: `UTF8`
   - **Collation**: `en_US.utf8` (или ваша локаль)
   - **Character Type**: `en_US.utf8`
   - **Template**: `template0`
   - **Tablespace**: `pg_default`
3. Нажмите **Save**

## 3. Создание таблиц

### 3.1. Метод 1: Использование SQL-запроса

1. Раскройте вашу базу данных (`cybersites_db`)
2. Правой кнопкой на **Queries** → **New Query**
3. Вставьте следующий SQL-код:

```sql
-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Таблица товаров
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    rating DECIMAL(3, 1) DEFAULT 0.0,
    sales INTEGER DEFAULT 0,
    features TEXT,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Таблица товаров в заказах
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Таблица отзывов
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    product_id INTEGER NOT NULL,
    rating DECIMAL(3, 1) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Таблица контактных форм
CREATE TABLE IF NOT EXISTS contact_forms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'processed'))
);

-- Триггер для обновления updated_at в products
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_products_updated_at();

-- Триггер для обновления updated_at в orders
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_orders_updated_at();
```

4. Нажмите **Execute/Run** (зеленая кнопка с треугольником)
5. Проверьте, что все таблицы созданы (в левой панели под вашей базой данных)

### 3.2. Метод 2: Использование графического интерфейса

1. Раскройте вашу базу данных
2. Правой кнопкой на **Schemas** → **Create** → **Table...**
3. Создайте таблицы по очереди, вводя поля вручную

## 4. Заполнение тестовыми данными

### 4.1. Вставка тестовых данных

1. Создайте новый запрос (правой кнопкой на **Queries** → **New Query**)
2. Вставьте SQL для вставки тестовых данных:

```sql
-- Вставка тестовых пользователей
INSERT INTO users (username, email, password_hash, is_admin) VALUES
('admin', 'admin@cybersites.2077', '$2a$10$examplehashedpassword', TRUE),
('user1', 'user1@cybersites.2077', '$2a$10$examplehashedpassword', FALSE),
('user2', 'user2@cybersites.2077', '$2a$10$examplehashedpassword', FALSE);

-- Вставка тестовых товаров
INSERT INTO products (title, description, price, category, rating, sales, features) VALUES
('НЕОН-КОРП', 'Футуристический корпоративный сайт с голографическими элементами и ИИ-ассистентом для бизнеса 2077 года.', 125000, 'corporate', 4.9, 42, 'Голографический дизайн, ИИ-чаты, VR-туры, Блокчейн-интеграция'),
('КИБЕР-ПОРТФОЛИО', 'Портфолио для кибер-дизайнеров с анимацией неоновых частиц и 3D-галереей работ.', 45000, 'portfolio', 4.7, 38, '3D-галерея, Партикул-эффекты, Адаптивный ИИ, Голосовое управление'),
('ТЕХНО-МАРКЕТ', 'Онлайн-магазин высокотехнологичных гаджетов с виртуальной примерочной и криптоплатежами.', 87000, 'ecommerce', 4.8, 56, 'Виртуальная примерка, Криптоплатежи, AR-просмотр, ИИ-рекомендации'),
('ДАТА-БЛОГ', 'Блог о кибер-безопасности с интерактивными инфографиками и нейросетевым переводчиком.', 28000, 'blog', 4.6, 29, 'Интерактивная инфографика, Нейро-перевод, Голосовые посты, VR-контент'),
('НЕЙРО-КОРП', 'Корпоративный сайт с нейроинтерфейсом и системой управления мыслями для топ-менеджмента.', 185000, 'corporate', 5.0, 18, 'Нейроинтерфейс, Мысле-управление, Голографические встречи, Квантовая безопасность');

-- Вставка тестовых отзывов
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
(2, 1, 5, 'Отличный сайт! Нейросеть сама настроила все параметры, а клиенты говорят, что дизайн как будто из 2077 года!'),
(3, 2, 4.5, 'Закзала портфолио для своих дизайнерских работ. Очень понравилось, что можно управлять сайтом силой мысли через нейроинтерфейс! Клиенты в восторге!'),
(1, 3, 5, 'Окрыл интернет-магазин с квантовой доставкой! Товары приходят к клиентам мгновенно через телепортацию. Продажи выросли в 1000 раз!');

-- Вставка тестового заказа
INSERT INTO orders (user_id, total_amount, status) VALUES
(2, 125000, 'processing') RETURNING id;

-- Вставка товаров в заказ (используйте ID заказа из предыдущего запроса)
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 125000);
```

3. Нажмите **Execute/Run**

## 5. Настройка подключения для приложения

### 5.1. Получение параметров подключения

1. В pgAdmin 4 выберите вашу базу данных
2. Правой кнопкой → **Properties**
3. Запишите следующие параметры:
   - **Host**: `localhost` (или IP-адрес вашего сервера)
   - **Port**: `5432` (стандартный порт PostgreSQL)
   - **Database**: `cybersites_db`
   - **User**: `postgres` (или ваш пользователь)
   - **Password**: ваш пароль

### 5.2. Создание файла .env

Создайте файл `.env` в корне вашего проекта с следующим содержимым:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=ваш_пароль
DB_NAME=cybersites_db
DB_PORT=5432
JWT_SECRET=ваш_секретный_ключ_dla_JWT
PORT=5000
```

## 6. Проверка подключения

### 6.1. Тестирование подключения из Node.js

Создайте тестовый файл `test_db_connection.js`:

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

pool.query('SELECT NOW() AS current_time', (err, res) => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
  } else {
    console.log('Успешное подключение к базе данных!');
    console.log('Текущее время:', res.rows[0].current_time);
  }
  pool.end();
});
```

Запустите тест:

```bash
node test_db_connection.js
```

## 7. Дополнительные настройки

### 7.1. Настройка пользователей

```sql
-- Создание пользователя для приложения
CREATE USER app_user WITH PASSWORD 'secure_password';

-- Назначение прав
GRANT ALL PRIVILEGES ON DATABASE cybersites_db TO app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO app_user;
```

### 7.2. Настройка бэкапов

```bash
# Создание бэкапа базы данных
pg_dump -h localhost -p 5432 -U postgres -d cybersites_db -f backup.sql

# Восстановление из бэкапа
psql -h localhost -p 5432 -U postgres -d cybersites_db -f backup.sql
```

## 8. Решение проблем

### 8.1. Ошибка подключения

**Проблема**: Не удается подключиться к базе данных

**Решение**:
1. Проверьте, что PostgreSQL запущен
2. Проверьте правильность параметров подключения
3. Убедитесь, что пользователь имеет права на подключение
4. Проверьте брандмауэр (если подключаетесь удаленно)

### 8.2. Ошибка с таблицами

**Проблема**: Таблицы не создаются

**Решение**:
1. Проверьте синтаксис SQL-запроса
2. Убедитесь, что у вас есть права на создание таблиц
3. Проверьте, что база данных выбрана правильно

### 8.3. Ошибка с триггерами

**Проблема**: Триггеры не работают

**Решение**:
1. Проверьте, что функции созданы перед триггерами
2. Убедитесь, что у вас есть права на создание триггеров
3. Проверьте логи PostgreSQL для ошибок

## 9. Заключение

Вы успешно создали базу данных для сайта "КиберСайты" в pgAdmin 4. Теперь вы можете подключить ваше Node.js приложение к этой базе данных, используя параметры из файла `.env`.

**Далее:**
1. Установите зависимости: `npm install pg`
2. Настройте подключение в вашем приложении
3. Запустите сервер: `node server.js`

Если у вас возникнут вопросы или проблемы, обратитесь к документации PostgreSQL или pgAdmin 4.