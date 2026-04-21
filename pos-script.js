const API_URL = 'http://localhost:5000/api';
let cart = {};

const localProducts = {
  '101': { code: '101', name: 'Milk', price: 30 },
  '102': { code: '102', name: 'Bread', price: 40 },
  '103': { code: '103', name: 'Rice', price: 60 },
  '104': { code: '104', name: 'Oil', price: 120 },
  '105': { code: '105', name: 'Sugar', price: 45 },
  '106': { code: '106', name: 'Salt', price: 20 },
  '107': { code: '107', name: 'Tea', price: 250 },
  '108': { code: '108', name: 'Coffee', price: 300 }
};

let html5QrCode = null;
let scannerActive = false;
let currentCameraId = null;

function showMessage(msg, type='info'){
  const el = document.getElementById('message');
  el.textContent = msg;
  el.className = 'message ' + type;
  setTimeout(()=>{ el.textContent=''; el.className='message'; }, 4000);
}

async function addProduct(){
  const barcodeInput = document.getElementById('barcode');
  const code = barcodeInput.value.trim().toUpperCase();
  if(!code){ showMessage('Enter code','error'); return; }
  await addProductByCode(code);
  barcodeInput.value=''; barcodeInput.focus();
}

async function addProductByCode(code){
  code = code.trim().toUpperCase(); if(!code) return;
  // try server
  const controller = new AbortController();
  const to = setTimeout(()=>controller.abort(),3000);
  try{
    const res = await fetch(`${API_URL}/product/${code}`, { signal: controller.signal });
    clearTimeout(to);
    if(res.ok){ const p = await res.json(); addToCartObject(code,p); showMessage(`${p.name} added`,'success'); return; }
  }catch(e){}
  // fallback
  if(localProducts[code]){ addToCartObject(code, localProducts[code]); showMessage(`${localProducts[code].name} added (offline)`,'success'); return; }
  showMessage('Product not found','error');
}

function addToCartObject(code, product){ if(cart[code]) cart[code].quantity +=1; else cart[code] = {...product, quantity:1}; updateCart(); saveCart(); }

function updateQuantity(code, quantity){ quantity = Math.max(1, parseInt(quantity)||1); if(cart[code]){ cart[code].quantity = quantity; updateCart(); saveCart(); } }
function removeProduct(code){ if(cart[code]){ delete cart[code]; updateCart(); saveCart(); showMessage('Item removed','info'); } }
function clearCart(){ cart={}; updateCart(); saveCart(); showMessage('Cart cleared','info'); }

function updateCart(){ const cartTable = document.getElementById('cart'); cartTable.innerHTML=''; let total=0; const items = Object.entries(cart); if(items.length===0){ cartTable.innerHTML='<tr><td colspan="6" style="text-align:center;padding:20px">Cart is empty</td></tr>'; document.getElementById('total').innerText='0'; return; } items.forEach(([code,item])=>{ const subtotal = item.price*item.quantity; total+=subtotal; const img = item.image || `https://via.placeholder.com/48?text=${encodeURIComponent(item.code)}`; cartTable.innerHTML += `\n  <tr>\n    <td><img src="${img}" class="prod-thumb" alt="${item.name}"></td>\n    <td>${item.name}</td>\n    <td>₹${item.price}</td>\n    <td><input type=number value="${item.quantity}" min=1 onchange="updateQuantity('${code}', this.value)" class="qty-input"></td>\n    <td>₹${subtotal}</td>\n    <td><button onclick="removeProduct('${code}')" class="remove-btn">Remove</button></td>\n  </tr>`; }); document.getElementById('total').innerText = total; }

function saveCart(){ try{ localStorage.setItem('smartbilling_cart', JSON.stringify(cart)); }catch(e){} }
function loadCart(){ try{ const raw = localStorage.getItem('smartbilling_cart'); if(raw) cart = JSON.parse(raw); }catch(e){ cart={}; } }

function saveSale(sale){ try{ const raw = localStorage.getItem('smartbilling_sales')||'[]'; const arr = JSON.parse(raw); arr.unshift(sale); localStorage.setItem('smartbilling_sales', JSON.stringify(arr.slice(0,200))); }catch(e){} }
function getSales(){ try{ return JSON.parse(localStorage.getItem('smartbilling_sales')||'[]'); }catch(e){ return []; } }

async function fetchProducts(){ try{ const res = await fetch(`${API_URL}/products`); if(!res.ok) throw new Error('no server'); const products = await res.json(); const list = document.getElementById('product-list'); list.innerHTML=''; products.forEach(p=>{ const opt = document.createElement('option'); opt.value = p.code; opt.textContent = `${p.code} - ${p.name}`; list.appendChild(opt); localProducts[p.code.toUpperCase()] = { code: p.code.toUpperCase(), name: p.name, price: p.price, image: p.image||p.img }; }); }catch(e){ const list = document.getElementById('product-list'); list.innerHTML=''; Object.values(localProducts).forEach(p=>{ const opt = document.createElement('option'); opt.value = p.code; opt.textContent = `${p.code} - ${p.name}`; list.appendChild(opt); }); } }

// scanner
async function startScanner(){ if(scannerActive) return; const scannerEl = document.getElementById('scanner'); scannerEl.setAttribute('aria-hidden','false'); scannerEl.style.display='flex'; html5QrCode = new Html5Qrcode('scanner-renderer'); try{ const devices = await Html5Qrcode.getCameras(); const select = document.getElementById('camera-select'); select.innerHTML=''; devices.forEach(d=>{ const opt = document.createElement('option'); opt.value = d.id; opt.textContent = d.label||d.id; select.appendChild(opt); }); let preferred = devices.find(d=>/back|rear|environment/i.test(d.label)); if(!preferred && devices.length) preferred = devices[0]; if(!preferred) throw new Error('No camera'); currentCameraId = preferred.id; select.value = currentCameraId; await html5QrCode.start(currentCameraId, { fps:10, qrbox:250 }, decodedText=>{ stopScanner(); addProductByCode(decodedText); }, errorMessage=>{} ); scannerActive = true; }catch(err){ scannerEl.style.display='none'; showMessage('Unable to start scanner','error'); console.error(err); } }

function stopScanner(){ const scannerEl = document.getElementById('scanner'); if(html5QrCode && scannerActive){ html5QrCode.stop().then(()=>{ html5QrCode.clear(); html5QrCode = null; }).catch(()=>{ html5QrCode = null; }); } scannerEl.style.display='none'; scannerEl.setAttribute('aria-hidden','true'); scannerActive=false; }
function toggleScanner(){ if(scannerActive) stopScanner(); else startScanner(); }
function switchCamera(deviceId){ if(!html5QrCode) return; if(!deviceId) return; currentCameraId = deviceId; html5QrCode.stop().then(()=>{ html5QrCode.start(currentCameraId, { fps:10, qrbox:250 }, decodedText=>{ stopScanner(); addProductByCode(decodedText); }, ()=>{}); }).catch(()=>{}); }

function printReceipt(){ const win = window.open('','_blank'); if(!win){ showMessage('Pop-up blocked','error'); return; } const items = Object.values(cart); let html = `<html><head><title>Receipt</title><style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}td,th{padding:6px;border-bottom:1px solid #ccc;text-align:left}</style></head><body>`; html += `<h2>Smart Billing Receipt</h2><p>${new Date().toLocaleString()}</p>`; html += `<table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr></thead><tbody>`; let total=0; items.forEach(i=>{ total += i.price*i.quantity; html += `<tr><td>${i.name}</td><td>${i.quantity}</td><td>₹${i.price}</td><td>₹${i.price*i.quantity}</td></tr>`; }); html += `</tbody></table><h3>Total: ₹${total}</h3>`; html += `</body></html>`; win.document.write(html); win.document.close(); win.print(); }

function exportPdf(){ if(!window.jspdf || !window.jspdf.jsPDF){ showMessage('PDF library not loaded','error'); return; } const { jsPDF } = window.jspdf; const doc = new jsPDF(); const items = Object.values(cart); let y = 10; doc.setFontSize(14); doc.text('Smart Billing Receipt', 10, y); y+=8; doc.setFontSize(11); items.forEach(i=>{ doc.text(`${i.name} x${i.quantity} - ₹${i.price*i.quantity}`, 10, y); y+=6; }); y+=6; const total = items.reduce((s,it)=>s+it.price*it.quantity,0); doc.text(`Total: ₹${total}`, 10, y); doc.save(`receipt_${Date.now()}.pdf`); }

async function checkout(){ const cartItems = Object.values(cart); if(cartItems.length===0){ showMessage('Cart is empty','error'); return; }
  // get location
  let loc = null;
  try{
    loc = await new Promise((resolve, reject)=>{
      const t = setTimeout(()=>reject(new Error('timeout')),4000);
      navigator.geolocation.getCurrentPosition(pos=>{ clearTimeout(t); resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }); }, err=>{ clearTimeout(t); reject(err); }, { enableHighAccuracy:true, timeout:3000 });
    });
  }catch(e){ loc = null; }

  try{
    const response = await fetch(`${API_URL}/checkout`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ items: cartItems }) });
    if(!response.ok) throw new Error('Checkout failed');
    const result = await response.json();
    showMessage(`✓ Payment successful! Total: ₹${result.total}`,'success');
    saveSale({ items: cartItems, total: result.total, timestamp: new Date().toISOString(), location: loc });
    cart={}; saveCart(); updateCart();
  }catch(error){ const total = cartItems.reduce((s,i)=>s+i.price*i.quantity,0); saveSale({ items: cartItems, total, timestamp: new Date().toISOString(), location: loc, offline:true }); showMessage(`✓ Offline payment recorded. Total: ₹${total}`,'success'); cart={}; saveCart(); updateCart(); }
}

function showHistory(){ const sales = getSales(); const win = window.open('','_blank'); if(!win){ showMessage('Pop-up blocked','error'); return; } let html = `<html><head><title>Sales History</title><style>body{font-family:Arial;padding:20px}table{width:100%;border-collapse:collapse}td,th{padding:6px;border-bottom:1px solid #ccc;text-align:left}</style></head><body>`; html += `<h2>Sales History (${sales.length})</h2>`; html += `<table><thead><tr><th>When</th><th>Items</th><th>Total</th><th>Location</th></tr></thead><tbody>`; sales.forEach(s=>{ const t = new Date(s.timestamp).toLocaleString(); const items = s.items.map(i=>`${i.name} x${i.quantity}`).join('<br>'); const loc = s.location ? `${s.location.lat.toFixed(5)}, ${s.location.lon.toFixed(5)}` : '-'; html += `<tr><td>${t}</td><td>${items}</td><td>₹${s.total}</td><td>${loc}</td></tr>`; }); html += `</tbody></table></body></html>`; win.document.write(html); win.document.close(); }

function sendEReceiptPrompt(){ const email = prompt('Customer email for e-receipt:'); if(!email) return; sendEReceipt(email); }

async function sendEReceipt(email){ if(!email) return; if(!window.jspdf || !window.jspdf.jsPDF){ showMessage('PDF library not loaded','error'); return; } const { jsPDF } = window.jspdf; const doc = new jsPDF(); const items = Object.values(cart); let y=10; doc.setFontSize(14); doc.text('Smart Billing Receipt',10,y); y+=8; doc.setFontSize(11); items.forEach(i=>{ doc.text(`${i.name} x${i.quantity} - ₹${i.price*i.quantity}`,10,y); y+=6; }); y+=6; const total = items.reduce((s,it)=>s+it.price*it.quantity,0); doc.text(`Total: ₹${total}`,10,y); const pdfBase64 = doc.output('datauristring').split(',')[1]; // base64

  try{
    const res = await fetch(`${API_URL}/send-receipt`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ email, fileName:`receipt_${Date.now()}.pdf`, pdfBase64, sale:{ items, total, timestamp:new Date().toISOString() } }) });
    const data = await res.json();
    if(res.ok){ showMessage('E-Receipt sent','success'); if(data.previewUrl) console.log('Preview URL:', data.previewUrl); }
    else showMessage('Failed to send e-receipt','error');
  }catch(e){ showMessage('Unable to send e-receipt','error'); console.error(e); }
}

// init
document.addEventListener('DOMContentLoaded', ()=>{ loadCart(); updateCart(); fetchProducts(); document.getElementById('barcode').focus(); });
