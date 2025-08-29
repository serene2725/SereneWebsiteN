/* ============================
   Serene Frontend + JS "backend"
   - Product catalog in JS
   - Cart with localStorage
   - Product page via ?id=
   - EmailJS order submit (no server)
   - UI helpers + animations
============================ */

// ---------- Catalog ----------
const CATALOG = [
  {
    id: "lipstick",
    title: "Shata Dhauta Ghrita Moisturizer(25ml)",
    price: 150,
    img: "images/lipstick.jpg",
    desc: "Creamy, long-wear formula enriched with Vitamin E.",
    tag: "Best Seller",
    createdAt: "2025-08-01"
  },
  {
    id: "cream",
    title: "Shata Dhauta Ghrita Moisturizer(40ml)",
    price: 210,
    img: "images/cream.jpg",
    desc: "Hydrates and brightens with niacinamide and aloe vera.",
    tag: "New",
    createdAt: "2025-08-15"
  }
];

// ---------- State ----------
const CART_KEY = "cosmoglow_cart_v1";
const cart = {
  items: JSON.parse(localStorage.getItem(CART_KEY) || "[]"),
  save(){ localStorage.setItem(CART_KEY, JSON.stringify(this.items)) },
  add(id, qty=1){
    const existing = this.items.find(i => i.id === id);
    if (existing) existing.qty += qty;
    else this.items.push({ id, qty });
    this.save(); updateNavCartCount(); toast("Added to cart");
  },
  setQty(id, qty){
    if(qty <= 0){ this.remove(id); return }
    const it = this.items.find(i => i.id === id);
    if (it){ it.qty = qty; this.save(); }
  },
  remove(id){
    this.items = this.items.filter(i => i.id !== id);
    this.save(); updateNavCartCount(); toast("Removed from cart");
  },
  clear(){ this.items = []; this.save(); updateNavCartCount(); }
};

function updateNavCartCount(){
  const el = document.getElementById("nav-cart-count");
  if(!el) return;
  const count = cart.items.reduce((n,i)=>n+i.qty,0);
  el.textContent = count;
}

// ---------- Helpers ----------
function rupees(x){ return Number(x).toLocaleString("en-IN") }

// 👉 New helper for price display with delivery note
function displayPrice(x){
  return "₹ " + rupees(x) + " + Delivery charges extra";
}

function $(q, root=document){ return root.querySelector(q) }
function h(tag, cls, html){
  const el = document.createElement(tag);
  if(cls) el.className = cls;
  if(html!==undefined) el.innerHTML = html;
  return el;
}
function toast(msg){
  const t = $("#toast"); if(!t) return;
  t.textContent = msg; t.classList.add("show");
  setTimeout(()=> t.classList.remove("show"), 1800);
}

// Reveal on scroll
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting) e.target.classList.add("in");
  });
},{threshold:.15});
document.querySelectorAll("[data-animate]").forEach(el => io.observe(el));

// ---------- Home: render a few products ----------
(function initHome(){
  const wrap = document.getElementById("home-products");
  if(!wrap) return;
  CATALOG.slice(0,4).forEach(p => wrap.appendChild(productCard(p)));
})();

// ---------- Shop: search/sort + render ----------
(function initShop(){
  const wrap = document.getElementById("shop-products");
  if(!wrap) return;

  const input = document.getElementById("search");
  const sortSel = document.getElementById("sort");

  function render(){
    let list = [...CATALOG];
    const q = (input.value||"").toLowerCase().trim();
    if(q) list = list.filter(p => p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));

    switch(sortSel.value){
      case "price-asc": list.sort((a,b)=>a.price-b.price); break;
      case "price-desc": list.sort((a,b)=>b.price-a.price); break;
      case "new": list.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)); break;
    }

    wrap.innerHTML = "";
    list.forEach(p => wrap.appendChild(productCard(p)));
  }

  input.addEventListener("input", render);
  sortSel.addEventListener("change", render);
  render();
})();

// ---------- Product: render by ?id= ----------
(function initProduct(){
  const wrap = document.getElementById("product-detail");
  if(!wrap) return;
  const params = new URLSearchParams(location.search);
  const id = params.get("id") || "lipstick";
  const p = CATALOG.find(x=>x.id===id) || CATALOG[0];

  const left = h("div","image");
  left.appendChild(Object.assign(h("img"), {src:p.img, alt:p.title}));

  const right = h("div","content");
  right.appendChild(h("h1", null, p.title));
  right.appendChild(h("div","badge", p.tag || "Popular"));
  right.appendChild(h("p","muted", p.desc));
  // 👉 Updated price display
  right.appendChild(h("p","price", displayPrice(p.price)));

  const qtyBox = h("div","qty");
  const minus = h("button",null,"−");
  const qtyEl = h("span",null,"1");
  const plus = h("button",null,"+");
  minus.addEventListener("click", ()=> { let q=Number(qtyEl.textContent); if(q>1) qtyEl.textContent = String(q-1) });
  plus.addEventListener("click", ()=> { let q=Number(qtyEl.textContent); qtyEl.textContent = String(q+1) });
  qtyBox.append(minus, qtyEl, plus);

  const addBtn = h("button","btn btn-primary","Add to Cart");
  addBtn.addEventListener("click", ()=> cart.add(p.id, Number(qtyEl.textContent)));

  right.append(qtyBox, addBtn);

  wrap.append(left, right);
})();

// ---------- Cart: render, totals, actions ----------
(function initCart(){
  const list = document.getElementById("cart-list");
  if(!list) return;

  const empty = document.getElementById("cart-empty");
  const summary = document.getElementById("cart-summary");
  const subtotalEl = document.getElementById("subtotal");
  const shippingEl = document.getElementById("shipping");
  const totalEl = document.getElementById("total");
  const clearBtn = document.getElementById("clear-cart");

  function render(){
    list.innerHTML = "";
    if(cart.items.length === 0){
      empty.classList.remove("hidden");
      summary.classList.add("hidden");
      return;
    }
    empty.classList.add("hidden");
    summary.classList.remove("hidden");

    cart.items.forEach(ci => {
      const p = CATALOG.find(x=>x.id===ci.id);
      if(!p) return;

      const row = h("div","cart-item");
      const img = Object.assign(h("img"), {src:p.img, alt:p.title});
      const mid = h("div");
      const title = h("div","title", p.title);
      // 👉 Updated price display with delivery note
      const sub = h("div","sub", displayPrice(p.price) + " × ");
      const qty = h("input");
      qty.type = "number"; qty.min = "1"; qty.value = String(ci.qty);
      qty.addEventListener("input", ()=> {
        const v = Math.max(1, Math.floor(Number(qty.value)||1));
        qty.value = String(v);
        cart.setQty(ci.id, v);
        updateTotals();
      });
      sub.appendChild(qty);
      mid.append(title, sub);

      const right = h("div","right");
      // 👉 Updated line item total display
      right.appendChild(h("div","price", displayPrice(p.price * ci.qty)));
      const rm = h("button","btn btn-ghost","Remove");
      rm.addEventListener("click", ()=> { cart.remove(ci.id); render(); updateTotals(); });
      right.appendChild(rm);

      row.append(img, mid, right);
      list.appendChild(row);
    });

    function updateTotals(){
      let st = 0;
      cart.items.forEach(ci => {
        const pr = CATALOG.find(x=>x.id===ci.id);
        if(pr) st += pr.price * ci.qty;
      });
      const shipping = st > 999 ? 0 : 100;
      subtotalEl.textContent = rupees(st);
      shippingEl.textContent = rupees(shipping);
      totalEl.textContent = rupees(st + shipping);
    }

    updateTotals();
  }

  clearBtn?.addEventListener("click", ()=>{ cart.clear(); render(); });
  render();
})();

// ---------- Payment: copy UPI + EmailJS submit ----------
(function initPayment(){
  const copyBtn = document.getElementById("copy-upi");
  if(copyBtn){
    copyBtn.addEventListener("click", async ()=>{
      const upi = document.getElementById("upi-id").textContent.trim();
      try { await navigator.clipboard.writeText(upi); toast("UPI ID copied"); }
      catch { toast("Copy failed"); }
    });
  }

  const form = document.getElementById("order-form");
  if(!form) return;

  // ===== EmailJS Setup =====
  const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
  const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
  const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

  if(window.emailjs && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY"){
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  form.addEventListener("submit", async (e)=>{
    e.preventDefault();
    const name = $("#name").value.trim();
    const address = $("#address").value.trim();
    const phone = $("#phone").value.trim();
    const paymentRef = $("#paymentRef").value.trim();
    const paid = $("#paid").checked;

    if(!name || !address || !phone || !paymentRef || !paid){
      toast("Please fill all fields and confirm payment");
      return;
    }

    if(cart.items.length === 0){
      toast("Cart is empty");
      return;
    }

    const orderItems = cart.items.map(ci => {
      const p = CATALOG.find(x=>x.id===ci.id);
      return { id: ci.id, title: p?.title, qty: ci.qty, unitPrice: p?.price, total: (p?.price||0)*ci.qty };
    });
    const subtotal = orderItems.reduce((s,i)=>s + i.total, 0);
    const shipping = subtotal > 999 ? 0 : 49;
    const grand = subtotal + shipping;
    const orderId = "CG" + Math.floor(Math.random()*1e8).toString().padStart(8,"0");

    const templateParams = {
      order_id: orderId,
      name, address, phone, payment_ref: paymentRef,
      subtotal: "₹ "+rupees(subtotal),
      shipping: "₹ "+rupees(shipping),
      total: "₹ "+rupees(grand),
      items_json: JSON.stringify(orderItems, null, 2)
    };

    try{
      if(!window.emailjs || EMAILJS_PUBLIC_KEY === "YOUR_PUBLIC_KEY"){
        console.log("[DEV] EmailJS not configured. Order payload:", templateParams);
        toast("Order simulated (configure EmailJS to actually email)");
      }else{
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        toast("Order submitted! Check your email.");
      }
      cart.clear();
      setTimeout(()=> location.href = "index.html", 1200);
    }catch(err){
      console.error(err);
      toast("Failed to submit order. Try again.");
    }
  });
})();

// On every page load
updateNavCartCount();

// ---------- UI: product card ----------
function productCard(p){
  const card = h("div","card");
  const img = Object.assign(h("img","thumb"), {src:p.img, alt:p.title});
  const title = h("h3",null,p.title);
  // 👉 Updated card price display
  const price = h("div","price", displayPrice(p.price));
  const row = h("div","row");
  const view = h("a","btn btn-ghost","View");
  view.href = `product.html?id=${encodeURIComponent(p.id)}`;
  const addBtn = h("button","btn btn-primary","Add");
  addBtn.addEventListener("click", ()=> cart.add(p.id, 1));
  row.append(view, addBtn);
  card.append(img, title, price, row);
  return card;
}
