-- ======================================================
-- СОЗДАНИЕ БАЗЫ ДАННЫХ ДЛЯ САЙТА "КИБЕРСАЙТЫ"
-- ======================================================

-- ======================================================
-- 1. ФУНКЦИЯ ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ updated_at
-- ======================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ======================================================
-- 2. СОЗДАНИЕ ТАБЛИЦ
-- ======================================================

-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_admin BOOLEAN DEFAULT FALSE
);

-- Таблица товаров (сайтов)
CREATE TABLE products (
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
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    customer_name VARCHAR(100),
    customer_contact_method VARCHAR(20),
    customer_contact VARCHAR(100),
    requirements TEXT,
    payment_method VARCHAR(20),
    prepayment_amount DECIMAL(10, 2),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Таблица товаров в заказах
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Таблица отзывов
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    product_id INTEGER NOT NULL,
    rating DECIMAL(3, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Таблица контактных форм
CREATE TABLE contact_forms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'read', 'processed'))
);

-- Таблица настроек сайта
CREATE TABLE site_settings (
    id SERIAL PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================================================
-- 3. ТРИГГЕРЫ ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ updated_at
-- ======================================================

CREATE TRIGGER trigger_update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ======================================================
-- 4. ИНДЕКСЫ ДЛЯ ОПТИМИЗАЦИИ
-- ======================================================
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE UNIQUE INDEX idx_site_settings_key ON site_settings(setting_key);

-- ======================================================
-- 5. ЗАПОЛНЕНИЕ ДАННЫМИ
-- ======================================================

-- 5.1 Пользователи (пароль для всех: 123456, кроме админа)
-- Админ: admin@cybersites.2077 / admin123
-- Хеш для admin123: $2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqbKgSVqChGJG8M8Aq/vI0hxzMqKe
INSERT INTO users (username, email, password_hash, is_admin) VALUES
('admin', 'admin@cybersites.2077', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqbKgSVqChGJG8M8Aq/vI0hxzMqKe', TRUE),
('user1', 'user1@cybersites.2077', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqbKgSVqChGJG8M8Aq/vI0hxzMqKe', FALSE),
('alexei', 'alexei@cybermail.neo', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqbKgSVqChGJG8M8Aq/vI0hxzMqKe', FALSE),
('marina', 'marina@cybermail.neo', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqbKgSVqChGJG8M8Aq/vI0hxzMqKe', FALSE),
('dmitry', 'dmitry@cybermail.neo', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqbKgSVqChGJG8M8Aq/vI0hxzMqKe', FALSE),
('elena', 'elena@cybermail.neo', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqbKgSVqChGJG8M8Aq/vI0hxzMqKe', FALSE);

-- 5.2 Товары
INSERT INTO products (title, description, price, category, rating, sales, features) VALUES
('НЕОН-КОРП', 'Футуристический корпоративный сайт с голографическими элементами и ИИ-ассистентом для бизнеса 2077 года.', 125000, 'corporate', 4.9, 42, '["Голографический дизайн","ИИ-чаты","VR-туры","Блокчейн-интеграция"]'),
('КИБЕР-ПОРТФОЛИО', 'Портфолио для кибер-дизайнеров с анимацией неоновых частиц и 3D-галереей работ.', 45000, 'portfolio', 4.7, 38, '["3D-галерея","Партикул-эффекты","Адаптивный ИИ","Голосовое управление"]'),
('ТЕХНО-МАРКЕТ', 'Онлайн-магазин высокотехнологичных гаджетов с виртуальной примерочной и криптоплатежами.', 87000, 'ecommerce', 4.8, 56, '["Виртуальная примерка","Криптоплатежи","AR-просмотр","ИИ-рекомендации"]'),
('ДАТА-БЛОГ', 'Блог о кибер-безопасности с интерактивными инфографиками и нейросетевым переводчиком.', 28000, 'blog', 4.6, 29, '["Интерактивная инфографика","Нейро-перевод","Голосовые посты","VR-контент"]'),
('НЕЙРО-КОРП', 'Корпоративный сайт с нейроинтерфейсом и системой управления мыслями для топ-менеджмента.', 185000, 'corporate', 5.0, 18, '["Нейроинтерфейс","Мысле-управление","Голографические встречи","Квантовая безопасность"]'),
('ГОЛО-ПОРТФОЛИО', 'Портфолио с голографической проекцией работ и системой распознавания жестов.', 62000, 'portfolio', 4.9, 31, '["Голографическая проекция","Распознавание жестов","Нейро-отзывы","3D-аватары"]'),
('КВАНТ-МАРКЕТ', 'Квантовый маркетплейс с мгновенной доставкой через телепортацию.', 150000, 'ecommerce', 4.9, 14, '["Квантовая доставка","Телепортация товаров","Квантовые платежи","ИИ-логистика"]'),
('СИНТЕТИК-БЛОГ', 'Блог о синтетической биологии с интерактивными 3D-моделями.', 35000, 'blog', 4.7, 23, '["3D-модели организмов","Виртуальные эксперименты","Генетический конструктор","Нейро-обучение"]'),
('НЕОН-АРТ', 'Портфолио цифрового художника с генеративным искусством на основе нейросетей.', 55000, 'portfolio', 4.8, 45, '["Генеративное искусство","AR-галерея","Нейро-стили","NFT-интеграция"]'),
('КИБЕР-НОВОСТИ', 'Новостной портал о кибер-технологиях с голографическими репортажами.', 42000, 'blog', 4.6, 34, '["Голографические репортажи","Нейро-перевод","ИИ-аналитика","VR-конференции"]');

-- 5.3 Отзывы
INSERT INTO reviews (user_id, product_id, rating, comment) VALUES
(3, 1, 5, 'Отличный сайт! Клиенты говорят, что дизайн как будто из 2077 года!'),
(4, 2, 5, 'Заказала портфолио. Очень понравилось! Клиенты в восторге!'),
(5, 3, 5, 'Открыл интернет-магазин. Продажи выросли в 1000 раз!'),
(6, 4, 5, 'Блог о кибер-технологиях - это то, что мне было нужно!'),
(3, 5, 5, 'Нейроинтерфейс работает отлично! Рекомендую!');

-- 5.4 Заказы
INSERT INTO orders (user_id, total_amount, status, customer_name, customer_contact_method, customer_contact) VALUES
(3, 125000, 'processing', 'Алексей Иванов', 'telegram', '@alexei'),
(4, 45000, 'delivered', 'Марина Смирнова', 'whatsapp', '+79161234567'),
(5, 87000, 'shipped', 'Дмитрий Петров', 'vk', 'vk.com/dmitry'),
(6, 28000, 'pending', 'Елена Кузнецова', 'email', 'elena@mail.com');

-- 5.5 Товары в заказах
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
(1, 1, 1, 125000),
(2, 2, 1, 45000),
(3, 3, 1, 87000),
(4, 4, 1, 28000);

-- 5.6 Настройки сайта
INSERT INTO site_settings (setting_key, setting_value) VALUES
('hero_title', 'ДОБРО ПОЖАЛОВАТЬ В БУДУЩЕЕ'),
('hero_subtitle', 'МЫ СОЗДАЕМ САЙТЫ, КОТОРЫЕ ВЫВОДЯТ ВАШ БИЗНЕС В 2077 ГОД'),
('about_text', 'КОМПАНИЯ "КИБЕРСАЙТЫ" ОСНОВАНА В 2075 ГОДУ И ЗАНИМАЕТСЯ СОЗДАНИЕМ ИННОВАЦИОННЫХ ВЕБ-РЕШЕНИЙ ДЛЯ БИЗНЕСА БУДУЩЕГО. НАШИ ТЕХНОЛОГИИ ОСНОВАНЫ НА ИСКУССТВЕННОМ ИНТЕЛЛЕКТЕ, КВАНТОВЫХ ВЫЧИСЛЕНИЯХ И НЕЙРОИНТЕРФЕЙСАХ.'),
('stats_products', '30'),
('stats_clients', '120'),
('stats_satisfaction', '99'),
('contact_address', 'НЕБОСКРЕБ "КИБЕР-ТАУЭР", УЛ. БУДУЩЕГО, 2077, НЕО-ТОКИО'),
('contact_phone', '+7 (2077) 123-45-67'),
('contact_email', 'INFO@CYBERSITES.2077'),
('contact_website', 'WWW.CYBERSITES.2077'),
('social_telegram', 'https://t.me/cybersites'),
('social_vk', 'https://vk.com/cybersites'),
('social_whatsapp', 'https://wa.me/71234567890'),
('social_odnoklassniki', 'https://ok.ru/cybersites'),
('social_pinterest', 'https://pinterest.com/cybersites')
ON CONFLICT (setting_key) DO NOTHING;

-- ======================================================
-- 6. ПРОВЕРКА
-- ======================================================
SELECT '✅ БАЗА ДАННЫХ УСПЕШНО СОЗДАНА!' as status;
SELECT 'users' AS table_name, COUNT(*) AS count FROM users
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'reviews', COUNT(*) FROM reviews
UNION ALL SELECT 'orders', COUNT(*) FROM orders
UNION ALL SELECT 'order_items', COUNT(*) FROM order_items
UNION ALL SELECT 'contact_forms', COUNT(*) FROM contact_forms
UNION ALL SELECT 'site_settings', COUNT(*) FROM site_settings;