 document.addEventListener('DOMContentLoaded', function() {
    // Массив с 30 товарами (сайтами для продажи)
    const products = [
        {
            id: 1,
            title: "НЕОН-КОРП",
            category: "corporate",
            description: "Футуристический корпоративный сайт с голографическими элементами и ИИ-ассистентом для бизнеса 2077 года.",
            price: 125000,
            features: ["Голографический дизайн", "ИИ-чаты", "VR-туры", "Блокчейн-интеграция"],
            rating: 4.9,
            sales: 42
        },
        {
            id: 2,
            title: "КИБЕР-ПОРТФОЛИО",
            category: "portfolio",
            description: "Портфолио для кибер-дизайнеров с анимацией неоновых частиц и 3D-галереей работ.",
            price: 45000,
            features: ["3D-галерея", "Партикул-эффекты", "Адаптивный ИИ", "Голосовое управление"],
            rating: 4.7,
            sales: 38
        },
        {
            id: 3,
            title: "ТЕХНО-МАРКЕТ",
            category: "ecommerce",
            description: "Онлайн-магазин высокотехнологичных гаджетов с виртуальной примерочной и криптоплатежами.",
            price: 87000,
            features: ["Виртуальная примерка", "Криптоплатежи", "AR-просмотр", "ИИ-рекомендации"],
            rating: 4.8,
            sales: 56
        },
        {
            id: 4,
            title: "ДАТА-БЛОГ",
            category: "blog",
            description: "Блог о кибер-безопасности с интерактивными инфографиками и нейросетевым переводчиком.",
            price: 28000,
            features: ["Интерактивная инфографика", "Нейро-перевод", "Голосовые посты", "VR-контент"],
            rating: 4.6,
            sales: 29
        },
        {
            id: 5,
            title: "НЕЙРО-КОРП",
            category: "corporate",
            description: "Корпоративный сайт с нейроинтерфейсом и системой управления мыслями для топ-менеджмента.",
            price: 185000,
            features: ["Нейроинтерфейс", "Мысле-управление", "Голографические встречи", "Квантовая безопасность"],
            rating: 5.0,
            sales: 18
        },
        {
            id: 6,
            title: "ГОЛО-ПОРТФОЛИО",
            category: "portfolio",
            description: "Портфолио с голографической проекцией работ и системой распознавания жестов для навигации.",
            price: 62000,
            features: ["Голографическая проекция", "Распознавание жестов", "Нейро-отзывы", "3D-аватары"],
            rating: 4.9,
            sales: 31
        },
        {
            id: 7,
            title: "КВАНТ-МАРКЕТ",
            category: "ecommerce",
            description: "Квантовый маркетплейс с мгновенной доставкой через телепортацию и квантовыми платежами.",
            price: 150000,
            features: ["Квантовая доставка", "Телепортация товаров", "Квантовые платежи", "ИИ-логистика"],
            rating: 4.9,
            sales: 14
        },
        {
            id: 8,
            title: "СИНТЕТИК-БЛОГ",
            category: "blog",
            description: "Блог о синтетической биологии с интерактивными 3D-моделями организмов и виртуальными экспериментами.",
            price: 35000,
            features: ["3D-модели организмов", "Виртуальные эксперименты", "Генетический конструктор", "Нейро-обучение"],
            rating: 4.7,
            sales: 23
        },
        {
            id: 9,
            title: "АЙОН-КОРП",
            category: "corporate",
            description: "Корпоративный сайт с системой искусственного интеллекта, управляющей всеми бизнес-процессами.",
            price: 210000,
            features: ["Супер-ИИ управление", "Автоматизированный маркетинг", "Предсказательная аналитика", "Квантовый хостинг"],
            rating: 5.0,
            sales: 12
        },
        {
            id: 10,
            title: "НЕОН-АРТ",
            category: "portfolio",
            description: "Портфолио цифрового художника с генеративным искусством на основе нейросетей и AR-галереей.",
            price: 55000,
            features: ["Генеративное искусство", "AR-галерея", "Нейро-стили", "NFT-интеграция"],
            rating: 4.8,
            sales: 45
        },
        {
            id: 11,
            title: "ТЕСЛА-ШОП",
            category: "ecommerce",
            description: "Интернет-магазин электротранспорта будущего с виртуальными тест-драйвами и ИИ-консультантом.",
            price: 95000,
            features: ["Виртуальные тест-драйвы", "ИИ-консультант", "AR-просмотр", "Автопилот-интеграция"],
            rating: 4.9,
            sales: 27
        },
        {
            id: 12,
            title: "КИБЕР-НОВОСТИ",
            category: "blog",
            description: "Новостной портал о кибер-технологиях с нейросетевым переводом и голографическими репортажами.",
            price: 42000,
            features: ["Голографические репортажи", "Нейро-перевод", "ИИ-аналитика", "VR-конференции"],
            rating: 4.6,
            sales: 34
        },
        {
            id: 13,
            title: "ОМЕГА-КОРП",
            category: "corporate",
            description: "Корпоративный мега-портал с системой управления галактическими филиалами и межзвездной логистикой.",
            price: 275000,
            features: ["Галактическая логистика", "Межзвездные транзакции", "ИИ-директор", "Квантовая связь"],
            rating: 5.0,
            sales: 8
        },
        {
            id: 14,
            title: "ПИКСЕЛЬ-АРТ",
            category: "portfolio",
            description: "Портфолио пиксель-арта с ретро-футуристическим дизайном и интерактивными 8-битными анимациями.",
            price: 38000,
            features: ["8-битные анимации", "Ретро-футуризм", "Интерактивные спрайты", "Чиптюн-саундтрек"],
            rating: 4.5,
            sales: 51
        },
        {
            id: 15,
            title: "НАНО-ШОП",
            category: "ecommerce",
            description: "Магазин нано-технологий с молекулярным конструктором товаров и нано-доставкой.",
            price: 110000,
            features: ["Молекулярный конструктор", "Нано-доставка", "Атомная сборка", "Квантовые скидки"],
            rating: 4.8,
            sales: 19
        },
        {
            id: 16,
            title: "ФУТУРО-БЛОГ",
            category: "blog",
            description: "Блог о будущих технологиях с временными прогнозами и симуляцией альтернативных реальностей.",
            price: 32000,
            features: ["Временные прогнозы", "Альтернативные реальности", "Квантовые предсказания", "ИИ-футуролог"],
            rating: 4.7,
            sales: 28
        },
        {
            id: 17,
            title: "АЛЬФА-КОРП",
            category: "corporate",
            description: "Элитный корпоративный сайт с биометрической аутентификацией и системой управления ресурсами планеты.",
            price: 310000,
            features: ["Биометрическая аутентификация", "Планетарное управление", "ИИ-советники", "Квантовый блокчейн"],
            rating: 5.0,
            sales: 5
        },
        {
            id: 18,
            title: "ВЕКТОР-АРТ",
            category: "portfolio",
            description: "Портфолио векторной графики с динамическими морфинг-анимациями и генеративным дизайном.",
            price: 48000,
            features: ["Морфинг-анимации", "Генеративный дизайн", "Векторные фильтры", "ИИ-коллаборации"],
            rating: 4.7,
            sales: 36
        },
        {
            id: 19,
            title: "РОБО-ШОП",
            category: "ecommerce",
            description: "Магазин роботов и дронов с системой кастомизации и виртуальным полигоном для тестирования.",
            price: 135000,
            features: ["Кастомизация роботов", "Виртуальный полигон", "ИИ-пилотирование", "Нейро-интерфейс"],
            rating: 4.9,
            sales: 15
        },
        {
            id: 20,
            title: "ТЕХНО-БЛОГ",
            category: "blog",
            description: "Технический блог с интерактивными схемами устройств и симулятором электронных цепей.",
            price: 29000,
            features: ["Интерактивные схемы", "Симулятор цепей", "3D-разборки", "ИИ-туториалы"],
            rating: 4.6,
            sales: 40
        },
        {
            id: 21,
            title: "ГАЛАКТИК-КОРП",
            category: "corporate",
            description: "Межгалактический корпоративный портал с системой управления звездными системами и квантовой бухгалтерией.",
            price: 380000,
            features: ["Управление звездными системами", "Квантовая бухгалтерия", "ИИ-галактика", "Телепортационные встречи"],
            rating: 5.0,
            sales: 3
        },
        {
            id: 22,
            title: "СВЕТ-АРТ",
            category: "portfolio",
            description: "Портфолио светового дизайна с интерактивными голографическими инсталляциями и лазерными шоу.",
            price: 52000,
            features: ["Голографические инсталляции", "Лазерные шоу", "Световая музыка", "Нейро-синхронизация"],
            rating: 4.8,
            sales: 22
        },
        {
            id: 23,
            title: "КОСМО-ШОП",
            category: "ecommerce",
            description: "Космический маркетплейс с доставкой на орбиту и виртуальными экскурсиями по космическим станциям.",
            price: 185000,
            features: ["Орбитальная доставка", "Виртуальные экскурсии", "Нулевая гравитация", "Квантовые контракты"],
            rating: 4.9,
            sales: 7
        },
        {
            id: 24,
            title: "КИБЕР-БЛОГ",
            category: "blog",
            description: "Блог о кибер-имплантах с интерактивным конструктором модификаций и симулятором киборгов.",
            price: 45000,
            features: ["Конструктор модификаций", "Симулятор киборгов", "Нейро-совместимость", "ИИ-хирург"],
            rating: 4.7,
            sales: 18
        },
        {
            id: 25,
            title: "ТИТАН-КОРП",
            category: "corporate",
            description: "Корпоративный титан индустрии с системой управления планетарными ресурсами и ИИ-советом директоров.",
            price: 420000,
            features: ["Планетарные ресурсы", "ИИ-совет директоров", "Квантовый менеджмент", "Межзвездная логистика"],
            rating: 5.0,
            sales: 2
        },
        {
            id: 26,
            title: "ЗВУК-АРТ",
            category: "portfolio",
            description: "Портфолио звукового дизайна с интерактивными аудио-инсталляциями и нейро-синтезатором музыки.",
            price: 42000,
            features: ["Аудио-инсталляции", "Нейро-синтезатор", "3D-звук", "ИИ-композитор"],
            rating: 4.6,
            sales: 33
        },
        {
            id: 27,
            title: "НАНО-ШОП",
            category: "ecommerce",
            description: "Нано-маркет с молекулярной сборкой товаров на дому и системой самообновления продуктов.",
            price: 125000,
            features: ["Молекулярная сборка", "Самообновление", "Нано-доставка", "Квантовые гарантии"],
            rating: 4.8,
            sales: 11
        },
        {
            id: 28,
            title: "БУДУЩЕЕ-БЛОГ",
            category: "blog",
            description: "Блог о будущем человечества с симулятором эволюции и квантовыми прогнозами развития цивилизации.",
            price: 55000,
            features: ["Симулятор эволюции", "Квантовые прогнозы", "ИИ-футуролог", "Виртуальные цивилизации"],
            rating: 4.7,
            sales: 14
        },
        {
            id: 29,
            title: "КОСМОС-КОРП",
            category: "corporate",
            description: "Космическая корпорация с управлением орбитальными станциями и межпланетной торговлей.",
            price: 510000,
            features: ["Орбитальные станции", "Межпланетная торговля", "ИИ-космонавты", "Квантовая навигация"],
            rating: 5.0,
            sales: 1
        },
        {
            id: 30,
            title: "ЦИФРА-АРТ",
            category: "portfolio",
            description: "Портфолио цифрового искусства с генеративными NFT-коллекциями и виртуальными выставками в метaverse.",
            price: 68000,
            features: ["Генеративные NFT", "Виртуальные выставки", "Метaverse-интеграция", "ИИ-куратор"],
            rating: 4.9,
            sales: 9
        }
    ];

    // Элементы DOM
    const productsContainer = document.getElementById('products');
    const searchInput = document.getElementById('search');
    const categorySelect = document.getElementById('category');
    const sortSelect = document.getElementById('sort');
    const navLinks = document.querySelectorAll('.cyber-main-nav .nav-link');
    const pages = document.querySelectorAll('.page');
    const statNumbers = document.querySelectorAll('.stat-number');
    const floatingActionButton = document.querySelector('.floating-action-button');
    const reviewForm = document.getElementById('review-form');
    const contactForm = document.getElementById('contact-form');
    const starRating = document.querySelector('.star-rating');

    // Элементы пагинации
    const paginationInfo = document.getElementById('pagination-info');
    const paginationPages = document.getElementById('pagination-pages');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const itemsPerPageSelect = document.getElementById('items-per-page');

    // Переменные пагинации
    let currentPage = 1;
    let itemsPerPage = 6;
    let filteredProducts = [...products];

    // Корзина
    let cart = [];
    const cartCountElement = document.querySelector('.cart-count');
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.querySelector('.total-price');
    const checkoutBtn = document.querySelector('.checkout-btn');

    // Инициализация
    init();

    function init() {
        // Настройка навигации
        setupNavigation();

        // Анимация статистики
        animateStats();

        // Обработчики событий
        setupEventListeners();

        // Показать главную страницу по умолчанию
        showPage('home');

        // Инициализировать пагинацию для каталога
        filteredProducts = [...products];
        updatePagination();

        // Настройка рейтингов
        setupStarRating();

        // Настройка форм
        setupForms();

        // Настройка кнопки "Вверх"
        setupBackToTop();
    }

    function setupNavigation() {
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const pageId = this.getAttribute('data-page');

                // Убрать активный класс у всех ссылок
                navLinks.forEach(l => l.classList.remove('active'));
                // Добавить активный класс текущей ссылке
                this.classList.add('active');

                // Показать выбранную страницу
                showPage(pageId);

                // Если это каталог, прокрутить к верху
                if (pageId === 'catalog') {
                    setTimeout(() => {
                        document.getElementById('catalog-page').scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            });
        });

        // Также добавим обработчики для ссылок в футере
        const footerLinks = document.querySelectorAll('.footer-links a');
        footerLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const pageId = this.getAttribute('data-page');
                showPage(pageId);

                // Обновить активную ссылку в навигации
                navLinks.forEach(l => l.classList.remove('active'));
                const activeNavLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
                if (activeNavLink) {
                    activeNavLink.classList.add('active');
                }
            });
        });
    }

    function showPage(pageId) {
        // Сохраняем текущую позицию скролла
        const currentScrollPosition = window.scrollY;

        pages.forEach(page => {
            if (page.id === `${pageId}-page`) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });

        // Восстанавливаем позицию скролла после переключения страницы
        setTimeout(() => {
            window.scrollTo(0, currentScrollPosition);
        }, 50);
    }

    function animateStats() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000;
            const step = target / (duration / 16);

            let current = 0;
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(current).toLocaleString();
            }, 16);
        });
    }

    function setupEventListeners() {
        // Фильтрация и сортировка товаров
        if (searchInput && categorySelect && sortSelect) {
            searchInput.addEventListener('input', filterAndSortProducts);
            categorySelect.addEventListener('change', filterAndSortProducts);
            sortSelect.addEventListener('change', filterAndSortProducts);
        }

        // Кнопка быстрого заказа
        if (floatingActionButton) {
            floatingActionButton.addEventListener('click', () => {
                showPage('contact');
                navLinks.forEach(l => l.classList.remove('active'));
                document.querySelector('.nav-link[data-page="contact"]').classList.add('active');
                document.getElementById('contact-page').scrollIntoView({ behavior: 'smooth' });
            });
        }

        // Обработчики пагинации
        if (itemsPerPageSelect) {
            itemsPerPageSelect.addEventListener('change', function() {
                itemsPerPage = parseInt(this.value);
                currentPage = 1;
                updatePagination();
            });
        }

        if (prevPageBtn && nextPageBtn) {
            prevPageBtn.addEventListener('click', function() {
                if (currentPage > 1) {
                    currentPage--;
                    updatePagination();
                }
            });

            nextPageBtn.addEventListener('click', function() {
                const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
                if (currentPage < totalPages) {
                    currentPage++;
                    updatePagination();
                }
            });
        }
    }

    function filterAndSortProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categorySelect.value;
        const sortMethod = sortSelect.value;

        let filteredProducts = [...products];

        // Фильтрация по категории
        if (selectedCategory !== 'all') {
            filteredProducts = filteredProducts.filter(product => product.category === selectedCategory);
        }

        // Фильтрация по поисковому запросу
        if (searchTerm) {
            filteredProducts = filteredProducts.filter(product =>
                product.title.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm)
            );
        }

        // Сортировка
        switch(sortMethod) {
            case 'price-asc':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'name-desc':
                filteredProducts.sort((a, b) => b.title.localeCompare(a.title));
                break;
            default:
                // Сортировка по популярности (продажи)
                filteredProducts.sort((a, b) => b.sales - a.sales);
        }

        // Сохраняем отфильтрованные продукты
        filteredProducts = filteredProducts;
        currentPage = 1;

        // Обновляем пагинацию
        updatePagination();
    }

    function getPaginatedProducts() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
    }

    function updatePagination() {
        // Получаем пагинированные продукты
        const paginatedProducts = getPaginatedProducts();

        // Отображаем продукты
        displayProducts(paginatedProducts);

        // Рассчитываем общее количество страниц
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

        // Обновляем информацию о пагинации
        if (paginationInfo) {
            paginationInfo.textContent = `СТРАНИЦА ${currentPage} ИЗ ${totalPages}`;
        }

        // Обновляем кнопки пагинации
        if (prevPageBtn && nextPageBtn) {
            prevPageBtn.disabled = currentPage === 1;
            nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
        }

        // Обновляем номера страниц
        updatePaginationPages(totalPages);
    }

    function updatePaginationPages(totalPages) {
        if (!paginationPages) return;

        paginationPages.innerHTML = '';

        // Показываем не более 5 страниц
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        // Если текущая страница близко к началу
        if (currentPage <= 3) {
            endPage = Math.min(totalPages, 5);
        }

        // Если текущая страница близко к концу
        if (currentPage > totalPages - 3) {
            startPage = Math.max(1, totalPages - 4);
        }

        // Добавляем кнопки страниц
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `pagination-page ${i === currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => {
                currentPage = i;
                updatePagination();
            });
            paginationPages.appendChild(pageButton);
        }
    }

    function displayProducts(productsToDisplay) {
        if (!productsContainer) return;

        productsContainer.innerHTML = '';

        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.setAttribute('data-category', product.category);

            const categoryClass = `category-${product.category}`;
            const featuresList = product.features ? product.features.map(f => `<li>${f}</li>`).join('') : '';
            const ratingStars = getRatingStars(product.rating);

            productCard.innerHTML = `
                <div class="product-image"></div>
                <div class="product-rating">
                    ${ratingStars} <span>${product.rating.toFixed(1)}</span>
                </div>
                <h3 class="product-title">${product.title}</h3>
                <span class="product-category ${categoryClass}">${getCategoryName(product.category)}</span>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${product.price.toLocaleString()} ₽</div>
                <div class="product-sales">ПРОДАНО: ${product.sales}</div>
                <button class="cyber-btn" onclick="addToCart(${product.id})">КУПИТЬ СЕЙЧАС</button>
                ${product.features ? `<div class="product-features"><h4>ФУНКЦИИ:</h4><ul>${featuresList}</ul></div>` : ''}
            `;

            productsContainer.appendChild(productCard);
        });

        // Добавляем анимацию появления
        const cards = document.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            card.style.animation = `fadeIn 0.5s ease ${index * 0.1}s both`;
        });
    }

    function getCategoryName(category) {
        switch(category) {
            case 'corporate': return 'КОРПОРАТИВНЫЙ';
            case 'portfolio': return 'ПОРТФОЛИО';
            case 'ecommerce': return 'МАГАЗИН';
            case 'blog': return 'БЛОГ';
            default: return category;
        }
    }

    function getRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5 ? 1 : 0;
        const emptyStars = 5 - fullStars - halfStar;

        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        if (halfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star"></i>';
        }

        return stars;
    }

    function setupStarRating() {
        if (!starRating) return;

        const stars = starRating.querySelectorAll('i');
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const value = parseInt(this.getAttribute('data-value'));
                stars.forEach((s, index) => {
                    if (index < value) {
                        s.classList.add('active');
                        s.classList.remove('far');
                        s.classList.add('fas');
                    } else {
                        s.classList.remove('active');
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });

            star.addEventListener('mouseover', function() {
                const value = parseInt(this.getAttribute('data-value'));
                stars.forEach((s, index) => {
                    if (index < value) {
                        s.classList.add('fas');
                        s.classList.remove('far');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });

            star.addEventListener('mouseout', function() {
                stars.forEach(s => {
                    if (s.classList.contains('active')) {
                        s.classList.add('fas');
                        s.classList.remove('far');
                    } else {
                        s.classList.remove('fas');
                        s.classList.add('far');
                    }
                });
            });
        });
    }

    function setupForms() {
        // Обработка формы отзыва
        if (reviewForm) {
            reviewForm.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('СПАСИБО ЗА ВАШ ОТЗЫВ! ОН БУДЕТ ОПУБЛИКОВАН ПОСЛЕ МОДЕРАЦИИ.');
                this.reset();
                const stars = document.querySelectorAll('.star-rating i');
                stars.forEach(star => {
                    star.classList.remove('active', 'fas');
                    star.classList.add('far');
                });
            });
        }

        // Обработка формы контактов
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                alert('СООБЩЕНИЕ ОТПРАВЛЕНО! МЫ СВЯЖЕМСЯ С ВАМИ В ТЕЧЕНИЕ 24 ЧАСОВ ЧЕРЕЗ КВАНТОВУЮ СЕТЬ.');
                this.reset();
            });
        }
    }

    function setupBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        if (!backToTopBtn) return;

        // Показываем/скрываем кнопку при скролле
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        // Обработчик клика
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Функции для работы с корзиной
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            // Проверяем, есть ли уже товар в корзине
            const existingItem = cart.find(item => item.id === productId);

            if (existingItem) {
                // Увеличиваем количество, если товар уже в корзине
                existingItem.quantity += 1;
            } else {
                // Добавляем новый товар в корзину
                cart.push({
                    ...product,
                    quantity: 1
                });
            }

            // Обновляем отображение корзины
            updateCartDisplay();

            // Анимация добавления в корзину
            const button = event.target;
            button.style.transform = 'scale(0.95)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 150);

            // Уведомление
            setTimeout(() => {
                alert(`САЙТ "${product.title}" ДОБАВЛЕН В КОРЗИНУ! ОФОРМЛЕНИЕ ЗАКАЗА ЧЕРЕЗ КВАНТОВУЮ СЕТЬ...`);
            }, 300);
        }
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        updateCartDisplay();
    }

    function updateCartDisplay() {
        // Обновляем счетчик корзины
        if (cartCountElement) {
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalItems > 0 ? totalItems : '0';

            // Показываем/скрываем анимацию, если товаров больше 0
            if (totalItems > 0) {
                cartCountElement.style.animation = 'pulse 2s infinite';
            } else {
                cartCountElement.style.animation = 'none';
            }
        }

        // Обновляем отображение товаров в корзине
        if (cartItemsElement && cartTotalElement && checkoutBtn) {
            if (cart.length === 0) {
                cartItemsElement.innerHTML = '<p class="empty-cart-message">ВАША КОРЗИНА ПУСТА. ДОБАВЬТЕ ТОВАРЫ ИЗ КАТАЛОГА.</p>';
                cartTotalElement.textContent = '0 ₽';
                checkoutBtn.disabled = true;
            } else {
                // Отображаем товары в корзине
                let cartHTML = '';
                let total = 0;

                cart.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    total += itemTotal;

                    cartHTML += `
                        <div class="cart-item">
                            <div class="cart-item-image">
                                <i class="fas fa-globe"></i>
                            </div>
                            <div class="cart-item-info">
                                <div class="cart-item-title">${item.title}</div>
                                <div class="cart-item-price">${item.price.toLocaleString()} ₽ × ${item.quantity}</div>
                            </div>
                            <i class="fas fa-times cart-item-remove" onclick="removeFromCart(${item.id})"></i>
                        </div>
                    `;
                });

                cartItemsElement.innerHTML = cartHTML;
                cartTotalElement.textContent = total.toLocaleString() + ' ₽';
                checkoutBtn.disabled = false;
            }
        }
    }

    function checkout() {
        if (cart.length === 0) {
            alert('ВАША КОРЗИНА ПУСТА! ДОБАВЬТЕ ТОВАРЫ ПЕРЕД ОФОРМЛЕНИЕМ ЗАКАЗА.');
            return;
        }

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const itemsList = cart.map(item => `${item.title} (${item.quantity} шт.)`).join('\n');

        const confirmation = confirm(`ОФОРМЛЕНИЕ ЗАКАЗА ЧЕРЕЗ КВАНТОВУЮ СЕТЬ:\n\n${itemsList}\n\nОБЩАЯ СТОИМОСТЬ: ${total.toLocaleString()} ₽\n\nПОДТВЕРДИТЕ ЗАКАЗ?`);

        if (confirmation) {
            alert('ЗАКАЗ УСПЕШНО ОФОРМЛЕН! ОПЛАТА ПРОИЗВЕДЕНА ЧЕРЕЗ КВАНТОВУЮ СЕТЬ. ДОСТАВКА ЗАЙМЕТ МЕНЕЕ 1 СЕКУНДЫ ЧЕРЕЗ ТЕЛЕПОРТАЦИЮ.');

            // Очищаем корзину
            cart = [];
            updateCartDisplay();
        }
    }

    // Глобальные функции для кнопок
    window.addToCart = function(productId) {
        addToCart(productId);
    };

    window.removeFromCart = function(productId) {
        removeFromCart(productId);
    };

    window.checkout = function() {
        checkout();
    };

    window.scrollToCatalog = function() {
        showPage('catalog');
        navLinks.forEach(l => l.classList.remove('active'));
        document.querySelector('.nav-link[data-page="catalog"]').classList.add('active');
        setTimeout(() => {
            document.getElementById('catalog-page').scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    window.showDemo = function() {
        alert('ЗАПУСК ГОЛОГРАФИЧЕСКОЙ ДЕМОНСТРАЦИИ... ПОДКЛЮЧАЕМ НЕЙРОИНТЕРФЕЙС... ДЕМОНСТРАЦИЯ НАЧНЕТСЯ ЧЕРЕЗ 3... 2... 1...');
    };

    // Добавим стили для новых элементов
    const style = document.createElement('style');
    style.textContent = `
        .product-rating {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            color: var(--neon-yellow);
            font-size: 1rem;
        }

        .product-rating span {
            color: var(--neon-green);
            font-weight: bold;
        }

        .product-sales {
            font-size: 0.9rem;
            color: var(--neon-purple);
            margin-bottom: 1rem;
            text-transform: uppercase;
            letter-spacing: 0.1em;
        }

        .product-features {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(10, 200, 255, 0.2);
            font-size: 0.8rem;
        }

        .product-features h4 {
            color: var(--neon-green);
            margin-bottom: 0.5rem;
            font-size: 0.9rem;
        }

        .product-features ul {
            list-style: none;
            padding-left: 0;
        }

        .product-features li {
            padding: 0.3rem 0;
            position: relative;
            padding-left: 1.5rem;
        }

        .product-features li::before {
            content: "▸";
            color: var(--neon-pink);
            position: absolute;
            left: 0;
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        /* Анимация для плавающих элементов */
        @keyframes float {
            0%, 100% {
                transform: translateY(0px) rotate(0deg);
                opacity: 0.3;
            }
            50% {
                transform: translateY(-20px) rotate(10deg);
                opacity: 0.8;
            }
        }

        /* Стили для мобильного меню */
        @media (max-width: 768px) {
            .hero-section {
                flex-direction: column;
                text-align: center;
            }

            .about-content,
            .contact-content {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
});