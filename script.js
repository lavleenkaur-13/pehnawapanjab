// ============================================================
// PEHNAWA PANJAB — SHARED SCRIPT (works on ALL pages)
// ============================================================
// Uses localStorage so cart persists across pages.
// Auto-detects whether it's running on homepage or sub-page.
// ============================================================

const isSubPage = window.location.pathname.includes('/products/') ||
    window.location.pathname.includes('/journal/') ||
    window.location.pathname.includes('/category/');

const ROOT = isSubPage ? '../' : '';

$(document).ready(function () {

    // --- Products Data (shared everywhere) ---
    const products = [
        { id: 5, name: 'Golden Zari Dupatta', price: 3499, img: 'https://i.pinimg.com/1200x/48/e0/dc/48e0dc70ad223f9a73aa9fbb30bec4cc.jpg', slug: 'golden-zari-dupatta' },
        { id: 6, name: 'Heritage Kundan Earrings', price: 2799, img: 'https://i.pinimg.com/1200x/c2/a3/63/c2a36378e5a173ebcaa11098ce08d682.jpg', slug: 'heritage-kundan-earrings' },
        { id: 7, name: 'Classic Punjabi Jutti', price: 1899, img: 'https://i.pinimg.com/1200x/b1/1e/65/b11e65c294f5f3d96801bc11ae052ca4.jpg', slug: 'classic-punjabi-jutti' },
        { id: 8, name: 'Mirror Work Kurti', price: 2299, img: 'https://i.pinimg.com/1200x/d3/3b/2f/d33b2fed22d7a1240eacab34d5db3782.jpg', slug: 'mirror-work-kurti' },
        { id: 1, name: 'Amritsari Kundan Set', price: 9999, img: 'amritsarikundanset.png', slug: 'amritsari-kundan-set' },
        { id: 2, name: 'Maharani Patiala Suit', price: 7999, img: 'maharanipatialasuit.png', slug: 'maharani-patiala-suit' },
        { id: 3, name: 'Nawabi Sherwani Jutti', price: 2899, img: 'NawabiSherwaniJutti.png', slug: 'nawabi-sherwani-jutti' },
        { id: 4, name: 'Royal Phulkari Shawl', price: 4599, img: 'royalphulkarishawl.png', slug: 'royal-phulkari-shawl' },
        { id: 9, name: 'Handwoven Phulkari Dupatta', price: 3999, img: 'HandwovenPhulkariDupatta.png', slug: 'handwoven-phulkari-dupatta' },
        { id: 10, name: 'Royal Wedding Lehenga', price: 18999, img: 'royalweddinglehnga (2).png', slug: 'royal-wedding-lehenga' },
        { id: 11, name: 'Pearl Kada Bangle Set', price: 1499, img: 'PearlKadaBangleSet.png', slug: 'pearl-kada-bangle-set' },
        { id: 12, name: 'Velvet Shawl Embroidered', price: 5999, img: 'VelvetShawlEmbroidered.png', slug: 'velvet-shawl-embroidered' }
    ];

    const formatPrice = (price) => price.toLocaleString('en-IN');

    // ============================================================
    // CART (localStorage-based — persists across pages)
    // ============================================================
    let cart = JSON.parse(localStorage.getItem('pehnawa_cart') || '[]');
    const saveCart = () => localStorage.setItem('pehnawa_cart', JSON.stringify(cart));

    const updateCartCount = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        $('#cart-count, #cart-count-link').text(totalItems);
    };

    const showToast = (message) => {
        let $toast = $('#toast');
        // Create toast if missing (sub-pages don't have it built in)
        if (!$toast.length) {
            $('body').append('<div id="toast" class="fixed bottom-10 right-10 bg-black text-white py-3 px-6 rounded-lg shadow-lg opacity-0 translate-y-4 transition-all duration-300 z-50">Item added to cart!</div>');
            $toast = $('#toast');
        }
        $toast.text(message || "Item added to cart!");
        $toast.removeClass('opacity-0 translate-y-4').addClass('opacity-100 translate-y-0');
        setTimeout(() => $toast.removeClass('opacity-100 translate-y-0').addClass('opacity-0 translate-y-4'), 2000);
    };

    // Global add-to-cart function — works on all pages
    window.addToCart = function (productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        const existing = cart.find(item => item.id === productId);
        if (existing) existing.quantity += 1;
        else cart.push({ ...product, quantity: 1 });
        saveCart();
        updateCartCount();
        if (typeof window.renderCart === 'function') window.renderCart();
        showToast("Item added to cart!");
    };

    // Initial cart count on every page
    updateCartCount();

    // ============================================================
    // CART ICON — behaves differently on homepage vs sub-page
    // ============================================================
    const isHomepage = $('#product-grid').length > 0;

    if (!isHomepage) {
        // On sub-pages: cart button takes user to homepage cart
        $('#cart-button').click(function (e) {
            e.preventDefault();
            window.location.href = ROOT + 'index.html#cart-direct';
        });
    }

    // ============================================================
    // MOBILE MENU (works on all pages)
    // ============================================================
    $('#mobile-menu-button').click(function () {
        $('#mobile-menu').toggleClass('hidden');
    });

    // ============================================================
    // HOMEPAGE-ONLY LOGIC
    // ============================================================
    if (isHomepage) {

        // --- Render product grid ---
        const $grid = $('#product-grid');
        $.each(products, function (i, p) {
            $grid.append(`
                <div class="text-left reveal" style="transition-delay:${i * 100}ms;">
                    <a href="products/${p.slug}.html" class="block product-card rounded-lg overflow-hidden" data-id="${p.id}">
                        <img src="${p.img}" alt="${p.name}" class="w-full h-96 object-cover">
                    </a>
                    <div class="pt-4">
                        <h3 class="text-lg font-medium text-brand-heading">
                            <a href="products/${p.slug}.html" class="hover:underline">${p.name}</a>
                        </h3>
                        <p class="text-md mt-1">₹${formatPrice(p.price)}</p>
                        <button class="add-to-cart-btn text-sm mt-2 opacity-80 hover:opacity-100 transition" data-id="${p.id}">Add to Cart</button>
                    </div>
                </div>`);
        });

        // --- Render cart ---
        window.renderCart = function () {
            const $cartItems = $('#cart-items');
            const $cartSummary = $('#cart-summary');
            if (!$cartItems.length) return;

            if (cart.length === 0) {
                $cartItems.html(`
                    <div class="empty-cart">
                        <p class="text-lg">Your cart is empty</p>
                        <button class="nav-link btn-primary py-3 px-10 rounded-full continue-shopping">Continue Shopping</button>
                    </div>
                `);
                $cartSummary.addClass('hidden');
                return;
            }

            $cartSummary.removeClass('hidden');
            let html = '', total = 0;
            $.each(cart, function (i, item) {
                total += item.price * item.quantity;
                html += `
                    <div class="cart-item flex items-center gap-4">
                        <img src="${item.img}" alt="${item.name}" class="w-24 h-24 object-cover rounded">
                        <div class="flex-1">
                            <h3>${item.name}</h3>
                            <p class="item-price">₹${formatPrice(item.price)}</p>
                        </div>
                        <div class="quantity-controls">
                            <button class="decrease-qty" data-id="${item.id}">−</button>
                            <span>${item.quantity}</span>
                            <button class="increase-qty" data-id="${item.id}">+</button>
                        </div>
                        <div class="text-right">
                            <p class="item-total">₹${formatPrice(item.price * item.quantity)}</p>
                            <button class="remove-item" data-id="${item.id}">Remove</button>
                        </div>
                    </div>`;
            });
            $cartItems.html(html);
            $('#cart-total').text(formatPrice(total));
            $('#checkout-btn').off('click').on('click', () => switchPage('checkout'));
        };

        const renderCheckout = () => {
            const $summaryItems = $('#checkout-summary-items');
            let total = 0, html = '';
            $.each(cart, function (i, item) {
                total += item.price * item.quantity;
                html += `
                    <div class="flex items-center justify-between gap-4 text-sm">
                        <div class="flex items-center gap-3">
                            <img src="${item.img}" class="w-12 h-12 rounded object-cover">
                            <div>
                                <p class="font-medium">${item.name}</p>
                                <p class="text-gray-500">Qty: ${item.quantity}</p>
                            </div>
                        </div>
                        <p class="font-medium">₹${formatPrice(item.price * item.quantity)}</p>
                    </div>`;
            });
            $summaryItems.html(html);
            $('#checkout-subtotal').text(`₹${formatPrice(total)}`);
            $('#checkout-total').text(`₹${formatPrice(total)}`);
        };

        // --- Cart actions ---
        $(document).on('click', '.increase-qty', function () {
            const id = $(this).data('id');
            const item = cart.find(i => i.id === id);
            if (item) { item.quantity += 1; saveCart(); updateCartCount(); window.renderCart(); }
        });

        $(document).on('click', '.decrease-qty', function () {
            const id = $(this).data('id');
            const item = cart.find(i => i.id === id);
            if (item && item.quantity > 1) { item.quantity -= 1; saveCart(); updateCartCount(); window.renderCart(); }
        });

        $(document).on('click', '.remove-item', function () {
            cart = cart.filter(i => i.id !== $(this).data('id'));
            saveCart(); updateCartCount(); window.renderCart();
        });

        $(document).on('click', '.continue-shopping', () => switchPage('shop'));

        $(document).on('click', '.add-to-cart-btn', function (e) {
            e.preventDefault();
            e.stopPropagation();
            window.addToCart($(this).data('id'));
        });

        // --- Page switching ---
        const switchPage = (targetId) => {
            $('.main-content').animate({ opacity: 0 }, 300, function () {
                $('.page-section').addClass('hidden');
                $('#' + targetId).removeClass('hidden');
                $('.nav-link').removeClass('active');
                $(`.nav-link[data-target="${targetId}"]`).addClass('active');
                window.scrollTo(0, 0);
                $(this).animate({ opacity: 1 }, 300);
                if (targetId === 'cart') window.renderCart();
                if (targetId === 'checkout') renderCheckout();
                document.querySelectorAll(`#${targetId} .reveal`).forEach(el => observer.observe(el));
            });
        };
        window.switchPage = switchPage;

        // Nav links with data-target → SPA section switch
        // Without data-target → external page link (let browser handle)
        $('.nav-link, .nav-link-mobile, .nav-logo').click(function (e) {
            const target = $(this).data('target');
            if (target) {
                e.preventDefault();
                switchPage(target);
                $('#mobile-menu').addClass('hidden');
            }
        });

        // Cart button on homepage
        $('#cart-button').off('click').click(function (e) {
            e.preventDefault();
            switchPage('cart');
        });

        $('#back-to-cart-btn').click(() => switchPage('cart'));

        // Handle hash redirects from sub-pages
        const hash = window.location.hash;
        if (hash === '#cart-direct') {
            setTimeout(() => switchPage('cart'), 100);
        } else if (hash === '#shop' || hash === '#about' || hash === '#contact') {
            setTimeout(() => switchPage(hash.substring(1)), 100);
        }

        // --- Phone validation ---
        $('#phone-input').on('input', function () {
            let val = $(this).val().replace(/\D/g, '');
            if (val.length > 10) val = val.slice(0, 10);
            $(this).val(val);
            if (val.length === 10) {
                $('#phone-error').addClass('hidden');
                $(this).removeClass('border-red-500');
            }
        }).on('blur', function () {
            if ($(this).val().length !== 10 && $(this).val().length > 0) {
                $('#phone-error').removeClass('hidden');
                $(this).addClass('border-red-500');
            }
        });

        // --- Location dropdowns ---
        const locationData = {
            "India": {
                "Punjab": ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot"],
                "Chandigarh": ["Chandigarh"],
                "Delhi": ["New Delhi", "North Delhi", "South Delhi", "West Delhi"],
                "Haryana": ["Gurugram", "Ambala", "Panipat", "Karnal", "Hisar"],
                "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
                "Karnataka": ["Bangalore", "Mysore", "Mangalore"]
            },
            "USA": {
                "California": ["Los Angeles", "San Francisco", "San Diego"],
                "New York": ["New York City", "Buffalo"],
                "Texas": ["Houston", "Dallas", "Austin"]
            },
            "Canada": {
                "Ontario": ["Toronto", "Ottawa", "Brampton"],
                "British Columbia": ["Vancouver", "Surrey"]
            }
        };
        const $countrySelect = $('#country-select');
        const $stateSelect = $('#state-select');
        const $citySelect = $('#city-select');
        if ($countrySelect.length) {
            $.each(locationData, c => $countrySelect.append(new Option(c, c)));
            $countrySelect.change(function () {
                $stateSelect.find('option:not(:first)').remove();
                $citySelect.find('option:not(:first)').remove();
                $citySelect.prop('disabled', true);
                if ($(this).val()) {
                    $stateSelect.prop('disabled', false);
                    $.each(locationData[$(this).val()], s => $stateSelect.append(new Option(s, s)));
                } else $stateSelect.prop('disabled', true);
            });
            $stateSelect.change(function () {
                $citySelect.find('option:not(:first)').remove();
                if ($(this).val()) {
                    $citySelect.prop('disabled', false);
                    const cities = locationData[$countrySelect.val()][$(this).val()];
                    $.each(cities, (i, c) => $citySelect.append(new Option(c, c)));
                } else $citySelect.prop('disabled', true);
            });
        }

        // --- Checkout submit ---
        $('#checkout-form').submit(function (e) {
            e.preventDefault();
            if ($('#phone-input').val().length !== 10) {
                alert("Please enter a valid 10-digit phone number.");
                $('#phone-input').focus();
                return;
            }
            showToast("Order placed successfully! Thank you.");
            cart = [];
            saveCart();
            updateCartCount();
            setTimeout(() => {
                switchPage('home');
                $('#checkout-form')[0].reset();
            }, 2500);
        });

        // --- Intersection observer for reveal animations ---
        var observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('visible');
            });
        }, { threshold: 0.1 });
        $('.reveal').each(function () { observer.observe(this); });
    }

    // ============================================================
    // SEARCH (works on homepage; on sub-pages redirects to home)
    // ============================================================
    $('#search-trigger').click(function () {
        const $overlay = $('#search-overlay');
        if (!$overlay.length) {
            window.location.href = ROOT + 'index.html';
            return;
        }
        $overlay.removeClass('hidden').addClass('animate-fadeIn');
        setTimeout(() => $('#search-input').focus(), 100);
    });

    $('#close-search').click(function () {
        $('#search-overlay').addClass('hidden');
        $('#search-input').val('');
        $('#search-results').empty();
        $('#no-results').addClass('hidden');
    });

    $(document).keydown(function (e) {
        if (e.key === 'Escape' && !$('#search-overlay').hasClass('hidden')) {
            $('#close-search').click();
        }
    });

    $('#search-input').on('input', function () {
        const term = $(this).val().toLowerCase().trim();
        const $results = $('#search-results');
        const $noResults = $('#no-results');
        $results.empty();
        if (!term) { $noResults.addClass('hidden'); return; }
        const filtered = products.filter(p => p.name.toLowerCase().includes(term));
        if (filtered.length === 0) {
            $noResults.removeClass('hidden');
        } else {
            $noResults.addClass('hidden');
            $.each(filtered, function (i, p) {
                $results.append(`
                    <a href="${ROOT}products/${p.slug}.html" class="flex items-center gap-4 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition group">
                        <img src="${p.img}" class="w-16 h-16 object-cover rounded-md" alt="${p.name}">
                        <div>
                            <h4 class="font-medium text-brand-heading group-hover:text-black transition">${p.name}</h4>
                            <p class="text-sm text-gray-500">₹${formatPrice(p.price)}</p>
                        </div>
                    </a>
                `);
            });
        }
    });

    // ============================================================
    // AUTH MODAL (homepage only — redirect to home on sub-pages)
    // ============================================================
    const $authModal = $('#auth-modal');
    const $authContainer = $('#auth-container');

    $('#profile-btn').click(function (e) {
        e.preventDefault();
        if (!$authModal.length) {
            window.location.href = ROOT + 'index.html';
            return;
        }
        $authModal.removeClass('hidden');
        setTimeout(() => {
            $authModal.removeClass('opacity-0');
            $authContainer.removeClass('scale-95').addClass('scale-100');
        }, 10);
    });

    const closeAuth = () => {
        $authModal.addClass('opacity-0');
        $authContainer.removeClass('scale-100').addClass('scale-95');
        setTimeout(() => $authModal.addClass('hidden'), 300);
    };

    $('#close-auth').click(closeAuth);
    $authModal.click(function (e) {
        if (e.target === this) closeAuth();
    });

    $('#tab-login').click(function () {
        $(this).addClass('border-black text-black font-bold').removeClass('border-transparent text-gray-400 font-medium');
        $('#tab-signup').removeClass('border-black text-black font-bold').addClass('border-transparent text-gray-400 font-medium');
        $('#login-form').removeClass('hidden');
        $('#signup-form').addClass('hidden');
    });

    $('#tab-signup').click(function () {
        $(this).addClass('border-black text-black font-bold').removeClass('border-transparent text-gray-400 font-medium');
        $('#tab-login').removeClass('border-black text-black font-bold').addClass('border-transparent text-gray-400 font-medium');
        $('#signup-form').removeClass('hidden');
        $('#login-form').addClass('hidden');
    });

    const handleAuthSubmit = (e, type) => {
        e.preventDefault();
        showToast(type === 'login' ? "Welcome back!" : "Account created successfully!");
        closeAuth();
        $('#profile-btn').html('<i class="fas fa-check-circle text-green-600"></i>').attr('title', "My Account");
    };

    $('#login-form').submit((e) => handleAuthSubmit(e, 'login'));
    $('#signup-form').submit((e) => handleAuthSubmit(e, 'signup'));

    // ============================================================
    // PRODUCT PAGE — wire up Add to Cart button
    // ============================================================
    if (isSubPage && window.location.pathname.includes('/products/')) {
        const filename = window.location.pathname.split('/').pop();
        const slug = filename.replace('.html', '');
        const currentProduct = products.find(p => p.slug === slug);

        if (currentProduct) {
            $('button').each(function () {
                const text = $(this).text().trim().toUpperCase();
                if (text === 'ADD TO CART') {
                    $(this).removeAttr('onclick');
                    $(this).off('click').on('click', function (e) {
                        e.preventDefault();
                        window.addToCart(currentProduct.id);
                    });
                }
                if (text === 'CONTINUE SHOPPING') {
                    $(this).removeAttr('onclick');
                    $(this).off('click').on('click', function (e) {
                        e.preventDefault();
                        window.location.href = ROOT + 'index.html#shop';
                    });
                }
            });
        }
    }

});