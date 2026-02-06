const menuData = [
    {
        category: "populares",
        items: [
            { id: "pop-1", name: "Milanesa completa", desc: "Con papas, huevo y ensalada.", price: 7800, img: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=300&q=80" },
            { id: "pop-2", name: "Parrillada para 2", desc: "Asado, chorizo, morcilla y papas.", price: 15800, img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=300&q=80" },
            { id: "pop-3", name: "Lomo especial", desc: "Pan brioche, queso, huevo y jamón.", price: 6900, img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80" }
        ]
    },
    {
        category: "parrilla",
        items: [
            { id: "par-1", name: "Asado de tira", desc: "Corte clásico, jugoso.", price: 9800, img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=300&q=80" },
            { id: "par-2", name: "Vacío a la parrilla", desc: "Con papas rústicas.", price: 10400, img: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80" },
            { id: "par-3", name: "Chori criollo", desc: "Con salsa criolla y papas.", price: 5200, img: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=300&q=80" }
        ]
    },
    {
        category: "minutas",
        items: [
            { id: "min-1", name: "Milanesa napolitana", desc: "Jamón, queso y salsa.", price: 8200, img: "https://images.unsplash.com/photo-1604908811547-2e6f6f7f1db9?auto=format&fit=crop&w=300&q=80" },
            { id: "min-2", name: "Suprema con puré", desc: "Pollo y puré cremoso.", price: 7600, img: "https://images.unsplash.com/photo-1604908554160-41f3b8ac5b09?auto=format&fit=crop&w=300&q=80" },
            { id: "min-3", name: "Tortilla española", desc: "Clásica con papas.", price: 5400, img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=300&q=80" }
        ]
    },
    {
        category: "sandwiches",
        items: [
            { id: "san-1", name: "Hamburguesa doble", desc: "Queso cheddar, bacon y salsa.", price: 7300, img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80" },
            { id: "san-2", name: "Sándwich de bondiola", desc: "Pan artesanal y criolla.", price: 6900, img: "https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=300&q=80" },
            { id: "san-3", name: "Vegetariano grill", desc: "Queso, vegetales y rúcula.", price: 6100, img: "https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=300&q=80" }
        ]
    },
    {
        category: "bebidas",
        items: [
            { id: "beb-1", name: "Gaseosa 500ml", desc: "Coca-Cola, Sprite o Fanta.", price: 1800, img: "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=300&q=80" },
            { id: "beb-2", name: "Agua saborizada", desc: "Lima limón o pomelo.", price: 1600, img: "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=300&q=80" },
            { id: "beb-3", name: "Cerveza lata", desc: "Rubia 473ml.", price: 2400, img: "https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=300&q=80" }
        ]
    }
];

const cart = new Map();
const deliveryCost = 1500;
const freeDeliveryFrom = 25000;

const formatCurrency = (value) => `$ ${Number(value).toLocaleString("es-AR")}`;

const renderMenu = () => {
    menuData.forEach((section) => {
        const container = document.querySelector(`[data-category="${section.category}"]`);
        if (!container) return;
        container.innerHTML = section.items.map((item) => `
            <article class="item-card">
                <img src="${item.img}" alt="${item.name}">
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>${item.desc}</p>
                    <div class="item-price">${formatCurrency(item.price)}</div>
                </div>
                <div class="item-actions">
                    <button class="add-btn" data-id="${item.id}">Agregar</button>
                    <div class="qty" id="qty-${item.id}">0</div>
                </div>
            </article>
        `).join("");
    });
};

const updateSummary = () => {
    const cartItems = document.getElementById("cart-items");
    if (cart.size === 0) {
        cartItems.innerHTML = `<div class="summary-empty">Todavía no agregaste productos.</div>`;
    } else {
        cartItems.innerHTML = "";
        cart.forEach((item) => {
            const row = document.createElement("div");
            row.className = "summary-item";
            row.innerHTML = `<span>${item.qty}x ${item.name}</span><strong>${formatCurrency(item.qty * item.price)}</strong>`;
            cartItems.appendChild(row);
        });
    }

    const subtotal = Array.from(cart.values()).reduce((acc, item) => acc + item.qty * item.price, 0);
    const delivery = subtotal > 0 && subtotal < freeDeliveryFrom ? deliveryCost : 0;
    const total = subtotal + delivery;

    document.getElementById("subtotal").textContent = formatCurrency(subtotal);
    document.getElementById("delivery").textContent = subtotal === 0 ? "$ 0" : (delivery === 0 ? "¡Gratis!" : formatCurrency(delivery));
    document.getElementById("total").textContent = formatCurrency(total);
};

const handleAdd = (id) => {
    const item = menuData.flatMap(section => section.items).find((i) => i.id === id);
    if (!item) return;
    const current = cart.get(id) || { ...item, qty: 0 };
    current.qty += 1;
    cart.set(id, current);
    document.getElementById(`qty-${id}`).textContent = current.qty;
    updateSummary();
};

const initTabs = () => {
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            const target = document.getElementById(tab.dataset.target);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    const sections = Array.from(document.querySelectorAll(".menu-section"));
    const onScroll = () => {
        const top = window.scrollY + 140;
        let activeId = sections[0]?.id;
        sections.forEach((section) => {
            if (section.offsetTop <= top) activeId = section.id;
        });
        tabs.forEach((tab) => {
            tab.classList.toggle("active", tab.dataset.target === activeId);
        });
    };
    window.addEventListener("scroll", () => requestAnimationFrame(onScroll));
    onScroll();
};

const initSearch = () => {
    const search = document.getElementById("search");
    if (!search) return;
    search.addEventListener("input", (event) => {
        const query = event.target.value.toLowerCase();
        document.querySelectorAll(".item-card").forEach((card) => {
            const text = card.textContent.toLowerCase();
            card.style.display = text.includes(query) ? "grid" : "none";
        });
    });
};

const initActions = () => {
    document.addEventListener("click", (event) => {
        const target = event.target.closest(".add-btn");
        if (target) handleAdd(target.dataset.id);
    });

    const confirmBtn = document.getElementById("confirm-btn");
    confirmBtn?.addEventListener("click", () => {
        window.location.href = "confirmacion.html";
    });
};

renderMenu();
updateSummary();
initTabs();
initSearch();
initActions();
