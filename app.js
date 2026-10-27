const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
$("#year").textContent = new Date().getFullYear();

const nav = $("#nav");
$("#menuToggle").addEventListener("click", () => nav.classList.toggle("open"));
$$('#nav a').forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

$("#toolSearch").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  let count = 0;
  $$(".tool-card").forEach(card => {
    const show = (card.dataset.search + " " + card.innerText).toLowerCase().includes(q);
    card.hidden = !show;
    if (show) count++;
  });
  $("#noResults").hidden = count !== 0;
});

const modalBackdrop = $("#modalBackdrop");
const modalContent = $("#modalContent");
const modalTitle = $("#modalTitle");
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function openModal(type) {
  const views = {
    links: ["دليل فحص الروابط", `<p>قبل فتح أي رابط:</p><ul><li>راجع اسم النطاق حرفاً بحرف ولا تعتمد على شكل الصفحة فقط.</li><li>انتبه للروابط المختصرة ورسائل الاستعجال أو الجوائز الوهمية.</li><li>لا تدخل كلمة مرور أو رمز تحقق بعد الضغط على رابط غير متوقع.</li><li>يمكنك البحث عن النطاق في خدمة سمعة موثوقة، لكن النتيجة ليست ضماناً كاملاً.</li></ul><p class="hint">لا ترفع روابط خاصة أو تحتوي رموز تسجيل دخول إلى مواقع فحص عامة.</p>`],
    password: ["مولّد كلمات مرور", `<p>تُنشأ كلمة المرور محلياً داخل متصفحك ولا تُرسل إلى الخادم.</p><label>الطول</label><input id="pwLength" type="number" min="12" max="64" value="20"><div class="inline-actions"><button id="pwGenerate">توليد كلمة مرور</button><button id="pwCopy">نسخ</button></div><div class="result-box" id="pwResult">اضغط على توليد.</div>`],
    domain: ["معلومات الدومين", `<p>اكتب اسم نطاق فقط، مثل example.com، ثم افتح مصادر عامة للبحث عنه.</p><label>اسم النطاق</label><input id="domainInput" placeholder="example.com" autocomplete="off"><div class="inline-actions"><button id="domainWhois">فتح بحث WHOIS</button><button id="domainDns">فتح بحث DNS</button></div><p class="hint">هذه الروابط تفتح مواقع خارجية ولا تعني أن المنصة أجرت فحصاً مباشراً.</p>`],
    headers: ["رؤوس الحماية", `<p><b>Content-Security-Policy</b>: تساعد على تقييد مصادر المحتوى التي يمكن للمتصفح تحميلها.</p><p><b>Strict-Transport-Security</b>: يطلب من المتصفح استخدام HTTPS للنطاق وفق السياسة المحددة.</p><p><b>X-Content-Type-Options: nosniff</b>: يقلل تخمين نوع المحتوى من قبل المتصفح.</p><p><b>Referrer-Policy</b>: تتحكم بكمية معلومات الإحالة التي يرسلها المتصفح.</p><p><b>Permissions-Policy</b>: تساعد على ضبط استخدام بعض ميزات المتصفح.</p><p class="hint">اختيار الإعدادات الصحيحة يعتمد على تطبيقك؛ اختبرها قبل تطبيقها على موقع إنتاجي.</p>`],
    hash: ["أداة SHA-256", `<p>أنشئ بصمة SHA-256 لنص داخل متصفحك. التجزئة ليست تشفيراً ولا يمكن استخدامها لاسترجاع النص الأصلي.</p><label>النص</label><textarea id="hashInput" rows="3" placeholder="اكتب نصاً تجريبياً غير حساس"></textarea><div class="inline-actions"><button id="hashGenerate">إنشاء البصمة</button><button id="hashCopy">نسخ</button></div><div class="result-box" id="hashResult">ستظهر البصمة هنا.</div><p class="hint">لا تستخدم كلمات المرور الحقيقية في التجارب.</p>`],
    qr: ["إنشاء رمز QR", `<p>أدخل نصاً أو رابطاً لإنشاء رمز QR. لا تضمّن معلومات سرية.</p><label>النص أو الرابط</label><input id="qrInput" placeholder="https://example.com"><div class="inline-actions"><button id="qrGenerate">إنشاء الرمز</button></div><div id="qrResult" class="result-box">سيظهر الرمز هنا.</div><p class="hint">يتطلب تحميل مكتبة QR من الإنترنت.</p>`]
  };
  const view = views[type];
  if (!view) return;
  modalTitle.textContent = view[0];
  modalContent.innerHTML = view[1];
  modalBackdrop.hidden = false;
  wireModal(type);
}
function closeModal() { modalBackdrop.hidden = true; modalContent.innerHTML = ""; }
$("#closeModal").addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", e => { if (e.target === modalBackdrop) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });
$$("[data-modal]").forEach(btn => btn.addEventListener("click", () => openModal(btn.dataset.modal)));

function wireModal(type) {
  if (type === "password") {
    let current = "";
    $("#pwGenerate").onclick = () => {
      const length = Math.max(12, Math.min(64, Number($("#pwLength").value) || 20));
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+";
      const bytes = new Uint32Array(length); crypto.getRandomValues(bytes);
      current = Array.from(bytes, n => chars[n % chars.length]).join("");
      $("#pwResult").innerHTML = `<code>${esc(current)}</code>`;
    };
    $("#pwCopy").onclick = async () => { if (current) await copyText(current, $("#pwCopy")); };
  }
  if (type === "domain") {
    const getDomain = () => {
      let value = $("#domainInput").value.trim();
      try { if (value.includes("://")) value = new URL(value).hostname; } catch {}
      return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value) && !value.includes("..") ? value : "";
    };
    $("#domainWhois").onclick = () => { const d = getDomain(); if (!d) return alert("اكتب اسم نطاق صحيحاً."); window.open("https://lookup.icann.org/en/lookup?name=" + encodeURIComponent(d), "_blank", "noopener"); };
    $("#domainDns").onclick = () => { const d = getDomain(); if (!d) return alert("اكتب اسم نطاق صحيحاً."); window.open("https://dns.google/query?name=" + encodeURIComponent(d), "_blank", "noopener"); };
  }
  if (type === "hash") {
    let current = "";
    $("#hashGenerate").onclick = async () => {
      const value = $("#hashInput").value;
      const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
      current = [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, "0")).join("");
      $("#hashResult").innerHTML = `<code>${current}</code>`;
    };
    $("#hashCopy").onclick = async () => { if (current) await copyText(current, $("#hashCopy")); };
  }
  if (type === "qr") {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
    script.onload = () => {
      $("#qrGenerate").onclick = () => {
        const value = $("#qrInput").value.trim();
        if (!value) return alert("اكتب نصاً أو رابطاً أولاً.");
        const result = $("#qrResult"); result.innerHTML = "";
        const holder = document.createElement("div"); holder.style.background = "#fff"; holder.style.padding = "12px"; holder.style.display = "inline-block"; holder.style.borderRadius = "8px";
        result.appendChild(holder);
        new QRCode(holder, { text: value, width: 180, height: 180, correctLevel: QRCode.CorrectLevel.M });
        const note = document.createElement("p"); note.className = "hint"; note.textContent = "اضغط مطولاً على الرمز لحفظه إذا كان جهازك يدعم ذلك."; result.appendChild(note);
      };
    };
    script.onerror = () => { $("#qrResult").textContent = "تعذر تحميل مكتبة QR. تحقق من اتصال الإنترنت وحاول مرة أخرى."; };
    document.head.appendChild(script);
  }
}
async function copyText(value, button) {
  try { await navigator.clipboard.writeText(value); const old = button.textContent; button.textContent = "تم النسخ ✓"; setTimeout(() => button.textContent = old, 1200); }
  catch { alert("تعذر النسخ تلقائياً. اضغط مطولاً على النص وانسخه."); }
}

const chatMessages = $("#chatMessages");
const chatForm = $("#chatForm");
const chatInput = $("#chatInput");
const sendBtn = $("#sendBtn");
const history = [];
function addMessage(role, content) {
  const row = document.createElement("div");
  row.className = "message " + (role === "user" ? "user-message" : "assistant-message");
  const avatar = document.createElement("span"); avatar.className = "message-avatar"; avatar.textContent = role === "user" ? "أنت" : "أH";
  const bubble = document.createElement("div"); bubble.className = "bubble"; bubble.textContent = content;
  row.append(avatar, bubble); chatMessages.appendChild(row); chatMessages.scrollTop = chatMessages.scrollHeight;
  return bubble;
}
async function checkStatus() {
  try {
    const r = await fetch("/api/status"); const d = await r.json();
    $("#aiStatus").textContent = d.aiConfigured ? "الاتصال مُعدّ" : "يحتاج إعداد API";
  } catch { $("#aiStatus").textContent = "الخادم غير متصل"; }
}
checkStatus();
chatForm.addEventListener("submit", async e => {
  e.preventDefault();
  const message = chatInput.value.trim();
  if (!message || sendBtn.disabled) return;
  addMessage("user", message); chatInput.value = ""; chatInput.style.height = "auto";
  history.push({ role: "user", content: message });
  const waiting = addMessage("assistant", "لحظة، دا أجهّز الرد...");
  sendBtn.disabled = true;
  try {
    const response = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message, history: history.slice(0, -1) }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "تعذر الحصول على رد.");
    waiting.textContent = data.answer;
    history.push({ role: "assistant", content: data.answer });
    $("#aiStatus").textContent = "جاهز للمساعدة";
  } catch (err) {
    waiting.textContent = err.message || "صار خطأ بالاتصال. حاول مرة ثانية.";
    $("#aiStatus").textContent = "تعذر إكمال الطلب";
  } finally { sendBtn.disabled = false; chatInput.focus(); chatMessages.scrollTop = chatMessages.scrollHeight; }
});
chatInput.addEventListener("input", () => { chatInput.style.height = "auto"; chatInput.style.height = Math.min(chatInput.scrollHeight, 100) + "px"; });
$$("[data-prompt]").forEach(btn => btn.addEventListener("click", () => { chatInput.value = btn.dataset.prompt; chatInput.focus(); chatForm.requestSubmit(); }));
$("#clearChat").addEventListener("click", () => {
  history.length = 0;
  chatMessages.innerHTML = "";
  addMessage("assistant", "تم مسح المحادثة من هذه الصفحة. هلا بيك، شنو تحب تتعلم اليوم؟");
});
