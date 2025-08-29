# CosmoGlow — Static E‑Commerce (HTML/CSS/JS only)

Features:
- Soothing, modern UI with subtle animations
- Product catalog in JS (no backend)
- Cart with localStorage (qty, remove, clear)
- Product page via `?id=lipstick` etc.
- Payment page showing UPI QR + UPI ID + Bank details
- Order form sends details via **EmailJS** (no server)

## How to run
1. Download and extract the ZIP.
2. Double‑click `index.html` to open in your browser.
3. Ensure you keep the folder structure as-is so CSS/JS load properly.

## Configure EmailJS (optional but recommended)
1. Create an account at https://www.emailjs.com/.
2. Add an Email Service (e.g., Gmail) to get **SERVICE_ID**.
3. Create a template with variables: `order_id`, `name`, `address`, `phone`, `payment_ref`, `subtotal`, `shipping`, `total`, `items_json`. Note the **TEMPLATE_ID**.
4. Go to Account -> API Keys -> copy **PUBLIC_KEY**.
5. Open `js/script.js` and replace:
   - `YOUR_SERVICE_ID`
   - `YOUR_TEMPLATE_ID`
   - `YOUR_PUBLIC_KEY`

## Replace payment details
- Edit `payment.html` -> UPI ID text and bank details.
- Replace `images/upi-qr.png` with your real QR image.

## Add products
- Edit `CATALOG` in `js/script.js` to add more items.
