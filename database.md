# База данных для сайта КиберСайты

## 1. Локальное хранение (LocalStorage) для текущей версии

Для текущей версии сайта (без серверной части) реализовано локальное хранение данных в браузере:

### 1.1. Хранение корзины
```javascript
// Сохранение корзины в LocalStorage
localStorage.setItem('cart', JSON.stringify(cart));

// Загрузка корзины из LocalStorage
const savedCart = localStorage.getItem('cart');
if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartDisplay();
}
```

### 1.2. Хранение настроек пользователя
```javascript
// Сохранение настроек (например, количество товаров на странице)
localStorage.setItem('itemsPerPage', itemsPerPage);

// Загрузка настроек
const savedItemsPerPage = localStorage.getItem('itemsPerPage');
if (savedItemsPerPage) {
    itemsPerPage = parseInt(savedItemsPerPage);
}
```

## 2. Структура SQL базы данных (для серверной реализации)

### 2.1. Таблица пользователей (users)
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_admin BOOLEAN DEFAULT FALSE
);
```

### 2.2. Таблица товаров (products)
```sql
CREATE TABLE products (
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
);
```

### 2.3. Таблица заказов (orders)
```sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 2.4. Таблица товаров в заказах (order_items)
```sql
CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 2.5. Таблица отзывов (reviews)
```sql
CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    product_id INT NOT NULL,
    rating DECIMAL(3, 1) NOT NULL,
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 2.6. Таблица контактных форм (contact_forms)
```sql
CREATE TABLE contact_forms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(200),
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('new', 'read', 'processed') DEFAULT 'new'
);
```

## 3. API эндпоинты (для серверной реализации)

### 3.1. Авторизация
- `POST /api/auth/login` - Авторизация пользователя
- `POST /api/auth/register` - Регистрация нового пользователя
- `GET /api/auth/me` - Получение информации о текущем пользователе

### 3.2. Товары
- `GET /api/products` - Получение списка товаров
- `GET /api/products/:id` - Получение информации о конкретном товаре
- `POST /api/products` - Создание нового товара (только для администраторов)
- `PUT /api/products/:id` - Обновление товара (только для администраторов)
- `DELETE /api/products/:id` - Удаление товара (только для администраторов)

### 3.3. Корзина
- `GET /api/cart` - Получение содержимого корзины
- `POST /api/cart` - Добавление товара в корзину
- `PUT /api/cart/:id` - Обновление количества товара в корзине
- `DELETE /api/cart/:id` - Удаление товара из корзины
- `POST /api/cart/checkout` - Оформление заказа

### 3.4. Заказы
- `GET /api/orders` - Получение списка заказов текущего пользователя
- `GET /api/orders/:id` - Получение информации о конкретном заказе
- `GET /api/admin/orders` - Получение всех заказов (только для администраторов)

### 3.5. Отзывы
- `GET /api/reviews` - Получение списка отзывов
- `POST /api/reviews` - Добавление нового отзыва
- `GET /api/reviews/product/:id` - Получение отзывов о конкретном товаре

### 3.6. Контактная форма
- `POST /api/contact` - Отправка сообщения через контактную форму

## 4. Пример реализации с использованием LocalStorage

Для текущей версии сайта можно добавить следующее в файл script.js:

```javascript
// Загрузка данных при инициализации
function loadFromLocalStorage() {
    // Загрузка корзины
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }

    // Загрузка настроек
    const savedItemsPerPage = localStorage.getItem('itemsPerPage');
    if (savedItemsPerPage) {
        itemsPerPage = parseInt(savedItemsPerPage);
        if (itemsPerPageSelect) {
            itemsPerPageSelect.value = itemsPerPage;
        }
    }
}

// Сохранение данных при изменении
function saveToLocalStorage() {
    // Сохранение корзины
    localStorage.setItem('cart', JSON.stringify(cart));

    // Сохранение настроек
    localStorage.setItem('itemsPerPage', itemsPerPage);
}

// Вызов при инициализации
loadFromLocalStorage();

// Обновление при изменении корзины
function updateCartDisplay() {
    // ... существующий код ...

    // Сохранение в LocalStorage
    saveToLocalStorage();
}

// Обновление при изменении настроек
if (itemsPerPageSelect) {
    itemsPerPageSelect.addEventListener('change', function() {
        itemsPerPage = parseInt(this.value);
        currentPage = 1;
        updatePagination();
        saveToLocalStorage();
    });
}
```

## 5. Рекомендации для серверной реализации

Для полноценной серверной реализации рекомендуется использовать:

1. **Backend**: Node.js с Express или Python с Django/Flask
2. **База данных**: MySQL, PostgreSQL или MongoDB
3. **Аутентификация**: JWT (JSON Web Tokens)
4. **Безопасность**: HTTPS, CSRF защита, валидация входных данных
5. **Администрирование**: Админ-панель для управления товарами, заказами и пользователями

Эта структура базы данных позволяет реализовать все функции интернет-магазина, включая управление товарами, заказами, пользователями и отзывами.