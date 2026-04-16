// ============================================
// API КОНФИГУРАЦИЯ
// ============================================
const API_URL = '/api';
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
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[\d\s\+\-\(\)]{10,}$/.test(phone);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `cyber-notification ${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    notification.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ============================================
// ФУНКЦИИ API
// ============================================
async function loadSiteSettings() {
    if (!USE_API) return;
    try {
        const response = await fetch(`${API_URL}/settings`);
        if (!response.ok) return;
        const settings = await response.json();

        // Сохраняем настройки глобально
        window.siteSettings = settings;
        console.log('🌍 Настройки сайта загружены:', settings);
        
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
        console.log('✅ Настройки сайта применены');
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
        initCyberMap();
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
            case 'rating-desc': result.sort((a, b) => b.rating - a.rating); break;
            case 'rating-asc': result.sort((a, b) => a.rating - b.rating); break;
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
                
                const productSelect = document.createElement('select');
                productSelect.className = 'cyber-select';
                productSelect.style.marginBottom = '1rem';
                productSelect.innerHTML = '<option value="">ВЫБЕРИТЕ ТОВАР</option>' + 
                    products.map(p => `<option value="${p.id}">${p.title}</option>`).join('');
                
                const modal = document.createElement('div');
                modal.className = 'modal active';
                modal.style.cssText = `display:flex; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.9); z-index:3000; justify-content:center; align-items:center;`;
                
                modal.innerHTML = `
                    <div style="background:#0a0a1a; border:2px solid #0abdc6; border-radius:15px; padding:2rem; max-width:400px; width:90%;">
                        <h3 style="color:#0abdc6; margin-bottom:1rem;">ВЫБЕРИТЕ ТОВАР</h3>
                        <div id="productSelectContainer"></div>
                        <button class="cyber-btn" id="confirmProductSelect" style="margin-top:1rem;">ОТПРАВИТЬ ОТЗЫВ</button>
                        <button class="cyber-btn" onclick="this.closest('.modal').remove()" style="margin-top:0.5rem; background:#666;">ОТМЕНА</button>
                    </div>
                `;
                
                document.body.appendChild(modal);
                document.getElementById('productSelectContainer').appendChild(productSelect);
                
                document.getElementById('confirmProductSelect').addEventListener('click', async () => {
                    const selectedProductId = parseInt(productSelect.value);
                    if (!selectedProductId) {
                        alert('Выберите товар');
                        return;
                    }
                    
                    modal.remove();
                    const success = await submitReview(selectedProductId, selectedRating, comment);
                    if (success) {
                        showNotification('✅ СПАСИБО ЗА ВАШ ОТЗЫВ!', 'success');
                        reviewForm.reset();
                        selectedRating = 0;
                        document.querySelectorAll('.star-rating i').forEach(s => { 
                            s.classList.remove('active', 'fas'); 
                            s.classList.add('far'); 
                        });
                    } else {
                        showNotification('❌ ОШИБКА ОТПРАВКИ', 'error');
                    }
                });
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
                if (sent) {
                    showNotification('✅ СООБЩЕНИЕ ОТПРАВЛЕНО!', 'success');
                    this.reset();
                } else {
                    showNotification('❌ ОШИБКА. ПОПРОБУЙТЕ ПОЗЖЕ.', 'error');
                }
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
        showNotification(`✅ "${product.title}" добавлен в корзину!`, 'success');
    };

    window.removeFromCart = function(productId) {
        const item = cart.find(i => i.id === productId);
        if (!item) return;
        
        if (confirm(`Удалить "${item.title}" из корзины?`)) {
            cart = cart.filter(item => item.id !== productId);
            localStorage.setItem('cyberCart', JSON.stringify(cart));
            updateCartDisplay();
            showNotification(`🗑️ "${item.title}" удалён из корзины`, 'warning');
        }
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
            showNotification('🛒 КОРЗИНА ПУСТА!', 'warning');
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
        const nameInput = document.getElementById('checkoutName');
        const contactMethodInput = document.getElementById('checkoutContactMethod');
        const contactInput = document.getElementById('checkoutContact');
        const agreeInput = document.getElementById('checkoutAgree');
        
        const name = nameInput?.value?.trim() || '';
        const contactMethod = contactMethodInput?.value || '';
        const contact = contactInput?.value?.trim() || '';
        const requirements = document.getElementById('checkoutRequirements')?.value?.trim() || '';
        const payment = document.getElementById('checkoutPayment')?.value || 'card';
        const agree = agreeInput?.checked || false;
        
        if (!name) {
            showNotification('❌ Укажите ваше имя', 'error');
            nameInput?.focus();
            return;
        }
        
        if (!contactMethod) {
            showNotification('❌ Выберите способ связи', 'error');
            contactMethodInput?.focus();
            return;
        }
        
        if (!contact) {
            showNotification('❌ Укажите контакт для связи', 'error');
            contactInput?.focus();
            return;
        }
        
        if (contactMethod === 'email' && !validateEmail(contact)) {
            showNotification('❌ Укажите корректный email', 'error');
            contactInput?.focus();
            return;
        }
        
        if (contactMethod === 'phone' && !validatePhone(contact)) {
            showNotification('❌ Укажите корректный номер телефона', 'error');
            contactInput?.focus();
            return;
        }
        
        if (!agree) {
            showNotification('❌ Необходимо согласиться с условиями', 'error');
            return;
        }
        
        const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
        
        const orderData = {
            items: cart.map(i => ({ id: i.id, quantity: i.quantity, price: i.price })),
            totalAmount: total,
            customer_name: name,
            customer_contact_method: contactMethod,
            customer_contact: contact,
            requirements: requirements,
            payment_method: payment,
            comment: `Способ связи: ${contactMethod} (${contact})`
        };
        
        const submitBtn = document.querySelector('.checkout-submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ОТПРАВКА...';
        submitBtn.disabled = true;
        
        try {
            const success = await createOrderOnAPI(orderData);
            
            const modal = document.getElementById('checkoutModal');
            if (modal) modal.classList.remove('active');
            
            if (success) {
                showNotification('✅ ЗАЯВКА ПРИНЯТА! Мы свяжемся с вами в ближайшее время.', 'success');
                cart = [];
                localStorage.removeItem('cyberCart');
                updateCartDisplay();
                showPage('home');
            } else {
                showNotification('❌ ОШИБКА ОТПРАВКИ. Попробуйте позже.', 'error');
            }
        } catch (error) {
            showNotification('❌ ОШИБКА ОТПРАВКИ. Проверьте соединение с сервером.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
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
                showNotification(`✅ Добро пожаловать, ${currentUser.username}!`, 'success');
            } else {
                showNotification(data.error || 'Ошибка входа', 'error');
            }
        } catch (error) {
            showNotification('Ошибка соединения', 'error');
        }
    };

    window.register = async function() {
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirm').value;
        
        if (password !== confirm) {
            showNotification('Пароли не совпадают', 'error');
            return;
        }
        
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
                showNotification(`✅ Регистрация успешна!`, 'success');
            } else {
                showNotification(data.error || 'Ошибка регистрации', 'error');
            }
        } catch (error) {
            showNotification('Ошибка соединения', 'error');
        }
    };

    window.logout = function() {
        authToken = null;
        currentUser = null;
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        setupAuthUI();
        showNotification('👋 Вы вышли из системы', 'info');
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
    // ЗАКАЗЫ ПОЛЬЗОВАТЕЛЯ
    // ============================================
    window.showUserOrders = async function() {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown) dropdown.classList.remove('active');
        
        if (!authToken) {
            showNotification('Необходимо войти в систему', 'warning');
            window.showAuthModal();
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/my-orders`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            
            if (!response.ok) throw new Error('Ошибка загрузки');
            
            const orders = await response.json();
            
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
                contentHtml = `
                    <div style="margin-bottom:1.5rem; display:flex; gap:1rem; flex-wrap:wrap;">
                        <input type="text" id="orderSearch" placeholder="🔍 ПОИСК ПО ID..." 
                               style="flex:1; padding:0.8rem; background:rgba(10,10,26,0.8); border:2px solid #0abdc6; border-radius:5px; color:white;">
                        <select id="statusFilter" style="flex:1; padding:0.8rem; background:rgba(10,10,26,0.8); border:2px solid #8a2be2; border-radius:5px; color:white;">
                            <option value="all">ВСЕ СТАТУСЫ</option>
                            <option value="pending">⏳ ОЖИДАЕТ</option>
                            <option value="processing">⚙️ В РАБОТЕ</option>
                            <option value="shipped">🚚 ОТПРАВЛЕН</option>
                            <option value="delivered">✅ ДОСТАВЛЕН</option>
                            <option value="cancelled">❌ ОТМЕНЕН</option>
                        </select>
                    </div>
                    <div id="ordersList"></div>
                `;
            }
            
            modal.innerHTML = `
                <div style="background:#0a0a1a; border:2px solid #0abdc6; border-radius:15px; padding:2rem; max-width:900px; width:90%; max-height:85vh; overflow-y:auto;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                        <h3 style="color:#0abdc6;"><i class="fas fa-shopping-bag" style="color:#23d9a5; margin-right:0.5rem;"></i>МОИ ЗАКАЗЫ</h3>
                        <span onclick="window.closeOrdersModal()" style="font-size:2rem; cursor:pointer; color:#ff2ced;">&times;</span>
                    </div>
                    ${contentHtml}
                </div>
            `;
            
            document.body.appendChild(modal);
            
            if (orders.length > 0) {
                const renderOrders = (filterStatus = 'all', searchTerm = '') => {
                    const ordersList = document.getElementById('ordersList');
                    let filteredOrders = orders;
                    
                    if (filterStatus !== 'all') {
                        filteredOrders = filteredOrders.filter(o => o.status === filterStatus);
                    }
                    
                    if (searchTerm) {
                        filteredOrders = filteredOrders.filter(o => o.id.toString().includes(searchTerm));
                    }
                    
                    if (filteredOrders.length === 0) {
                        ordersList.innerHTML = '<p style="text-align:center; color:#888; padding:2rem;">🔍 ЗАКАЗЫ НЕ НАЙДЕНЫ</p>';
                        return;
                    }
                    
                    let html = '';
                    filteredOrders.forEach(order => {
                        const statusNames = { 
                            pending: 'ОЖИДАЕТ', processing: 'В РАБОТЕ', shipped: 'ОТПРАВЛЕН', 
                            delivered: 'ДОСТАВЛЕН', cancelled: 'ОТМЕНЕН' 
                        };
                        const statusColors = { 
                            pending: '#f5e62b', processing: '#0abdc6', shipped: '#8a2be2', 
                            delivered: '#23d9a5', cancelled: '#ff3838' 
                        };
                        const statusIcons = { pending: '⏳', processing: '⚙️', shipped: '🚚', delivered: '✅', cancelled: '❌' };
                        
                        let itemsHtml = '';
                        if (order.items && order.items.length > 0) {
                            order.items.forEach(item => {
                                const price = parseFloat(item.price) || 0;
                                itemsHtml += `
                                    <div style="display:flex; justify-content:space-between; padding:0.5rem; border-bottom:1px solid rgba(255,255,255,0.1);">
                                        <span style="color:#ccc;">${item.title || 'Товар'} × ${item.quantity}</span>
                                        <span style="color:#23d9a5;">${(price * item.quantity).toLocaleString()} ₽</span>
                                    </div>
                                `;
                            });
                        }
                        
                        html += `
                            <div style="background:rgba(10,10,26,0.7); border:1px solid ${statusColors[order.status]}; border-radius:10px; padding:1.5rem; margin-bottom:1rem;">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                                    <div>
                                        <span style="font-family:'Orbitron'; font-size:1.2rem; color:#0abdc6;">ЗАКАЗ #${order.id}</span>
                                        <div style="color:#888; font-size:0.8rem;">${new Date(order.created_at).toLocaleString('ru')}</div>
                                    </div>
                                    <span style="padding:0.4rem 1rem; border-radius:20px; background:${statusColors[order.status]}20; color:${statusColors[order.status]}; border:1px solid ${statusColors[order.status]};">
                                        ${statusIcons[order.status]} ${statusNames[order.status]}
                                    </span>
                                </div>
                                <div style="margin-bottom:1rem;">${itemsHtml}</div>
                                <div style="display:flex; justify-content:space-between; padding-top:1rem; border-top:1px solid rgba(10,200,255,0.2);">
                                    <span style="color:#888;">${order.customer_name || 'Клиент'}</span>
                                    <span style="color:#ff2ced; font-weight:bold; font-size:1.2rem;">${parseFloat(order.total_amount).toLocaleString()} ₽</span>
                                </div>
                                <div style="margin-top:1rem; text-align:center;">
                                    <button onclick="window.copyOrderId(${order.id})" style="background:rgba(10,200,255,0.1); border:1px solid #0abdc6; border-radius:5px; padding:0.5rem 1rem; color:#0abdc6; cursor:pointer;">
                                        <i class="far fa-copy"></i> СКОПИРОВАТЬ ID: ${order.id}
                                    </button>
                                </div>
                            </div>
                        `;
                    });
                    
                    ordersList.innerHTML = html;
                };
                
                renderOrders();
                
                document.getElementById('orderSearch')?.addEventListener('input', (e) => {
                    renderOrders(document.getElementById('statusFilter').value, e.target.value);
                });
                
                document.getElementById('statusFilter')?.addEventListener('change', (e) => {
                    renderOrders(e.target.value, document.getElementById('orderSearch')?.value || '');
                });
            }
            
            modal.addEventListener('click', (e) => { if (e.target === modal) window.closeOrdersModal(); });
            
        } catch (error) {
            console.error('Ошибка:', error);
            showNotification('❌ Не удалось загрузить заказы', 'error');
        }
    };

    window.copyOrderId = function(orderId) {
        navigator.clipboard?.writeText(orderId.toString()).then(() => {
            showNotification(`✅ ID заказа #${orderId} скопирован!`, 'success');
        }).catch(() => {
            prompt('ID заказа:', orderId);
        });
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
        
        let html = `
            <div style="margin-bottom: 1.5rem;">
                <h3 style="color: #0abdc6; margin-bottom: 0.5rem;">
                    <i class="fas fa-star" style="color: #f5e62b;"></i> ОТЗЫВЫ: ${product?.title || 'ТОВАР'}
                </h3>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span style="color: #888;">Средняя оценка:</span>
                    <span style="color: #f5e62b; font-size: 1.2rem;">${'★'.repeat(Math.round(product?.rating || 0))}${'☆'.repeat(5 - Math.round(product?.rating || 0))}</span>
                    <span style="color: #23d9a5;">${product?.rating?.toFixed(1) || '0.0'}</span>
                </div>
            </div>
        `;
        
        if (reviews.length === 0) {
            html += '<p style="color: #888; padding: 1rem; text-align: center;">📝 Пока нет отзывов. Будьте первым!</p>';
        } else {
            reviews.forEach(r => {
                const stars = '★'.repeat(Math.floor(r.rating)) + '☆'.repeat(5 - Math.floor(r.rating));
                html += `
                    <div style="background: rgba(10,10,26,0.5); border: 1px solid #8a2be2; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="color: #0abdc6; font-weight: bold;">
                                <i class="fas fa-user-circle"></i> ${r.username || 'Гость'}
                            </span>
                            <span style="color: #f5e62b;">${stars} (${r.rating})</span>
                        </div>
                        <p style="color: #ccc; margin-top: 0.5rem;">${r.comment}</p>
                        <div style="color: #666; font-size: 0.8rem; margin-top: 0.5rem; text-align: right;">
                            ${new Date(r.created_at).toLocaleString('ru')}
                        </div>
                    </div>
                `;
            });
        }
        
        if (authToken) {
            html += `
                <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 2px solid #0abdc6;">
                    <h4 style="color: #23d9a5; margin-bottom: 1rem;">
                        <i class="fas fa-pen"></i> ОСТАВИТЬ ОТЗЫВ
                    </h4>
                    <div class="rating-select" style="margin-bottom: 1rem;">
                        <span style="color: #ccc;">ОЦЕНКА:</span>
                        <div class="star-rating" id="reviewStars">
                            <i class="far fa-star" data-value="1"></i>
                            <i class="far fa-star" data-value="2"></i>
                            <i class="far fa-star" data-value="3"></i>
                            <i class="far fa-star" data-value="4"></i>
                            <i class="far fa-star" data-value="5"></i>
                        </div>
                    </div>
                    <textarea id="reviewComment" class="cyber-textarea" placeholder="ВАШ ОТЗЫВ..." rows="3" style="margin-bottom: 1rem;"></textarea>
                    <button class="cyber-btn" onclick="window.submitProductReview(${productId})" style="width: auto; padding: 0.8rem 2rem;">
                        <i class="fas fa-paper-plane"></i> ОТПРАВИТЬ ОТЗЫВ
                    </button>
                </div>
            `;
        } else {
            html += `
                <div style="margin-top: 2rem; padding: 1.5rem; background: rgba(10,10,26,0.5); border-radius: 8px; text-align: center;">
                    <p style="color: #888; margin-bottom: 1rem;">
                        <i class="fas fa-lock"></i> Для отправки отзыва необходимо войти в систему
                    </p>
                    <button class="cyber-btn" onclick="window.closeReviewsModal(); window.showAuthModal();" style="width: auto; padding: 0.8rem 2rem;">
                        <i class="fas fa-sign-in-alt"></i> ВОЙТИ
                    </button>
                </div>
            `;
        }
        
        html += `<button class="cyber-btn" onclick="window.closeReviewsModal()" style="margin-top: 1.5rem;">ЗАКРЫТЬ</button>`;
        
        const modal = document.getElementById('reviewsModal');
        const content = document.getElementById('reviewsContent');
        if (modal && content) {
            content.innerHTML = html;
            modal.classList.add('active');
            
            setTimeout(() => {
                const stars = document.querySelectorAll('#reviewStars i');
                let selectedRating = 0;
                
                stars.forEach(star => {
                    star.addEventListener('click', function() {
                        selectedRating = parseInt(this.dataset.value);
                        stars.forEach((s, i) => {
                            if (i < selectedRating) {
                                s.classList.add('fas');
                                s.classList.remove('far');
                            } else {
                                s.classList.remove('fas');
                                s.classList.add('far');
                            }
                        });
                    });
                    
                    star.addEventListener('mouseover', function() {
                        const val = parseInt(this.dataset.value);
                        stars.forEach((s, i) => {
                            if (i < val) {
                                s.classList.add('fas');
                                s.classList.remove('far');
                            } else {
                                s.classList.remove('fas');
                                s.classList.add('far');
                            }
                        });
                    });
                    
                    star.addEventListener('mouseout', function() {
                        stars.forEach((s, i) => {
                            if (i < selectedRating) {
                                s.classList.add('fas');
                                s.classList.remove('far');
                            } else {
                                s.classList.remove('fas');
                                s.classList.add('far');
                            }
                        });
                    });
                });
                
                window.getSelectedRating = () => selectedRating;
            }, 100);
        }
    };

    window.submitProductReview = async function(productId) {
        const rating = window.getSelectedRating ? window.getSelectedRating() : 0;
        const comment = document.getElementById('reviewComment')?.value?.trim();
        
        if (rating === 0) {
            alert('Пожалуйста, выберите оценку');
            return;
        }
        
        if (!comment) {
            alert('Пожалуйста, напишите отзыв');
            return;
        }
        
        const submitBtn = document.querySelector('#reviewsContent .cyber-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ОТПРАВКА...';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch(`${API_URL}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    product_id: productId,
                    rating: rating,
                    comment: comment
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showNotification('✅ СПАСИБО ЗА ВАШ ОТЗЫВ!', 'success');
                closeReviewsModal();
                
                const apiProducts = await loadProductsFromAPI();
                if (apiProducts) {
                    products = apiProducts;
                    if (typeof updatePagination === 'function') {
                        updatePagination();
                    }
                }
            } else {
                showNotification(data.error || '❌ ОШИБКА ОТПРАВКИ. ПОПРОБУЙТЕ ПОЗЖЕ.', 'error');
            }
        } catch (error) {
            console.error('Ошибка отправки отзыва:', error);
            showNotification('❌ ОШИБКА СОЕДИНЕНИЯ С СЕРВЕРОМ', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
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

    // ============================================
    // КРУТОЕ ДЕМО С ИНТЕРАКТИВНЫМ ИНТЕРФЕЙСОМ
    // ============================================
    window.showDemo = function() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'demoModal';
        modal.style.cssText = `
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.95);
            backdrop-filter: blur(10px);
            z-index: 3000;
            justify-content: center;
            align-items: center;
            padding: 20px;
        `;
        
        const demos = [
            {
                title: 'ГОЛОГРАФИЧЕСКИЙ ИНТЕРФЕЙС',
                icon: 'fa-cube',
                color: '#ff2ced',
                description: 'Управляйте сайтом жестами и голосом. Технология распознавания движений в реальном времени.',
                features: ['Распознавание жестов', 'Голосовые команды', '3D-интерфейс']
            },
            {
                title: 'НЕЙРОСЕТЕВАЯ ОПТИМИЗАЦИЯ',
                icon: 'fa-brain',
                color: '#0abdc6',
                description: 'Искусственный интеллект анализирует поведение пользователей и оптимизирует контент.',
                features: ['ИИ-аналитика', 'Персонализация', 'A/B тестирование']
            },
            {
                title: 'КВАНТОВАЯ ЗАЩИТА',
                icon: 'fa-shield-hal',
                color: '#23d9a5',
                description: 'Шифрование на основе квантовых алгоритмов. Ваши данные под надёжной защитой.',
                features: ['Квантовое шифрование', 'Блокчейн', 'Мультифакторная аутентификация']
            },
            {
                title: 'VR/AR ИНТЕГРАЦИЯ',
                icon: 'fa-vr-cardboard',
                color: '#8a2be2',
                description: 'Полное погружение в виртуальную реальность. Демонстрация товаров в AR.',
                features: ['VR-туры', 'AR-примерка', '3D-модели']
            },
            {
                title: 'МГНОВЕННАЯ ЗАГРУЗКА',
                icon: 'fa-bolt',
                color: '#f5e62b',
                description: 'Сайты загружаются за 0.1 секунды благодаря квантовому кэшированию.',
                features: ['Квантовое кэширование', 'Edge-сеть', 'HTTP/3']
            }
        ];
        
        let currentSlide = 0;
        
        modal.innerHTML = `
            <div style="
                background: #0a0a1a;
                border: 2px solid #0abdc6;
                border-radius: 20px;
                padding: 2rem;
                max-width: 800px;
                width: 90%;
                max-height: 85vh;
                overflow-y: auto;
                position: relative;
                box-shadow: 0 0 50px rgba(10, 200, 255, 0.3);
            ">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 2px solid #0abdc6;
                ">
                    <h2 style="
                        color: #0abdc6;
                        font-family: 'Orbitron', sans-serif;
                        margin: 0;
                        font-size: clamp(1.2rem, 5vw, 1.8rem);
                    ">
                        <i class="fas fa-rocket" style="color: #ff2ced; margin-right: 10px;"></i>
                        ДЕМОНСТРАЦИЯ ТЕХНОЛОГИЙ 2077
                    </h2>
                    <span onclick="this.closest('.modal').remove()" style="
                        font-size: 2rem;
                        cursor: pointer;
                        color: #ff2ced;
                        line-height: 1;
                        transition: all 0.3s;
                    ">&times;</span>
                </div>
                
                <div id="demoSlider" style="
                    min-height: 350px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                ">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <i id="demoIcon" class="fas ${demos[0].icon}" style="
                            font-size: 80px;
                            color: ${demos[0].color};
                            text-shadow: 0 0 30px ${demos[0].color};
                            animation: float 3s ease-in-out infinite;
                        "></i>
                    </div>
                    
                    <h3 id="demoTitle" style="
                        color: ${demos[0].color};
                        font-family: 'Orbitron', sans-serif;
                        text-align: center;
                        margin-bottom: 20px;
                        font-size: 1.5rem;
                    ">${demos[0].title}</h3>
                    
                    <p id="demoDescription" style="
                        color: #ccc;
                        text-align: center;
                        line-height: 1.6;
                        margin-bottom: 30px;
                    ">${demos[0].description}</p>
                    
                    <div id="demoFeatures" style="
                        display: flex;
                        justify-content: center;
                        gap: 20px;
                        flex-wrap: wrap;
                        margin-bottom: 30px;
                    ">
                        ${demos[0].features.map(f => `
                            <span style="
                                padding: 8px 16px;
                                background: rgba(10, 200, 255, 0.1);
                                border: 1px solid ${demos[0].color};
                                border-radius: 20px;
                                color: ${demos[0].color};
                                font-size: 0.9rem;
                            ">
                                <i class="fas fa-check-circle"></i> ${f}
                            </span>
                        `).join('')}
                    </div>
                </div>
                
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 20px;
                ">
                    <button onclick="window.prevDemoSlide()" style="
                        padding: 10px 20px;
                        background: rgba(10, 200, 255, 0.1);
                        border: 2px solid #0abdc6;
                        border-radius: 8px;
                        color: #0abdc6;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                        <i class="fas fa-chevron-left"></i> НАЗАД
                    </button>
                    
                    <div style="display: flex; gap: 10px;">
                        ${demos.map((_, i) => `
                            <span class="demo-dot ${i === 0 ? 'active' : ''}" style="
                                width: 12px;
                                height: 12px;
                                background: ${i === 0 ? '#ff2ced' : 'rgba(10, 200, 255, 0.3)'};
                                border-radius: 50%;
                                cursor: pointer;
                                transition: all 0.3s;
                            " onclick="window.goToDemoSlide(${i})"></span>
                        `).join('')}
                    </div>
                    
                    <button onclick="window.nextDemoSlide()" style="
                        padding: 10px 20px;
                        background: rgba(10, 200, 255, 0.1);
                        border: 2px solid #0abdc6;
                        border-radius: 8px;
                        color: #0abdc6;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                        ДАЛЕЕ <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                
                <div style="
                    width: 100%;
                    height: 4px;
                    background: rgba(10, 200, 255, 0.1);
                    border-radius: 2px;
                    margin-top: 30px;
                    overflow: hidden;
                ">
                    <div id="demoProgress" style="
                        width: ${((currentSlide + 1) / demos.length) * 100}%;
                        height: 100%;
                        background: linear-gradient(90deg, #ff2ced, #0abdc6, #23d9a5);
                        transition: width 0.3s;
                    "></div>
                </div>
                
                <button onclick="window.scrollToCatalog(); this.closest('.modal').remove();" style="
                    width: 100%;
                    margin-top: 20px;
                    padding: 15px;
                    background: linear-gradient(90deg, #ff2ced, #0abdc6);
                    border: none;
                    border-radius: 10px;
                    color: white;
                    font-size: 1.1rem;
                    font-weight: bold;
                    text-transform: uppercase;
                    cursor: pointer;
                    transition: all 0.3s;
                ">
                    <i class="fas fa-shopping-cart"></i> ПЕРЕЙТИ В КАТАЛОГ
                </button>
            </div>
            
            <style>
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                
                .demo-dot:hover {
                    background: #ff2ced !important;
                    transform: scale(1.2);
                }
                
                .demo-dot.active {
                    background: #ff2ced !important;
                    box-shadow: 0 0 10px #ff2ced;
                }
            </style>
        `;
        
        document.body.appendChild(modal);
        
        window.demoSlides = demos;
        window.demoCurrentSlide = 0;
        
        window.prevDemoSlide = function() {
            if (window.demoCurrentSlide > 0) {
                window.demoCurrentSlide--;
                updateDemoSlide();
            }
        };
        
        window.nextDemoSlide = function() {
            if (window.demoCurrentSlide < demos.length - 1) {
                window.demoCurrentSlide++;
                updateDemoSlide();
            }
        };
        
        window.goToDemoSlide = function(index) {
            window.demoCurrentSlide = index;
            updateDemoSlide();
        };
        
        function updateDemoSlide() {
            const slide = demos[window.demoCurrentSlide];
            
            const icon = document.getElementById('demoIcon');
            icon.className = `fas ${slide.icon}`;
            icon.style.color = slide.color;
            icon.style.textShadow = `0 0 30px ${slide.color}`;
            
            const title = document.getElementById('demoTitle');
            title.textContent = slide.title;
            title.style.color = slide.color;
            
            document.getElementById('demoDescription').textContent = slide.description;
            
            const features = document.getElementById('demoFeatures');
            features.innerHTML = slide.features.map(f => `
                <span style="
                    padding: 8px 16px;
                    background: rgba(10, 200, 255, 0.1);
                    border: 1px solid ${slide.color};
                    border-radius: 20px;
                    color: ${slide.color};
                    font-size: 0.9rem;
                ">
                    <i class="fas fa-check-circle"></i> ${f}
                </span>
            `).join('');
            
            document.querySelectorAll('.demo-dot').forEach((dot, i) => {
                dot.style.background = i === window.demoCurrentSlide ? slide.color : 'rgba(10, 200, 255, 0.3)';
            });
            
            const progress = ((window.demoCurrentSlide + 1) / demos.length) * 100;
            document.getElementById('demoProgress').style.width = progress + '%';
        }
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.remove();
        });
        
        const keyHandler = function(e) {
            if (e.key === 'ArrowLeft') window.prevDemoSlide();
            if (e.key === 'ArrowRight') window.nextDemoSlide();
            if (e.key === 'Escape') modal.remove();
        };
        document.addEventListener('keydown', keyHandler);
        
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mut) => {
                if (mut.removedNodes.length > 0) {
                    document.removeEventListener('keydown', keyHandler);
                    observer.disconnect();
                }
            });
        });
        observer.observe(modal, { childList: true });
    };

    window.toggleMobileMenu = function() {
        const mobileNav = document.getElementById('mobileNav');
        if (mobileNav) mobileNav.classList.toggle('active');
    };

    window.closeCheckoutModal = function() {
        document.getElementById('checkoutModal')?.classList.remove('active');
    };
});

// ============================================
// ИНТЕРАКТИВНАЯ КАРТА
// ============================================
function initCyberMap() {
    console.log('🗺️ initCyberMap вызвана');
    
    const contactPage = document.getElementById('contact-page');
    if (!contactPage) {
        console.log('❌ Страница контактов не найдена');
        return;
    }
    
    let mapInitialized = false;
    
    // Проверяем, активна ли уже страница
    if (contactPage.classList.contains('active')) {
        console.log('📍 Страница контактов уже активна, создаём карту');
        setTimeout(() => {
            createMap();
            mapInitialized = true;
        }, 200);
    }
    
    // Наблюдаем за изменением класса
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mut) => {
            if (mut.target.classList.contains('active') && !mapInitialized) {
                console.log('📍 Страница контактов стала активной');
                setTimeout(() => {
                    createMap();
                    mapInitialized = true;
                }, 200);
            }
        });
    });
    
    observer.observe(contactPage, { attributes: true, attributeFilter: ['class'] });
}

function createMap() {
    console.log('🗺️ createMap вызвана');
    console.log('📍 window.siteSettings:', window.siteSettings);
    
    const mapElement = document.getElementById('cyberMap');
    if (!mapElement) {
        console.error('❌ Элемент карты не найден!');
        return;
    }
    if (mapElement._leaflet_id) {
        console.log('⚠️ Карта уже инициализирована');
        return;
    }
    
    // Получаем координаты из настроек или используем Москву по умолчанию
    let lat = 55.7558;
    let lng = 37.6176;
    
    if (window.siteSettings) {
        if (window.siteSettings.map_latitude) {
            lat = parseFloat(window.siteSettings.map_latitude);
        }
        if (window.siteSettings.map_longitude) {
            lng = parseFloat(window.siteSettings.map_longitude);
        }
    }
    
    console.log('📍 Координаты:', lat, lng);
    
    const companyPosition = [lat, lng];
    
    const map = L.map('cyberMap', {
        center: companyPosition,
        zoom: 12,
        zoomControl: true,
        attributionControl: true
    });
    
    L.tileLayer('https://core-renderer-tiles.maps.yandex.net/tiles?l=map&theme=dark&x={x}&y={y}&z={z}&lang=ru_RU', {
        attribution: '© <a href="https://yandex.ru/maps/">Яндекс.Карты</a>',
        maxZoom: 19
    }).addTo(map);
    
    const markers = L.markerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        maxClusterRadius: 50,
        iconCreateFunction: function(cluster) {
            const count = cluster.getChildCount();
            let size = 'small';
            let color = '#0abdc6';
            
            if (count > 50) {
                size = 'large';
                color = '#ff2ced';
            } else if (count > 20) {
                size = 'medium';
                color = '#8a2be2';
            }
            
            return L.divIcon({
                html: `
                    <div style="
                        position: relative;
                        width: ${size === 'large' ? 50 : size === 'medium' ? 40 : 30}px;
                        height: ${size === 'large' ? 50 : size === 'medium' ? 40 : 30}px;
                        background: ${color};
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 0 20px ${color};
                        border: 2px solid #23d9a5;
                        font-weight: bold;
                        color: white;
                        font-family: 'Orbitron', sans-serif;
                    ">
                        ${count}
                    </div>
                `,
                className: 'cyber-cluster',
                iconSize: L.point(size === 'large' ? 50 : size === 'medium' ? 40 : 30, 
                               size === 'large' ? 50 : size === 'medium' ? 40 : 30)
            });
        }
    });
    
    const companyIcon = L.divIcon({
        html: `
            <div style="
                position: relative;
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #ff2ced, #0abdc6);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 30px #ff2ced, 0 0 60px #0abdc6;
                border: 3px solid #23d9a5;
                animation: pulse-marker 2s infinite;
            ">
                <i class="fas fa-building" style="color: white; font-size: 24px;"></i>
            </div>
            <div style="
                position: absolute;
                bottom: -12px;
                left: 50%;
                transform: translateX(-50%);
                width: 24px;
                height: 24px;
                background: linear-gradient(135deg, #ff2ced, #0abdc6);
                clip-path: polygon(50% 100%, 0 0, 100% 0);
            "></div>
        `,
        iconSize: [50, 62],
        iconAnchor: [25, 62],
        popupAnchor: [0, -55]
    });
    
    const companyMarker = L.marker(companyPosition, { icon: companyIcon });
    
    const address = window.siteSettings?.contact_address || 'КИБЕР-ТАУЭР, УЛ. БУДУЩЕГО, 2077';
    const phone = window.siteSettings?.contact_phone || '+7 (2077) 123-45-67';
    
    companyMarker.bindPopup(`
        <div style="
            font-family: 'Rajdhani', sans-serif;
            color: #0abdc6;
            text-align: center;
            min-width: 280px;
        ">
            <h3 style="
                margin: 0 0 10px 0;
                font-family: 'Orbitron', sans-serif;
                color: #ff2ced;
                text-shadow: 0 0 10px #ff2ced;
            ">
                <i class="fas fa-star" style="color: #f5e62b;"></i> 
                КИБЕР-ТАУЭР
                <i class="fas fa-star" style="color: #f5e62b;"></i>
            </h3>
            <p style="margin: 5px 0; color: #ccc;">
                <i class="fas fa-map-pin" style="color: #ff2ced;"></i> ${address}
            </p>
            <p style="margin: 5px 0; color: #23d9a5;">
                <i class="fas fa-phone" style="color: #23d9a5;"></i> ${phone}
            </p>
            <p style="margin: 5px 0; color: #0abdc6;">
                <i class="fas fa-envelope" style="color: #0abdc6;"></i> INFO@CYBERSITES.2077
            </p>
            <hr style="border-color: #0abdc6; margin: 15px 0;">
            <p style="margin: 5px 0; font-size: 12px; color: #888;">
                <i class="fas fa-satellite"></i> ${lat}°N, ${lng}°E
            </p>
            <p style="margin: 10px 0 0 0;">
                <a href="https://yandex.ru/maps/?ll=${lng}%2C${lat}&z=15&text=${encodeURIComponent(address)}" 
                   target="_blank" 
                   style="
                       display: inline-block;
                       padding: 8px 16px;
                       background: linear-gradient(90deg, #ff2ced, #0abdc6);
                       color: white;
                       text-decoration: none;
                       border-radius: 5px;
                       font-size: 14px;
                       transition: all 0.3s;
                   "
                   onmouseover="this.style.transform='scale(1.05)'"
                   onmouseout="this.style.transform='scale(1)'">
                    <i class="fas fa-external-link-alt"></i> Открыть в Яндекс.Картах
                </a>
            </p>
        </div>
    `);
    
    markers.addLayer(companyMarker);
    map.addLayer(markers);
    
    setTimeout(() => {
        companyMarker.openPopup();
    }, 500);
    
    // Геолокация
    const userIcon = L.divIcon({
        html: `
            <div style="
                position: relative;
                width: 24px;
                height: 24px;
                background: #23d9a5;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 20px #23d9a5;
                border: 3px solid white;
                animation: user-pulse 2s infinite;
            ">
                <div style="
                    position: absolute;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: radial-gradient(circle, rgba(35,217,165,0.3) 0%, transparent 70%);
                "></div>
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -15]
    });
    
    const locateControl = L.control.locate({
        position: 'topleft',
        strings: {
            title: 'Показать моё местоположение',
            metersUnit: 'метров',
            feetUnit: 'футов'
        },
        locateOptions: {
            enableHighAccuracy: true,
            maxZoom: 16,
            watch: true
        },
        icon: 'fas fa-location-arrow',
        iconLoading: 'fas fa-spinner fa-spin',
        drawCircle: true,
        circleStyle: {
            color: '#23d9a5',
            fillColor: '#23d9a5',
            fillOpacity: 0.15,
            weight: 2,
            opacity: 0.5
        }
    }).addTo(map);
    
    map.on('locationfound', function(e) {
        const userMarker = L.marker(e.latlng, { icon: userIcon });
        const distance = map.distance(e.latlng, companyPosition);
        const distanceKm = (distance / 1000).toFixed(1);
        
        userMarker.bindPopup(`
            <div style="
                font-family: 'Rajdhani', sans-serif;
                color: #0abdc6;
                text-align: center;
                min-width: 200px;
            ">
                <h4 style="margin: 0 0 8px 0; color: #23d9a5;">
                    <i class="fas fa-user"></i> ВАШЕ МЕСТОПОЛОЖЕНИЕ
                </h4>
                <p style="margin: 5px 0; color: #ccc;">
                    Расстояние до офиса: <strong style="color: #ff2ced;">${distanceKm} км</strong>
                </p>
                <p style="margin: 5px 0; font-size: 12px; color: #888;">
                    Точность: ${Math.round(e.accuracy)} м
                </p>
            </div>
        `);
        
        markers.addLayer(userMarker);
        console.log(`📍 Расстояние до офиса: ${distanceKm} км`);
    });
    
    L.control.zoom({ position: 'topleft' }).addTo(map);
    
    const resetViewControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function(map) {
            const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
            container.innerHTML = `
                <a href="#" title="Вернуться к офису" style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 30px;
                    height: 30px;
                    background: rgba(10, 10, 26, 0.9);
                    color: #0abdc6;
                    text-decoration: none;
                    font-size: 16px;
                    border: 2px solid #0abdc6;
                    border-radius: 4px;
                ">
                    <i class="fas fa-building"></i>
                </a>
            `;
            
            container.onclick = function(e) {
                e.preventDefault();
                map.setView(companyPosition, 15);
                companyMarker.openPopup();
            };
            
            return container;
        }
    });
    
    map.addControl(new resetViewControl());
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse-marker {
            0% { transform: scale(1); box-shadow: 0 0 30px #ff2ced, 0 0 60px #0abdc6; }
            50% { transform: scale(1.15); box-shadow: 0 0 50px #ff2ced, 0 0 90px #0abdc6; }
            100% { transform: scale(1); box-shadow: 0 0 30px #ff2ced, 0 0 60px #0abdc6; }
        }
        
        @keyframes user-pulse {
            0% { box-shadow: 0 0 0 0 rgba(35, 217, 165, 0.7); }
            70% { box-shadow: 0 0 0 20px rgba(35, 217, 165, 0); }
            100% { box-shadow: 0 0 0 0 rgba(35, 217, 165, 0); }
        }
        
        .leaflet-popup-content-wrapper {
            background: rgba(10, 10, 26, 0.95) !important;
            border: 2px solid #0abdc6 !important;
            border-radius: 8px !important;
            box-shadow: 0 0 30px rgba(10, 200, 255, 0.5) !important;
            backdrop-filter: blur(10px);
        }
        
        .leaflet-popup-tip {
            background: rgba(10, 10, 26, 0.95) !important;
            border: 2px solid #0abdc6 !important;
        }
        
        .leaflet-control-zoom {
            border: 2px solid #0abdc6 !important;
            box-shadow: 0 0 20px rgba(10, 200, 255, 0.3) !important;
        }
        
        .leaflet-control-zoom a {
            background: rgba(10, 10, 26, 0.9) !important;
            color: #0abdc6 !important;
            border-bottom: 1px solid #0abdc6 !important;
        }
        
        .leaflet-control-zoom a:hover {
            background: #ff2ced !important;
            color: white !important;
        }
        
        .leaflet-control-attribution {
            background: rgba(10, 10, 26, 0.7) !important;
            color: #888 !important;
            font-size: 10px !important;
            padding: 2px 5px !important;
        }
        
        .leaflet-control-attribution a {
            color: #0abdc6 !important;
        }
        
        .cyber-cluster {
            animation: cluster-pulse 2s infinite;
        }
        
        @keyframes cluster-pulse {
            0%, 100% { filter: brightness(1); }
            50% { filter: brightness(1.3); }
        }
        
        .leaflet-control-locate {
            border: 2px solid #0abdc6 !important;
            box-shadow: 0 0 20px rgba(10, 200, 255, 0.3) !important;
        }
        
        .leaflet-control-locate a {
            background: rgba(10, 10, 26, 0.9) !important;
            color: #23d9a5 !important;
        }
        
        .leaflet-control-locate a:hover {
            background: #23d9a5 !important;
            color: white !important;
        }
        
        .leaflet-bar a {
            border-bottom: 1px solid #0abdc6 !important;
        }
        
        .leaflet-bar a:last-child {
            border-bottom: none !important;
        }
        
        .leaflet-container {
            font-family: 'Rajdhani', sans-serif !important;
        }
    `;
    document.head.appendChild(style);
    
    console.log('✅ Карта создана');
}

function addCyberGrid(map) {
    // Пустая функция для совместимости
}

L.GridLayer = L.Layer.extend({
    initialize: function(options) {
        L.setOptions(this, options);
    },
    onAdd: function(map) {
        this._map = map;
        this._container = L.DomUtil.create('div', 'leaflet-layer');
        this._update();
        map.on('moveend', this._update, this);
        map.getPanes().overlayPane.appendChild(this._container);
    },
    onRemove: function(map) {
        map.off('moveend', this._update, this);
        L.DomUtil.remove(this._container);
    },
    _update: function() {}
});

L.gridLayer = function(options) {
    return new L.GridLayer(options);
};

// ============================================
// ЗАКРЫТИЕ МОДАЛЬНЫХ ОКОН
// ============================================
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
        document.getElementById('mobileNav')?.classList.remove('active');
        document.getElementById('userDropdown')?.classList.remove('active');
    }
});

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