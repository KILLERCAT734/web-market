// ============================================
// API КОНФИГУРАЦИЯ
// ============================================
const API_URL = 'http://localhost:5000/api';
const USE_API = true;

// ============================================
// ОРИГИНАЛЬНЫЙ МАССИВ ТОВАРОВ (РЕЗЕРВ)
// ============================================
const ORIGINAL_PRODUCTS = [
    { id: 1, title: "НЕОН-КОРП", category: "corporate", description: "Футуристический корпоративный сайт с голографическими элементами и ИИ-ассистентом для бизнеса 2077 года.", price: 125000, features: ["Голографический дизайн", "ИИ-чаты", "VR-туры", "Блокчейн-интеграция"], rating: 4.9, sales: 42 },
    { id: 2, title: "КИБЕР-ПОРТФОЛИО", category: "portfolio", description: "Портфолио для кибер-дизайнеров с анимацией неоновых частиц и 3D-галереей работ.", price: 45000, features: ["3D-галерея", "Партикул-эффекты", "Адаптивный ИИ", "Голосовое управление"], rating: 4.7, sales: 38 },
    { id: 3, title: "ТЕХНО-МАРКЕТ", category: "ecommerce", description: "Онлайн-магазин высокотехнологичных гаджетов с виртуальной примерочной и криптоплатежами.", price: 87000, features: ["Виртуальная примерка", "Криптоплатежи", "AR-просмотр", "ИИ-рекомендации"], rating: 4.8, sales: 56 },
    { id: 4, title: "ДАТА-БЛОГ", category: "blog", description: "Блог о кибер-безопасности с интерактивными инфографиками и нейросетевым переводчиком.", price: 28000, features: ["Интерактивная инфографика", "Нейро-перевод", "Голосовые посты", "VR-контент"], rating: 4.6, sales: 29 },
    { id: 5, title: "НЕЙРО-КОРП", category: "corporate", description: "Корпоративный сайт с нейроинтерфейсом и системой управления мыслями для топ-менеджмента.", price: 185000, features: ["Нейроинтерфейс", "Мысле-управление", "Голографические встречи", "Квантовая безопасность"], rating: 5.0, sales: 18 }
];

// ============================================
// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================
let products = [];
let cart = JSON.parse(localStorage.getItem('cyberCart')) || [];
let authToken = localStorage.getItem('authToken');
let currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

// ============================================
// ФУНКЦИИ API
// ============================================
async function loadSiteSettings() {
    if (!USE_API) return;
    try {
        const response = await fetch(`${API_URL}/settings`);
        if (!response.ok) return;
        const settings = await response.json();
        
        if (settings.hero_title) {
            const heroTitle = document.getElementById('heroTitle');
            if (heroTitle) heroTitle.textContent = settings.hero_title;
        }
        if (settings.hero_subtitle) {
            const heroSubtitle = document.getElementById('heroSubtitle');
            if (heroSubtitle) heroSubtitle.textContent = settings.hero_subtitle;
        }
        if (settings.stats_products) {
            const statProducts = document.getElementById('statProducts');
            if (statProducts) statProducts.setAttribute('data-target', settings.stats_products);
        }
        if (settings.stats_clients) {
            const statClients = document.getElementById('statClients');
            if (statClients) statClients.setAttribute('data-target', settings.stats_clients);
        }
        if (settings.stats_satisfaction) {
            const statSatisfaction = document.getElementById('statSatisfaction');
            if (statSatisfaction) statSatisfaction.setAttribute('data-target', settings.stats_satisfaction);
        }
        if (settings.contact_address) {
            const address = document.getElementById('contactAddress');
            if (address) address.textContent = settings.contact_address;
        }
        if (settings.contact_phone) {
            const phone = document.getElementById('contactPhone');
            if (phone) phone.textContent = settings.contact_phone;
        }
        if (settings.contact_email) {
            const email = document.getElementById('contactEmail');
            if (email) email.textContent = settings.contact_email;
        }
        if (settings.contact_website) {
            const website = document.getElementById('contactWebsite');
            if (website) website.textContent = settings.contact_website;
        }
        if (settings.social_telegram) {
            document.querySelectorAll('#socialTelegram, #footerTelegram').forEach(el => { if (el) el.href = settings.social_telegram; });
        }
        if (settings.social_vk) {
            document.querySelectorAll('#socialVk, #footerVk').forEach(el => { if (el) el.href = settings.social_vk; });
        }
        if (settings.social_whatsapp) {
            document.querySelectorAll('#socialWhatsapp, #footerWhatsapp').forEach(el => { if (el) el.href = settings.social_whatsapp; });
        }
        if (settings.about_text) {
            const aboutText = document.getElementById('aboutText');
            if (aboutText) {
                const paragraphs = settings.about_text.split('\n\n');
                aboutText.innerHTML = paragraphs.map(p => `<p>${p}</p>`).join('');
            }
        }
        console.log('✅ Настройки сайта загружены');
    } catch (error) {
        console.warn('⚠️ Не удалось загрузить настройки сайта');
    }
}

async function loadProductsFromAPI() {
    if (!USE_API) return null;
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Ошибка загрузки');
        const data = await response.json();
        return data.map(p => ({
            ...p,
            price: parseFloat(p.price),
            rating: parseFloat(p.rating),
            features: p.features || [],
            image_url: p.image_url || null
        }));
    } catch (error) {
        console.warn('⚠️ Сервер недоступен, используем локальные данные');
        return null;
    }
}

async function sendContactFormToAPI(formData) {
    if (!USE_API) return false;
    try {
        const response = await fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

async function createOrderOnAPI(orderData) {
    if (!USE_API) return false;
    try {
        const headers = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers,
            body: JSON.stringify(orderData)
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

async function loadReviewsForProduct(productId) {
    if (!USE_API) return [];
    try {
        const response = await fetch(`${API_URL}/reviews/product/${productId}`);
        if (!response.ok) return [];
        return await response.json();
    } catch (error) {
        return [];
    }
}

async function submitReview(productId, rating, comment) {
    if (!USE_API || !authToken) return false;
    try {
        const response = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ product_id: productId, rating, comment })
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    const apiProducts = await loadProductsFromAPI();
    products = (apiProducts && apiProducts.length > 0) ? apiProducts : ORIGINAL_PRODUCTS;
    console.log(`✅ Загружено товаров: ${products.length}`);

    const productsContainer = document.getElementById('products');
    const searchInput = document.getElementById('search');
    const categorySelect = document.getElementById('category');
    const sortSelect = document.getElementById('sort');
    const pages = document.querySelectorAll('.page');
    const statNumbers = document.querySelectorAll('.stat-number');
    const floatingActionButton = document.querySelector('.floating-action-button');
    const reviewForm = document.getElementById('review-form');
    const contactForm = document.getElementById('contact-form');
    const starRating = document.querySelector('.star-rating');
    const paginationInfo = document.getElementById('pagination-info');
    const paginationPages = document.getElementById('pagination-pages');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const itemsPerPageSelect = document.getElementById('items-per-page');

    let currentPage = 1;
    let itemsPerPage = 6;
    let filteredProducts = [...products];
    let selectedRating = 0;

    const cartCountElement = document.querySelector('.cart-count');
    const cartItemsElement = document.getElementById('cart-items');
    const cartTotalElement = document.querySelector('.total-price');
    const checkoutBtn = document.querySelector('.checkout-btn');

    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutForm = document.getElementById('checkoutForm');

    updateCartDisplay();
    await init();

    async function init() {
        await loadSiteSettings();
        setupNavigation();
        animateStats();
        setupEventListeners();
        showPage('home');
        filteredProducts = [...products];
        updatePagination();
        setupStarRating();
        setupForms();
        setupBackToTop();
        setupAuthUI();
        updateCartDisplay();
    }

    function setupNavigation() {
        const desktopNavLinks = document.querySelectorAll('.header-nav .nav-link');
        desktopNavLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const pageId = this.getAttribute('data-page');
                document.querySelectorAll('.header-nav .nav-link').forEach(l => l.classList.remove('active'));
                document.querySelectorAll('.mobile-nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                const mobileLink = document.querySelector(`.mobile-nav-link[data-page="${pageId}"]`);
                if (mobileLink) mobileLink.classList.add('active');
                showPage(pageId);
                document.getElementById('mobileNav')?.classList.remove('active');
            });
        });

        const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const pageId = this.getAttribute('data-page');
                document.querySelectorAll('.header-nav .nav-link').forEach(l => l.classList.remove('active'));
                document.querySelectorAll('.mobile-nav-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                const desktopLink = document.querySelector(`.header-nav .nav-link[data-page="${pageId}"]`);
                if (desktopLink) desktopLink.classList.add('active');
                showPage(pageId);
                document.getElementById('mobileNav')?.classList.remove('active');
            });
        });

        const footerLinks = document.querySelectorAll('.footer-links a');
        footerLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const pageId = this.getAttribute('data-page');
                document.querySelectorAll('.header-nav .nav-link').forEach(l => l.classList.remove('active'));
                document.querySelectorAll('.mobile-nav-link').forEach(l => l.classList.remove('active'));
                const desktopLink = document.querySelector(`.header-nav .nav-link[data-page="${pageId}"]`);
                const mobileLink = document.querySelector(`.mobile-nav-link[data-page="${pageId}"]`);
                if (desktopLink) desktopLink.classList.add('active');
                if (mobileLink) mobileLink.classList.add('active');
                showPage(pageId);
            });
        });

        if (floatingActionButton) {
            floatingActionButton.addEventListener('click', () => {
                showPage('contact');
                document.querySelectorAll('.header-nav .nav-link').forEach(l => l.classList.remove('active'));
                document.querySelectorAll('.mobile-nav-link').forEach(l => l.classList.remove('active'));
                const contactDesktop = document.querySelector('.header-nav .nav-link[data-page="contact"]');
                const contactMobile = document.querySelector('.mobile-nav-link[data-page="contact"]');
                if (contactDesktop) contactDesktop.classList.add('active');
                if (contactMobile) contactMobile.classList.add('active');
            });
        }
    }

    function showPage(pageId) {
        pages.forEach(page => {
            page.classList.toggle('active', page.id === `${pageId}-page`);
        });
    }

    function animateStats() {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            const timer = setInterval(() => {
                current += step;
                if (current >= target) { current = target; clearInterval(timer); }
                stat.textContent = Math.floor(current).toLocaleString();
            }, 16);
        });
    }

    function setupEventListeners() {
        if (searchInput && categorySelect && sortSelect) {
            searchInput.addEventListener('input', filterAndSortProducts);
            categorySelect.addEventListener('change', filterAndSortProducts);
            sortSelect.addEventListener('change', filterAndSortProducts);
        }
        if (itemsPerPageSelect) {
            itemsPerPageSelect.addEventListener('change', function() {
                itemsPerPage = parseInt(this.value);
                currentPage = 1;
                updatePagination();
            });
        }
        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => {
                if (currentPage > 1) { currentPage--; updatePagination(); }
            });
        }
        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => {
                const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
                if (currentPage < totalPages) { currentPage++; updatePagination(); }
            });
        }
    }

    function filterAndSortProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categorySelect.value;
        const sortMethod = sortSelect.value;
        let result = [...products];
        if (selectedCategory !== 'all') {
            result = result.filter(p => p.category === selectedCategory);
        }
        if (searchTerm) {
            result = result.filter(p => 
                p.title.toLowerCase().includes(searchTerm) || 
                p.description.toLowerCase().includes(searchTerm)
            );
        }
        switch(sortMethod) {
            case 'price-asc': result.sort((a, b) => a.price - b.price); break;
            case 'price-desc': result.sort((a, b) => b.price - a.price); break;
            case 'name-asc': result.sort((a, b) => a.title.localeCompare(b.title)); break;
            case 'name-desc': result.sort((a, b) => b.title.localeCompare(a.title)); break;
            default: result.sort((a, b) => b.sales - a.sales);
        }
        filteredProducts = result;
        currentPage = 1;
        updatePagination();
    }

    function getPaginatedProducts() {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredProducts.slice(start, start + itemsPerPage);
    }

    function updatePagination() {
        displayProducts(getPaginatedProducts());
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        if (paginationInfo) paginationInfo.textContent = `СТРАНИЦА ${currentPage} ИЗ ${totalPages || 1}`;
        if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
        updatePaginationPages(totalPages);
    }

    function updatePaginationPages(totalPages) {
        if (!paginationPages) return;
        paginationPages.innerHTML = '';
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);
        if (currentPage <= 3) endPage = Math.min(totalPages, 5);
        if (currentPage > totalPages - 3) startPage = Math.max(1, totalPages - 4);
        for (let i = startPage; i <= endPage; i++) {
            const btn = document.createElement('button');
            btn.className = `pagination-page ${i === currentPage ? 'active' : ''}`;
            btn.textContent = i;
            btn.addEventListener('click', () => { currentPage = i; updatePagination(); });
            paginationPages.appendChild(btn);
        }
    }

    function displayProducts(productsToDisplay) {
        if (!productsContainer) return;
        productsContainer.innerHTML = '';
        productsToDisplay.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-category', product.category);
            const categoryClass = `category-${product.category}`;
            const featuresList = product.features ? product.features.map(f => `<li>${f}</li>`).join('') : '';
            const ratingStars = getRatingStars(product.rating);
            
            let imageHtml = '';
            if (product.image_url) {
                imageHtml = `<div class="product-image"><img src="${product.image_url}" alt="${product.title}" loading="lazy"></div>`;
            } else {
                imageHtml = `<div class="product-image"></div>`;
            }       
            
            card.innerHTML = `
                ${imageHtml}
                <div class="product-rating">
                    ${ratingStars} <span>${product.rating.toFixed(1)}</span>
                    <span style="margin-left:auto;cursor:pointer;" onclick="window.showReviews(${product.id})" title="Смотреть отзывы">
                        <i class="fas fa-comments"></i> 
                    </span>
                </div>
                <h3 class="product-title">${product.title}</h3>
                <span class="product-category ${categoryClass}">${getCategoryName(product.category)}</span>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${product.price.toLocaleString()} ₽</div>
                <div class="product-sales">ПРОДАНО: ${product.sales}</div>
                <button class="cyber-btn" onclick="window.addToCart(${product.id})">
                    <i class="fas fa-shopping-cart"></i> В КОРЗИНУ
                </button>
                ${product.features ? `<div class="product-features"><h4>ФУНКЦИИ:</h4><ul>${featuresList}</ul></div>` : ''}
            `;
            productsContainer.appendChild(card);
        });
    }

    function getCategoryName(cat) {
        const names = { corporate: 'КОРПОРАТИВНЫЙ', portfolio: 'ПОРТФОЛИО', ecommerce: 'МАГАЗИН', blog: 'БЛОГ' };
        return names[cat] || cat;
    }

    function getRatingStars(rating) {
        const full = Math.floor(rating);
        const half = rating % 1 >= 0.5 ? 1 : 0;
        const empty = 5 - full - half;
        return '<i class="fas fa-star"></i>'.repeat(full) + 
               (half ? '<i class="fas fa-star-half-alt"></i>' : '') + 
               '<i class="far fa-star"></i>'.repeat(empty);
    }

    function setupStarRating() {
        if (!starRating) return;
        const stars = starRating.querySelectorAll('i');
        stars.forEach(star => {
            star.addEventListener('click', function() {
                selectedRating = parseInt(this.dataset.value);
                stars.forEach((s, i) => {
                    if (i < selectedRating) { s.classList.add('active', 'fas'); s.classList.remove('far'); }
                    else { s.classList.remove('active', 'fas'); s.classList.add('far'); }
                });
            });
            star.addEventListener('mouseover', function() {
                const val = parseInt(this.dataset.value);
                stars.forEach((s, i) => {
                    if (i < val) { s.classList.add('fas'); s.classList.remove('far'); }
                    else { s.classList.remove('fas'); s.classList.add('far'); }
                });
            });
            star.addEventListener('mouseout', function() {
                stars.forEach((s, i) => {
                    if (i < selectedRating) { s.classList.add('fas'); s.classList.remove('far'); }
                    else { s.classList.remove('fas'); s.classList.add('far'); }
                });
            });
        });
    }

    function setupForms() {
        if (reviewForm) {
            reviewForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const comment = this.querySelector('textarea').value;
                
                if (!authToken) {
                    alert('Для отправки отзыва необходимо войти в систему');
                    showAuthModal();
                    return;
                }
                
                if (selectedRating === 0) {
                    alert('Пожалуйста, выберите оценку');
                    return;
                }
                
                const currentProductId = 1;
                const success = await submitReview(currentProductId, selectedRating, comment);
                if (success) {
                    alert('✅ СПАСИБО ЗА ВАШ ОТЗЫВ!');
                    this.reset();
                    selectedRating = 0;
                    document.querySelectorAll('.star-rating i').forEach(s => { s.classList.remove('active', 'fas'); s.classList.add('far'); });
                } else {
                    alert('❌ ОШИБКА ОТПРАВКИ. ПОПРОБУЙТЕ ПОЗЖЕ.');
                }
            });
        }

        if (contactForm) {
            contactForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                const formData = {
                    name: this.querySelector('input[placeholder="ВАШЕ ИМЯ"]').value,
                    email: this.querySelector('input[placeholder="ВАШ E-MAIL"]').value,
                    subject: this.querySelector('input[placeholder="ТЕМА СООБЩЕНИЯ"]').value,
                    message: this.querySelector('textarea').value
                };
                const sent = await sendContactFormToAPI(formData);
                alert(sent ? '✅ СООБЩЕНИЕ ОТПРАВЛЕНО!' : '❌ ОШИБКА. ПОПРОБУЙТЕ ПОЗЖЕ.');
                if (sent) this.reset();
            });
        }

        if (checkoutForm) {
            checkoutForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                await processCheckout();
            });
        }
    }

    function setupBackToTop() {
        const btn = document.getElementById('backToTop');
        if (!btn) return;
        window.addEventListener('scroll', () => btn.classList.toggle('visible', window.pageYOffset > 300));
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    function setupAuthUI() {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;
        
        if (currentUser) {
            const initials = currentUser.username.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
            const displayName = currentUser.username.length > 12 ? currentUser.username.slice(0, 10) + '...' : currentUser.username;
            
            authContainer.innerHTML = `
                <div class="user-profile">
                    <span class="user-name" data-fullname="${currentUser.username}">${displayName}</span>
                    <div class="user-avatar" onclick="window.toggleUserDropdown(event)">${initials}</div>
                    <div class="user-dropdown" id="userDropdown">
                        <div class="user-fullname">
                            <i class="fas fa-user" style="color: var(--neon-green); margin-right: 0.5rem;"></i>
                            ${currentUser.username}
                        </div>
                        <div class="user-dropdown-item" onclick="window.showUserOrders()">
                            <i class="fas fa-shopping-bag"></i> Мои заказы
                        </div>
                        <div class="user-dropdown-item" onclick="window.showUserProfile()">
                            <i class="fas fa-user-circle"></i> Профиль
                        </div>
                        <div class="user-dropdown-divider"></div>
                        <div class="user-dropdown-item" onclick="window.logout()">
                            <i class="fas fa-sign-out-alt"></i> Выйти
                        </div>
                    </div>
                </div>
            `;
        } else {
            authContainer.innerHTML = `
                <button class="cyber-btn" onclick="window.showAuthModal()" style="width: auto; padding: 0.6rem 1.5rem;">
                    <i class="fas fa-sign-in-alt"></i> ВОЙТИ
                </button>
            `;
        }
    }

    // ============================================
    // КОРЗИНА
    // ============================================
    window.addToCart = function(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        const existing = cart.find(item => item.id === productId);
        if (existing) {
            existing.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        localStorage.setItem('cyberCart', JSON.stringify(cart));
        updateCartDisplay();
        showNotification(`✅ "${product.title}" добавлен в корзину!`);
    };

    window.removeFromCart = function(productId) {
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cyberCart', JSON.stringify(cart));
        updateCartDisplay();
    };

    window.updateQuantity = function(productId, change) {
        const item = cart.find(i => i.id === productId);
        if (!item) return;
        
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
            window.removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            localStorage.setItem('cyberCart', JSON.stringify(cart));
            updateCartDisplay();
        }
    };

    function updateCartDisplay() {
        if (cartCountElement) {
            const total = cart.reduce((s, i) => s + i.quantity, 0);
            cartCountElement.textContent = total || '0';
        }
        
        if (cartItemsElement && cartTotalElement && checkoutBtn) {
            if (cart.length === 0) {
                cartItemsElement.innerHTML = '<p class="empty-cart-message"><i class="fas fa-shopping-cart" style="font-size: 3rem; opacity: 0.3; margin-bottom: 1rem;"></i><br>ВАША КОРЗИНА ПУСТА</p>';
                cartTotalElement.textContent = '0 ₽';
                checkoutBtn.disabled = true;
            } else {
                let html = '', total = 0;
                cart.forEach(item => {
                    const itemTotal = item.price * item.quantity;
                    total += itemTotal;
                    html += `
                        <div class="cart-item">
                            <div class="cart-item-image">
                                ${item.image_url ? `<img src="${item.image_url}" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">` : '<i class="fas fa-globe"></i>'}
                            </div>
                            <div class="cart-item-info">
                                <div class="cart-item-title">${item.title}</div>
                                <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 0.5rem;">
                                <button class="cart-quantity-btn" onclick="window.updateQuantity(${item.id}, -1)">-</button>
                                <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                                <button class="cart-quantity-btn" onclick="window.updateQuantity(${item.id}, 1)">+</button>
                                <i class="fas fa-trash cart-item-remove" onclick="window.removeFromCart(${item.id})" style="margin-left: 1rem;"></i>
                            </div>
                        </div>
                    `;
                });
                cartItemsElement.innerHTML = html;
                cartTotalElement.textContent = total.toLocaleString() + ' ₽';
                checkoutBtn.disabled = false;
            }
        }
    }

    window.checkout = function() {
        if (cart.length === 0) {
            alert('КОРЗИНА ПУСТА!');
            return;
        }
        
        const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
        const prepayment = Math.round(total * 0.3);
        
        const fullTotalEl = document.getElementById('checkoutFullTotal');
        const prepaymentEl = document.getElementById('checkoutPrepayment');
        
        if (fullTotalEl) fullTotalEl.textContent = total.toLocaleString();
        if (prepaymentEl) prepaymentEl.textContent = prepayment.toLocaleString();
        
        if (currentUser) {
            const nameInput = document.getElementById('checkoutName');
            if (nameInput) nameInput.value = currentUser.username || '';
        }
        
        const contactMethod = document.getElementById('checkoutContactMethod');
        const contact = document.getElementById('checkoutContact');
        const requirements = document.getElementById('checkoutRequirements');
        const agree = document.getElementById('checkoutAgree');
        
        if (contactMethod) contactMethod.value = '';
        if (contact) contact.value = '';
        if (requirements) requirements.value = '';
        if (agree) agree.checked = false;
        
        const modal = document.getElementById('checkoutModal');
        if (modal) modal.classList.add('active');
    };

    async function processCheckout() {
        const name = document.getElementById('checkoutName')?.value || '';
        const contactMethod = document.getElementById('checkoutContactMethod')?.value || '';
        const contact = document.getElementById('checkoutContact')?.value || '';
        const requirements = document.getElementById('checkoutRequirements')?.value || '';
        const payment = document.getElementById('checkoutPayment')?.value || 'card';
        const agree = document.getElementById('checkoutAgree')?.checked || false;
        
        if (!name || name.trim() === '') { alert('Пожалуйста, укажите ваше имя'); return; }
        if (!contactMethod || contactMethod === '') { alert('Пожалуйста, выберите способ связи'); return; }
        if (!contact || contact.trim() === '') { alert('Пожалуйста, укажите контакт для связи'); return; }
        if (!agree) { alert('Необходимо согласиться с условиями обработки данных'); return; }
        
        const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
        const prepayment = Math.round(total * 0.3);
        
        const orderData = {
            items: cart.map(i => ({ id: i.id, quantity: i.quantity, price: i.price })),
            totalAmount: total,
            prepaymentAmount: prepayment,
            customer_name: name,
            customer_contact_method: contactMethod,
            customer_contact: contact,
            requirements: requirements,
            payment_method: payment,
            comment: `Способ связи: ${contactMethod} (${contact})`
        };
        
        const success = await createOrderOnAPI(orderData);
        
        const modal = document.getElementById('checkoutModal');
        if (modal) modal.classList.remove('active');
        
        if (success) {
            alert(`✅ ЗАЯВКА ПРИНЯТА!\n\nМы свяжемся с вами для обсуждения деталей.`);
            cart = [];
            localStorage.removeItem('cyberCart');
            updateCartDisplay();
            showPage('home');
        } else {
            alert('❌ ОШИБКА ОТПРАВКИ. Попробуйте позже.');
        }
    }

    function showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 100px; right: 20px; background: var(--card-bg);
            border: 2px solid var(--neon-green); border-radius: 10px; padding: 1rem 2rem;
            color: white; z-index: 9999; animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = `<i class="fas fa-check-circle" style="color: var(--neon-green);"></i> ${message}`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // ============================================
    // АВТОРИЗАЦИЯ
    // ============================================
    window.showAuthModal = function() {
        const modal = document.getElementById('authModal');
        if (modal) modal.classList.add('active');
    };

    window.closeAuthModal = function() {
        document.getElementById('authModal')?.classList.remove('active');
    };

    window.switchAuthTab = function(tab) {
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        document.querySelector(`.auth-tab[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`${tab}-form`).classList.add('active');
    };

    window.login = async function() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            
            if (response.ok) {
                authToken = data.token;
                currentUser = data.user;
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                closeAuthModal();
                setupAuthUI();
                showNotification(`✅ Добро пожаловать, ${currentUser.username}!`);
            } else {
                alert(data.error || 'Ошибка входа');
            }
        } catch (error) {
            alert('Ошибка соединения');
        }
    };

    window.register = async function() {
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirm').value;
        
        if (password !== confirm) { alert('Пароли не совпадают'); return; }
        
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await response.json();
            
            if (response.ok) {
                authToken = data.token;
                currentUser = data.user;
                localStorage.setItem('authToken', authToken);
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                closeAuthModal();
                setupAuthUI();
                showNotification(`✅ Регистрация успешна!`);
            } else {
                alert(data.error || 'Ошибка регистрации');
            }
        } catch (error) {
            alert('Ошибка соединения');
        }
    };

    window.logout = function() {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        setupAuthUI();
        showNotification('👋 Вы вышли из системы');
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.classList.remove('active');
    };

    window.toggleUserDropdown = function(event) {
        event.stopPropagation();
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.classList.toggle('active');
    };

    window.showUserProfile = function() {
        if (currentUser) {
            alert(`👤 ПРОФИЛЬ\n\nИмя: ${currentUser.username}\nEmail: ${currentUser.email}`);
        }
        document.getElementById('userDropdown')?.classList.remove('active');
    };

    // ============================================
    // ЗАКАЗЫ ПОЛЬЗОВАТЕЛЯ (РАБОЧАЯ ВЕРСИЯ)
    // ============================================
    window.showUserOrders = async function() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.classList.remove('active');
        
        if (!authToken) {
            alert('Необходимо войти в систему');
            window.showAuthModal();
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/my-orders`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            if (!response.ok) throw new Error('Ошибка загрузки');
            
            const orders = await response.json();
            
            // Создаем модальное окно
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.id = 'ordersModal';
            modal.style.cssText = `display:flex; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:3000; justify-content:center; align-items:flex-start; overflow-y:auto; padding:20px;`;
            
            let contentHtml = '';
            
            if (orders.length === 0) {
                contentHtml = `
                    <div style="text-align:center; padding:3rem;">
                        <i class="fas fa-shopping-bag" style="font-size:4rem; color:#0abdc6; opacity:0.5; margin-bottom:1rem;"></i>
                        <h3 style="color:#0abdc6; margin-bottom:1rem;">У ВАС ПОКА НЕТ ЗАКАЗОВ</h3>
                        <p style="color:#888; margin-bottom:2rem;">Перейдите в каталог, чтобы выбрать сайт!</p>
                        <button class="cyber-btn" onclick="window.closeOrdersModal(); window.scrollToCatalog();">
                            <i class="fas fa-rocket"></i> ПЕРЕЙТИ В КАТАЛОГ
                        </button>
                    </div>
                `;
            } else {
                orders.forEach(order => {
                    const statusNames = { pending: 'ОЖИДАЕТ', processing: 'В РАБОТЕ', shipped: 'ОТПРАВЛЕН', delivered: 'ДОСТАВЛЕН', cancelled: 'ОТМЕНЕН' };
                    const statusColors = { pending: '#f5e62b', processing: '#0abdc6', shipped: '#8a2be2', delivered: '#23d9a5', cancelled: '#ff3838' };
                    const date = new Date(order.created_at).toLocaleString('ru');
                    
                    let itemsHtml = '';
                    let totalItems = 0;
                    if (order.items && order.items.length > 0) {
                        order.items.forEach(item => {
                            const price = parseFloat(item.price) || 0;
                            totalItems += price * item.quantity;
                            itemsHtml += `
                                <div style="display:flex; justify-content:space-between; padding:0.5rem; border-bottom:1px solid rgba(255,255,255,0.1);">
                                    <span style="color:#ccc;">${item.title || 'Товар'} × ${item.quantity}</span>
                                    <span style="color:#23d9a5;">${(price * item.quantity).toLocaleString()} ₽</span>
                                </div>
                            `;
                        });
                    }
                    
                    contentHtml += `
                        <div style="background:rgba(10,10,26,0.7); border:1px solid #8a2be2; border-radius:10px; padding:1.5rem; margin-bottom:1rem;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                                <div>
                                    <span style="font-family:'Orbitron'; font-size:1.2rem; color:#0abdc6;">ЗАКАЗ #${order.id}</span>
                                    <div style="color:#888; font-size:0.8rem;">${date}</div>
                                </div>
                                <span style="padding:0.4rem 1rem; border-radius:20px; background:${statusColors[order.status]}20; color:${statusColors[order.status]}; border:1px solid ${statusColors[order.status]};">
                                    ${statusNames[order.status] || order.status}
                                </span>
                            </div>
                            <div style="margin-bottom:1rem;">${itemsHtml}</div>
                            <div style="display:flex; justify-content:space-between; padding-top:1rem; border-top:1px solid rgba(10,200,255,0.2);">
                                <span style="color:#888;">${order.customer_name || ''}</span>
                                <div><span style="color:#ccc;">ИТОГО: </span><span style="color:#ff2ced; font-weight:bold;">${parseFloat(order.total_amount).toLocaleString()} ₽</span></div>
                            </div>
                        </div>
                    `;
                });
            }
            
            modal.innerHTML = `
                <div style="background:#0a0a1a; border:2px solid #0abdc6; border-radius:15px; padding:2rem; max-width:800px; width:90%; max-height:80vh; overflow-y:auto;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                        <h3 style="color:#0abdc6;"><i class="fas fa-shopping-bag" style="color:#23d9a5; margin-right:0.5rem;"></i>МОИ ЗАКАЗЫ</h3>
                        <span onclick="window.closeOrdersModal()" style="font-size:2rem; cursor:pointer; color:#ff2ced;">&times;</span>
                    </div>
                    ${contentHtml}
                </div>
            `;
            
            document.body.appendChild(modal);
            
            modal.addEventListener('click', function(e) {
                if (e.target === modal) window.closeOrdersModal();
            });
            
        } catch (error) {
            console.error('Ошибка:', error);
            alert('❌ Не удалось загрузить заказы');
        }
    };

    window.closeOrdersModal = function() {
        const modal = document.getElementById('ordersModal');
        if (modal) modal.remove();
    };

    // ============================================
    // ОТЗЫВЫ И ПРОЧЕЕ
    // ============================================
    window.showReviews = async function(productId) {
        const reviews = await loadReviewsForProduct(productId);
        const product = products.find(p => p.id === productId);
        
        let html = `<h3 style="color: #0abdc6; margin-bottom: 1rem;">ОТЗЫВЫ: ${product?.title}</h3>`;
        
        if (reviews.length === 0) {
            html += '<p style="color: #888;">Пока нет отзывов. Будьте первым!</p>';
        } else {
            reviews.forEach(r => {
                const stars = '★'.repeat(Math.floor(r.rating)) + '☆'.repeat(5 - Math.floor(r.rating));
                html += `
                    <div style="background: rgba(10,10,26,0.5); border: 1px solid #8a2be2; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="color: #0abdc6; font-weight: bold;">${r.username || 'Гость'}</span>
                            <span style="color: #f5e62b;">${stars} (${r.rating})</span>
                        </div>
                        <p style="color: #ccc;">${r.comment}</p>
                    </div>
                `;
            });
        }
        
        html += `<button class="cyber-btn" onclick="window.closeReviewsModal()" style="margin-top: 1rem;">ЗАКРЫТЬ</button>`;
        
        const modal = document.getElementById('reviewsModal');
        const content = document.getElementById('reviewsContent');
        if (modal && content) {
            content.innerHTML = html;
            modal.classList.add('active');
        }
    };

    window.closeReviewsModal = function() {
        document.getElementById('reviewsModal')?.classList.remove('active');
    };

    window.scrollToCatalog = function() {
        showPage('catalog');
        document.querySelectorAll('.header-nav .nav-link').forEach(l => l.classList.remove('active'));
        document.querySelector('.nav-link[data-page="catalog"]').classList.add('active');
    };

    window.showDemo = function() {
        alert('🎬 ДЕМОНСТРАЦИЯ\n\nЗагрузка голографического интерфейса...\n\nДобро пожаловать в 2077 год!');
    };

    window.toggleMobileMenu = function() {
        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav) mobileNav.classList.toggle('active');
    };

    window.closeCheckoutModal = function() {
        document.getElementById('checkoutModal')?.classList.remove('active');
    };
});

// Закрытие модальных окон по клику вне
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('mobile-nav-link')) {
        document.getElementById('mobileNav')?.classList.remove('active');
    }
    if (!e.target.closest('.user-profile')) {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.classList.remove('active');
    }
    const checkoutModal = document.getElementById('checkoutModal');
    if (e.target === checkoutModal) checkoutModal?.classList.remove('active');
    const authModal = document.getElementById('authModal');
    if (e.target === authModal) authModal?.classList.remove('active');
    const reviewsModal = document.getElementById('reviewsModal');
    if (e.target === reviewsModal) reviewsModal?.classList.remove('active');
});