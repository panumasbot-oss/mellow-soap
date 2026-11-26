const PRODUCTS = [
  { sku: "SOAP001", name: "Honey Soap", thai: "สบู่น้ำผึ้ง", price: 89, stock: 50, theme: "honey", image: "images/honey-soap.png", description: "สบู่สูตรน้ำผึ้ง สำหรับช่วงเวลาแห่งการดูแลผิว" },
  { sku: "SOAP002", name: "Aloe Vera Soap", thai: "สบู่ว่านหางจระเข้", price: 79, stock: 50, theme: "green", image: "images/aloe-vera-soap.png", description: "สบู่ว่านหางจระเข้ ให้ความรู้สึกสดชื่นในทุกวัน" }
];

// ใส่ Web App URL ของ Google Apps Script ที่ลงท้ายด้วย /exec ในขั้นตอนเชื่อมระบบ
const GOOGLE_APPS_SCRIPT_URL = "";

let cart = JSON.parse(localStorage.getItem("mellowCart") || "{}");
const $ = (id) => document.getElementById(id);
const money = (n) => "฿" + Number(n).toLocaleString("th-TH");

function saveCart() { localStorage.setItem("mellowCart", JSON.stringify(cart)); }
function cartQuantity() { return Object.values(cart).reduce((a, b) => a + b, 0); }
function cartTotal() { return PRODUCTS.reduce((sum, p) => sum + p.price * (cart[p.sku] || 0), 0); }

function renderProducts() {
  $("productGrid").innerHTML = PRODUCTS.map(p => `
    <article class="product-card">
      <div class="product-visual ${p.theme}">
        <img class="product-photo" src="${p.image}" alt="${p.thai} MELLOW SOAP">
      </div>
      <div class="product-info"><div><h3>${p.thai}</h3><p>${p.name} · ${p.sku}</p></div><span class="price">${money(p.price)}</span></div>
      <p class="product-description">${p.description}</p>
      <button class="add-button" data-add="${p.sku}">เพิ่มลงตะกร้า</button>
    </article>`).join("");
  document.querySelectorAll("[data-add]").forEach(btn => btn.addEventListener("click", () => addToCart(btn.dataset.add)));
}

function addToCart(sku) {
  const p = PRODUCTS.find(x => x.sku === sku);
  if ((cart[sku] || 0) >= p.stock) return alert("สินค้าในสต็อกไม่เพียงพอ");
  cart[sku] = (cart[sku] || 0) + 1; saveCart(); renderCart(); openCart();
}
function changeQty(sku, delta) {
  const next = (cart[sku] || 0) + delta;
  if (next <= 0) delete cart[sku];
  else if (next <= PRODUCTS.find(p => p.sku === sku).stock) cart[sku] = next;
  else return alert("สินค้าในสต็อกไม่เพียงพอ");
  saveCart(); renderCart();
}
function renderCart() {
  $("cartCount").textContent = cartQuantity();
  $("cartTotal").textContent = money(cartTotal());
  const items = PRODUCTS.filter(p => cart[p.sku]);
  $("cartItems").innerHTML = items.length ? items.map(p => `
    <div class="cart-line"><div><strong>${p.thai}</strong><small>${p.sku} · ${money(p.price)} / ชิ้น</small>
      <div class="qty-controls"><button data-minus="${p.sku}">−</button><span>${cart[p.sku]}</span><button data-plus="${p.sku}">+</button></div>
    </div><strong>${money(p.price * cart[p.sku])}</strong></div>`).join("") : '<p class="empty-cart">ยังไม่มีสินค้าในตะกร้า</p>';
  document.querySelectorAll("[data-minus]").forEach(b => b.addEventListener("click", () => changeQty(b.dataset.minus, -1)));
  document.querySelectorAll("[data-plus]").forEach(b => b.addEventListener("click", () => changeQty(b.dataset.plus, 1)));
  $("checkoutButton").disabled = !items.length;
  $("checkoutButton").style.opacity = items.length ? "1" : ".5";
}
function openCart() { $("cartDrawer").classList.add("open"); $("backdrop").classList.add("show"); }
function closeCart() { $("cartDrawer").classList.remove("open"); $("backdrop").classList.remove("show"); }

$("openCart").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
$("backdrop").addEventListener("click", closeCart);
$("checkoutButton").addEventListener("click", () => {
  if (!cartQuantity()) return;
  closeCart(); $("checkoutDialog").showModal();
});
$("closeCheckout").addEventListener("click", () => $("checkoutDialog").close());

$("checkoutForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!cartQuantity()) return;
  const form = new FormData(event.currentTarget);
  const customer = Object.fromEntries(form.entries());
  const items = PRODUCTS.filter(p => cart[p.sku]).map(p => ({ sku: p.sku, quantity: cart[p.sku] }));
  const order = { customer, items, source: "MELLOW_SOAP_WEBSITE" };
  const message = $("checkoutMessage");
  const submit = event.currentTarget.querySelector('button[type="submit"]');
  submit.disabled = true; submit.textContent = "กำลังบันทึก...";
  try {
    let result;
    if (GOOGLE_APPS_SCRIPT_URL) {
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(order)
      });
      result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "ไม่สามารถบันทึกคำสั่งซื้อได้");
    } else {
      const orderId = "MS" + Date.now().toString().slice(-9);
      const demoOrder = { ...order, orderId, total: cartTotal(), createdAt: new Date().toISOString(), status: "PENDING" };
      const orders = JSON.parse(localStorage.getItem("mellowDemoOrders") || "[]");
      orders.push(demoOrder); localStorage.setItem("mellowDemoOrders", JSON.stringify(orders));
      result = { success: true, orderId, demo: true };
    }
    message.textContent = `สั่งซื้อสำเร็จ เลขที่คำสั่งซื้อ ${result.orderId || ""}` + (result.demo ? " (โหมดตัวอย่าง: ยังไม่ได้บันทึกลง Google Sheets)" : "");
    cart = {}; saveCart(); renderCart(); event.currentTarget.reset();
    setTimeout(() => { $("checkoutDialog").close(); message.textContent = ""; }, 4500);
  } catch (error) {
    message.textContent = "เกิดข้อผิดพลาด: " + error.message;
  } finally {
    submit.disabled = false; submit.textContent = "ยืนยันคำสั่งซื้อ";
  }
});

renderProducts(); renderCart();
