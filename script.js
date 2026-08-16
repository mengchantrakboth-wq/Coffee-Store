/* ---------- Mobile nav toggle ---------- */
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        menuToggle.setAttribute('aria-expanded', isOpen);
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

/* ---------- Toast ---------- */
const toast = document.getElementById('toast');
let toastTimer = null;
function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

/* ---------- Cart ---------- */
const CART_KEY = 'coffeeCart';

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    renderCart();
}

function addToCart(name, price, img) {
    const cart = getCart();
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ name, price, img, qty: 1 });
    }
    saveCart(cart);
    showToast(`${name} added to cart`);
}

function changeQty(index, delta) {
    const cart = getCart();
    if (!cart[index]) return;
    cart[index].qty += delta;
    if (cart[index].qty <= 0) {
        cart.splice(index, 1);
    }
    saveCart(cart);
}

function removeFromCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
}

const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const cartCountEl = document.getElementById('cartCount');

function renderCart() {
    const cart = getCart();

    if (cartCountEl) {
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCountEl.textContent = totalQty;
        cartCountEl.style.display = totalQty > 0 ? 'flex' : 'none';
    }

    if (!cartItemsEl) return;

    if (cart.length === 0) {
        cartItemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
        if (cartTotalEl) cartTotalEl.textContent = '$0.00';
        return;
    }

    let total = 0;
    cartItemsEl.innerHTML = cart.map((item, index) => {
        const lineTotal = item.price * item.qty;
        total += lineTotal;
        return `
            <div class="cart-item">
                <img src="${item.img || ''}" alt="${item.name}">
                <div class="cart-item-info">
                    <p class="cart-item-name">${item.name}</p>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    <div class="qty-control">
                        <button class="qty-btn" data-action="decrease" data-index="${index}">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" data-action="increase" data-index="${index}">+</button>
                    </div>
                </div>
                <button class="remove-btn" data-index="${index}" aria-label="Remove item"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
    }).join('');

    if (cartTotalEl) cartTotalEl.textContent = `$${total.toFixed(2)}`;
}

if (cartItemsEl) {
    cartItemsEl.addEventListener('click', (e) => {
        const qtyBtn = e.target.closest('.qty-btn');
        const removeBtn = e.target.closest('.remove-btn');
        if (qtyBtn) {
            const index = Number(qtyBtn.dataset.index);
            const delta = qtyBtn.dataset.action === 'increase' ? 1 : -1;
            changeQty(index, delta);
        } else if (removeBtn) {
            removeFromCart(Number(removeBtn.dataset.index));
        }
    });
}

document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
        const name = btn.dataset.name;
        const price = parseFloat(btn.dataset.price);
        const img = btn.dataset.img;
        addToCart(name, price, img);
    });
});

/* ---------- Cart drawer open/close ---------- */
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartToggle = document.getElementById('cartToggle');
const closeCart = document.getElementById('closeCart');
const checkoutBtn = document.getElementById('checkoutBtn');

function openCart() {
    cartDrawer?.classList.add('open');
    cartOverlay?.classList.add('open');
}
function closeCartDrawer() {
    cartDrawer?.classList.remove('open');
    cartOverlay?.classList.remove('open');
}

cartToggle?.addEventListener('click', openCart);
closeCart?.addEventListener('click', closeCartDrawer);
cartOverlay?.addEventListener('click', closeCartDrawer);

checkoutBtn?.addEventListener('click', () => {
    const cart = getCart();
    if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
    }
    showToast('Thanks! Your order has been placed.');
    saveCart([]);
    closeCartDrawer();
});

renderCart();

/* ---------- Search filter ---------- */
const searchInput = document.getElementById('searchInput');
const noResults = document.getElementById('noResults');

function filterCards(query) {
    const q = query.trim().toLowerCase();
    const cards = document.querySelectorAll('.drink, .item');
    let visibleCount = 0;

    cards.forEach(card => {
        const nameEl = card.querySelector('.title, h2');
        const name = nameEl ? nameEl.textContent.toLowerCase() : '';
        const matches = q === '' || name.includes(q);
        card.style.display = matches ? '' : 'none';
        if (matches) visibleCount++;
    });

    if (noResults) {
        noResults.hidden = !(q !== '' && visibleCount === 0);
    }
}

searchInput?.addEventListener('input', (e) => filterCards(e.target.value));

/* ---------- Newsletter form ---------- */
const newsletterForm = document.getElementById('newsletterForm');
const newsletterMessage = document.getElementById('newsletterMessage');

newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('newsletterEmail');
    const email = emailInput.value.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        newsletterMessage.textContent = 'Please enter a valid email address.';
        newsletterMessage.className = 'newsletter-message error';
        return;
    }

    newsletterMessage.textContent = `Thanks! Your 15% code has been sent to ${email}.`;
    newsletterMessage.className = 'newsletter-message success';
    newsletterForm.reset();
});

/* ---------- Back to top ---------- */
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (backToTop) {
        backToTop.classList.toggle('show', window.scrollY > 400);
    }
});

backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealEls.forEach(el => observer.observe(el));
} else {
    revealEls.forEach(el => el.classList.add('visible'));
}

/* ---------- Shop category tabs ---------- */
const tabButtons = document.querySelectorAll('.tab-btn');
const shopGrid = document.getElementById('shopGrid');

if (tabButtons.length && shopGrid) {
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.dataset.tab;
            shopGrid.querySelectorAll('[data-category]').forEach(card => {
                card.style.display = (category === 'all' || card.dataset.category === category) ? '' : 'none';
            });
            if (searchInput) searchInput.value = '';
            if (noResults) noResults.hidden = true;
        });
    });
}

/* ---------- Login / Signup page ---------- */
const loginTabBtn = document.getElementById('loginTabBtn');
const signupTabBtn = document.getElementById('signupTabBtn');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

function switchAuthTab(target) {
    const showLogin = target === 'loginForm';
    loginTabBtn?.classList.toggle('active', showLogin);
    signupTabBtn?.classList.toggle('active', !showLogin);
    if (loginForm) loginForm.hidden = !showLogin;
    if (signupForm) signupForm.hidden = showLogin;
}

loginTabBtn?.addEventListener('click', () => switchAuthTab('loginForm'));
signupTabBtn?.addEventListener('click', () => switchAuthTab('signupForm'));

const loginMessage = document.getElementById('loginMessage');
loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        loginMessage.textContent = 'Please enter a valid email address.';
        loginMessage.className = 'auth-message error';
        return;
    }
    if (password.length < 6) {
        loginMessage.textContent = 'Password must be at least 6 characters.';
        loginMessage.className = 'auth-message error';
        return;
    }
    loginMessage.textContent = `Welcome back! Logged in as ${email}.`;
    loginMessage.className = 'auth-message success';
    showToast('Logged in successfully');
});

const signupMessage = document.getElementById('signupMessage');
signupForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name) {
        signupMessage.textContent = 'Please enter your name.';
        signupMessage.className = 'auth-message error';
        return;
    }
    if (!emailPattern.test(email)) {
        signupMessage.textContent = 'Please enter a valid email address.';
        signupMessage.className = 'auth-message error';
        return;
    }
    if (password.length < 6) {
        signupMessage.textContent = 'Password must be at least 6 characters.';
        signupMessage.className = 'auth-message error';
        return;
    }
    if (password !== confirm) {
        signupMessage.textContent = 'Passwords do not match.';
        signupMessage.className = 'auth-message error';
        return;
    }
    signupMessage.textContent = `Account created! Welcome, ${name}.`;
    signupMessage.className = 'auth-message success';
    showToast('Account created successfully');
});