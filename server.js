require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "30kb" }));
app.use(express.static(path.join(__dirname, "public")));

const SYSTEM_PROMPT = `
أنت مساعد منصة أبو هاشم، مساعد عربي للتوعية بالأمن السيبراني والاستخدام الآمن للتقنية.
أجب باللغة العربية وبأسلوب واضح. ساعد في الدفاع عن الأنظمة المملوكة للمستخدم، فهم المفاهيم،
حماية الحسابات، تحليل رسائل التصيد، إعدادات الأمان، والتعلم داخل مختبرات قانونية.
لا تقدم تعليمات لسرقة الحسابات أو كلمات المرور، تجاوز الحماية، نشر البرمجيات الخبيثة،
التخفي عن أنظمة الحماية، أو استهداف أشخاص/أنظمة دون إذن. عند الطلبات الخطرة، ارفض باختصار
ووجّه إلى بديل آمن ودفاعي. لا تدّع أنك أجريت فحصاً حقيقياً إذا لم تتوفر أداة لذلك.
`;

app.get("/api/status", (_req, res) => {
  res.json({ ok: true, aiConfigured: Boolean(process.env.AI_API_KEY) });
});

app.post("/api/chat", async (req, res) => {
  try {
    const message = typeof req.body.message === "string" ? req.body.message.trim() : "";
    const history = Array.isArray(req.body.history) ? req.body.history.slice(-8) : [];
    if (!message) return res.status(400).json({ error: "اكتب رسالتك أولاً." });
    if (message.length > 4000) return res.status(400).json({ error: "الرسالة طويلة جداً. اختصرها إلى 4000 حرف." });

    if (!process.env.AI_API_KEY) {
      return res.status(503).json({
        error: "مساعد الذكاء الاصطناعي غير مفعّل بعد. أضف مفتاح API في إعدادات الاستضافة (AI_API_KEY) ثم أعد تشغيل الموقع."
      });
    }

    const safeHistory = history
      .filter(m => m && ["user", "assistant"].includes(m.role) && typeof m.content === "string")
      .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));

    const response = await fetch(process.env.AI_API_URL || "https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...safeHistory,
          { role: "user", content: message }
        ],
        temperature: 0.5,
        max_tokens: 700
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("AI provider error:", response.status, data?.error?.message || "unknown");
      return res.status(502).json({ error: "تعذر الاتصال بخدمة الذكاء الاصطناعي. تأكد من المفتاح واسم النموذج وإعدادات المزود." });
    }

    const answer = data?.choices?.[0]?.message?.content;
    if (!answer) return res.status(502).json({ error: "وصل رد غير متوقع من خدمة الذكاء الاصطناعي." });
    res.json({ answer });
  } catch (err) {
    console.error("Chat endpoint error:", err.message);
    res.status(500).json({ error: "حدث خطأ داخلي. حاول مرة أخرى لاحقاً." });
  }
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`Abu Hashem Cyber running on port ${PORT}`));
