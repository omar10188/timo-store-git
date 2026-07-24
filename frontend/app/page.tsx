'use client';

import { useState, useEffect, useRef, FormEvent, CSSProperties } from 'react';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  category?: string;
  brand?: string;
  stock?: number;
}

interface AiMessage {
  sender: 'bot' | 'user';
  text: string;
}

const API_BASE_URL = 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/products`;
const AUTH_URL = `${API_BASE_URL}/api/auth`;

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState('home');
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // add-product form fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');

  // toast feedback
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // AI sales assistant
  const [aiOpen, setAiOpen] = useState(false);
  const [aiOpened, setAiOpened] = useState(false);
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiInput, setAiInput] = useState('');
  const [aiSending, setAiSending] = useState(false);
  const aiHistoryRef = useRef<{ role: string; content: string }[]>([]);
  const aiEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.title = 'Timo Perfume | متجر العطور الفاخرة';

    async function init() {
      try {
        await ensureAuth();
        await fetchProducts();
      } catch (err) {
        console.error('Initialization failed:', err);
      } finally {
        setAuthReady(true);
        const t = setTimeout(() => setLoading(false), 700);
        return () => clearTimeout(t);
      }
    }

    void init();
  }, []);

  useEffect(() => {
    aiEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, aiSending]);

  async function ensureAuth() {
    if (typeof window === 'undefined') return;

    const savedToken = localStorage.getItem('timo_token');
    if (savedToken) return;

    try {
      const registerRes = await fetch(`${AUTH_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Admin',
          email: 'admin@timo.com',
          password: 'admin123',
          role: 'admin',
        }),
      });

      const registerData = await registerRes.json().catch(() => ({}));
      if (registerRes.ok && registerData.accessToken) {
        localStorage.setItem('timo_token', registerData.accessToken);
        localStorage.setItem('timo_refresh_token', registerData.refreshToken || '');
        return;
      }

      const loginRes = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@timo.com',
          password: 'admin123',
        }),
      });

      const loginData = await loginRes.json().catch(() => ({}));
      if (loginRes.ok && loginData.accessToken) {
        localStorage.setItem('timo_token', loginData.accessToken);
        localStorage.setItem('timo_refresh_token', loginData.refreshToken || '');
      }
    } catch (err) {
      console.error('Auth bootstrap failed:', err);
    }
  }

  async function fetchProducts() {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const normalized = Array.isArray(data) ? data : data.products || [];
      setProducts(normalized);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    }
  }

  function showToast(msg: string) {
    setToastMsg(msg);
    setToastShow(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastShow(false), 2200);
  }

  async function handleAddProduct(e: FormEvent) {
    e.preventDefault();
    if (!name || !price || !image) return;

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('timo_token') : null;

      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          description: `Perfume crafted for ${name}`,
          price: Number(price),
          category: 'Eau de Parfum',
          brand: 'Timo',
          stock: 10,
          image,
          isFeatured: true,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Unable to add product');
      }

      setName('');
      setPrice('');
      setImage('');
      showToast(`✓ تمت إضافة ${name}`);
      await fetchProducts();
    } catch (err) {
      console.error('Failed to add product:', err);
      showToast('تعذر إضافة المنتج، جرّب مرة أخرى');
    }
  }

  async function handleDelete(id: string, productName: string) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('timo_token') : null;
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Unable to delete product');
      }

      showToast(`تم حذف ${productName}`);
      await fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
      showToast('تعذر حذف المنتج');
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function addAiMessage(text: string, sender: 'bot' | 'user') {
    setAiMessages((prev) => [...prev, { sender, text }]);
  }

  function openAiChat() {
    setAiOpen((prev) => !prev);
    if (!aiOpened) {
      setAiOpened(true);
      addAiMessage(
        'أهلاً بيك في TIMO 😏 عايز عطر يخلي الناس تاخد بالها منك؟ قولّي بتحب ريحة إيه والمناسبة، وهقترحلك على أساسها 🔥',
        'bot'
      );
    }
  }

  async function sendAiMessage() {
    const text = aiInput.trim();
    if (!text) return;
    addAiMessage(text, 'user');
    aiHistoryRef.current.push({ role: 'user', content: text });
    setAiInput('');
    setAiSending(true);

    // system prompt is rebuilt from the live products list on every send
    const systemPrompt = `أنتِ "تيمو"، مساعدة مبيعات ذكية لمتجر TIMO Perfume، متجر عطور فاخر.

الشخصية:
- اتكلمي بس بالعامية المصرية، ودودة وواثقة وشوية دلع 😏
- كأنك خبيرة عطور مش بوت
- ردود قصيرة وسريعة وجذابة، من غير كلام طويل مملّ
- إيموجيز خفيفة بس مش كتير 😎🔥👌

الهدف:
مش بس تساعدي، هدفك تقربي العميل من الشراء. ابرزي جاذبية وثقة وحضور العطر واخلقي رغبة حقيقية، بأسلوب سلس مش ضغط مباشر.

قواعد مهمة:
- اقترحي بس من المنتجات في PRODUCTS تحت، وممنوع تخترعي منتج أو سعر مش موجود فيها
- المتجر لسه جديد، فممنوع تدّعي إن "ناس كتير جربته وحبته" — ركزي بدل كده على وصف الاحساس والمناسبة
- اقترحي 2-3 منتجات كحد أقصى في المرة
- اقفلي كل رد بجملة أو سؤال بيقرّب من الشراء، زي "تحب أقولك عليه أكتر؟" 🔥

PRODUCTS:
${JSON.stringify(products.map((p) => ({ name: p.name, price: p.price })))}`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 400,
          system: systemPrompt,
          messages: aiHistoryRef.current,
        }),
      });
      const data = await response.json();
      const reply =
        (data.content || [])
          .map((b: { type: string; text?: string }) => (b.type === 'text' ? b.text : ''))
          .join('')
          .trim() || 'معلش، ممكن تسأل تاني؟ 🙏';
      addAiMessage(reply, 'bot');
      aiHistoryRef.current.push({ role: 'assistant', content: reply });
    } catch (err) {
      addAiMessage('معلش حصل خطأ بسيط، جرب تاني كمان شوية 🙏', 'bot');
    } finally {
      setAiSending(false);
    }
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&display=swap"
        rel="stylesheet"
      />

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --bg: #08080c;
          --gold: #d4af37;
          --gold-light: #f2d888;
          --gold-dim: rgba(212, 175, 55, 0.35);
          --cream: #f6f0e2;
          --muted: #9691a3;
          --glass: rgba(255, 255, 255, 0.045);
          --border: rgba(212, 175, 55, 0.18);
          --radius: 18px;
        }

        html, body { height: 100%; }

        body {
          font-family: 'Cairo', sans-serif;
          background:
            radial-gradient(circle at 15% 20%, rgba(212, 175, 55, 0.09), transparent 40%),
            radial-gradient(circle at 85% 75%, rgba(147, 112, 219, 0.07), transparent 45%),
            linear-gradient(160deg, #0a0a10 0%, #141019 50%, #0a0a10 100%);
          background-attachment: fixed;
          color: var(--cream);
          min-height: 100vh;
          overflow-x: hidden;
        }

        #loader {
          position: fixed; inset: 0; background: var(--bg);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 20px; z-index: 999;
          transition: opacity .6s ease, visibility .6s ease;
        }
        #loader.hide { opacity: 0; visibility: hidden; }
        .loader-ring {
          width: 62px; height: 62px; border-radius: 50%;
          background: conic-gradient(from 0deg, transparent 0%, var(--gold) 55%, transparent 68%);
          animation: spin .9s linear infinite;
          position: relative;
        }
        .loader-ring::before {
          content: ''; position: absolute; inset: 7px; border-radius: 50%; background: var(--bg);
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loader-brand {
          font-family: 'Playfair Display', serif; letter-spacing: 6px; font-size: 13px;
          color: var(--gold); animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse { 0%, 100% { opacity: .35 } 50% { opacity: 1 } }

        .sidebar {
          position: fixed; top: 0; left: 0; bottom: 0; width: 230px;
          background: linear-gradient(180deg, rgba(20, 18, 26, .92), rgba(9, 8, 13, .96));
          backdrop-filter: blur(20px);
          border-right: 1px solid var(--border);
          padding: 34px 20px; z-index: 10;
          display: flex; flex-direction: column;
        }
        .logo { text-align: center; margin-bottom: 46px; }
        .logo-text {
          display: block; font-family: 'Playfair Display', serif; font-size: 29px; font-weight: 700;
          background: linear-gradient(135deg, var(--gold-light), var(--gold));
          -webkit-background-clip: text; background-clip: text; color: transparent; letter-spacing: 3px;
        }
        .logo-sub { display: block; font-size: 10px; letter-spacing: 5px; color: var(--muted); margin-top: 5px; }

        nav ul { list-style: none; display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .nav-item {
          display: flex; align-items: center; gap: 12px; padding: 13px 16px; border-radius: 14px;
          cursor: pointer; color: var(--muted); font-size: 15px; font-weight: 600;
          transition: all .3s ease; position: relative;
        }
        .nav-item:hover { background: var(--glass); color: var(--cream); }
        .nav-item.active {
          background: linear-gradient(135deg, rgba(212, 175, 55, .18), rgba(212, 175, 55, .04));
          color: var(--gold-light);
          box-shadow: 0 0 0 1px var(--border), 0 4px 18px rgba(212, 175, 55, .15);
        }
        .nav-icon { width: 19px; height: 19px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .nav-icon svg { width: 100%; height: 100%; }
        .cart-badge {
          margin-left: auto; background: var(--gold); color: #1a1a1a; font-size: 11px; font-weight: 700;
          padding: 2px 8px; border-radius: 20px; min-width: 18px; text-align: center;
        }
        .sidebar-footer { text-align: center; font-size: 12px; color: var(--muted); font-style: italic; opacity: .6; }

        .main { margin-left: 230px; padding: 50px 56px 80px; position: relative; z-index: 2; }
        .hero { position: relative; margin-bottom: 38px; }
        .hero::before {
          content: ''; position: absolute; top: -50px; left: -40px; width: 220px; height: 220px;
          background: radial-gradient(circle, rgba(212, 175, 55, .14), transparent 70%);
          filter: blur(15px); z-index: -1;
        }
        .hero h1 { font-family: 'Playfair Display', serif; font-size: 42px; font-weight: 600; color: var(--cream); }
        .hero h1 span {
          background: linear-gradient(135deg, var(--gold-light), var(--gold));
          -webkit-background-clip: text; background-clip: text; color: transparent;
        }
        .tagline { color: var(--muted); margin-top: 8px; font-size: 15px; }

        .search-wrap { position: relative; max-width: 380px; margin-bottom: 24px; }
        .search-icon { position: absolute; right: 18px; top: 50%; transform: translateY(-50%); color: var(--muted); width: 17px; height: 17px; pointer-events: none; }
        .search-icon svg { width: 100%; height: 100%; }
        #search {
          width: 100%; padding: 14px 50px 14px 20px; background: var(--glass); border: 1px solid var(--border);
          border-radius: 30px; color: var(--cream); font-family: 'Cairo', sans-serif; font-size: 14px;
          outline: none; transition: all .3s; text-align: right; direction: rtl;
        }
        #search::placeholder { color: var(--muted); }
        #search:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 4px rgba(212, 175, 55, .12), 0 0 20px rgba(212, 175, 55, .15);
          background: rgba(255, 255, 255, .06);
        }

        .add-form { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 42px; max-width: 640px; }
        .add-form input {
          flex: 1; min-width: 120px; background: var(--glass); border: 1px solid var(--border); border-radius: 14px;
          padding: 12px 16px; color: var(--cream); font-family: 'Cairo', sans-serif; font-size: 13px;
          outline: none; text-align: right; direction: rtl;
        }
        .add-form input:focus { border-color: var(--gold); }
        .add-form .add-btn { flex-shrink: 0; }

        .products { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 26px; max-width: 1000px; }
        .empty-state { color: var(--muted); font-size: 14px; }
        .card-container {
          perspective: 1400px; height: 300px; cursor: pointer;
          opacity: 0; transform: translateY(30px); animation: rise .6s ease forwards;
        }
        @keyframes rise { to { opacity: 1; transform: translateY(0); } }

        .card { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; transition: transform .7s cubic-bezier(.4, .2, .2, 1); }
        .card-container:hover .card, .card-container.flipped .card { transform: rotateY(180deg); }

        .card-face {
          position: absolute; inset: 0; backface-visibility: hidden; border-radius: var(--radius);
          border: 1px solid var(--border); display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 20px; text-align: center;
        }
        .card-front {
          background: linear-gradient(160deg, rgba(255, 255, 255, .06), rgba(255, 255, 255, .01));
          backdrop-filter: blur(10px); color: var(--gold-light);
        }
        .bottle-svg { width: 60px; height: 92px; margin-bottom: 16px; object-fit: contain; filter: drop-shadow(0 0 12px rgba(212, 175, 55, .35)); position: relative; z-index: 1; }
        .card-front h3 { font-size: 17px; font-weight: 700; color: var(--cream); margin-bottom: 6px; }
        .card-hint { font-size: 11px; color: var(--muted); }

        .scent-trail { position: absolute; top: 34%; left: 50%; width: 0; height: 0; }
        .scent-trail span {
          position: absolute; width: 3px; height: 3px; border-radius: 50%;
          background: var(--gold-light); opacity: 0; top: 0;
        }
        .card-container:hover .scent-trail span { animation: trailRise 1.6s ease-out infinite; }
        .scent-trail span:nth-child(1) { left: -9px; }
        .scent-trail span:nth-child(2) { left: 1px; animation-delay: .45s !important; }
        .scent-trail span:nth-child(3) { left: 8px; animation-delay: .9s !important; }
        @keyframes trailRise {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          18% { opacity: .9; }
          100% { transform: translateY(-40px) scale(.3); opacity: 0; }
        }

        .card-back { background: linear-gradient(160deg, #17131c, #0c0a10); transform: rotateY(180deg); gap: 16px; }
        .card-back h4 { font-size: 14px; color: var(--muted); font-weight: 600; }
        .price { font-family: 'Playfair Display', serif; font-size: 27px; color: var(--gold-light); }
        .price span { font-size: 13px; color: var(--muted); font-family: 'Cairo', sans-serif; }

        .add-btn {
          border: 1.5px solid var(--gold); padding: 11px 26px; border-radius: 30px; background: transparent;
          color: var(--gold-light); font-family: 'Cairo', sans-serif; font-weight: 700; font-size: 13px;
          cursor: pointer; position: relative; overflow: hidden; transition: all .35s;
        }
        .add-btn::before {
          content: ''; position: absolute; inset: -50%;
          background: radial-gradient(circle, rgba(212, 175, 55, .35), transparent 70%);
          transform: scale(0); transition: transform .45s;
        }
        .add-btn:hover::before { transform: scale(1); }
        .add-btn:hover { color: #141116; background: var(--gold); box-shadow: 0 0 12px var(--gold-dim), 0 0 30px rgba(212, 175, 55, .35); }
        .add-btn span { position: relative; z-index: 1; }

        .social { display: flex; gap: 22px; margin-top: 56px; }
        .social a {
          width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
          background: var(--glass); border: 1px solid var(--border); color: var(--cream); text-decoration: none;
          transition: all .35s;
          -webkit-box-reflect: below 6px linear-gradient(transparent, transparent 60%, rgba(0, 0, 0, .35));
        }
        .social a svg { width: 19px; height: 19px; }
        .social a:hover {
          background: var(--color); border-color: var(--color); color: #fff; transform: translateY(-4px);
          box-shadow: 0 0 8px var(--color), 0 0 25px var(--color), 0 0 55px var(--color);
        }

        .whatsapp-float {
          position: fixed; bottom: 28px; right: 28px; z-index: 50; width: 58px; height: 58px; border-radius: 50%;
          background: linear-gradient(135deg, #25D366, #1da851); display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(37, 211, 102, .4); animation: floatPulse 2.4s ease-in-out infinite; text-decoration: none;
        }
        .whatsapp-float svg { width: 27px; height: 27px; fill: #fff; }
        @keyframes floatPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(37, 211, 102, .4); }
          50% { box-shadow: 0 4px 28px rgba(37, 211, 102, .7), 0 0 0 8px rgba(37, 211, 102, .08); }
        }

        .ai-chat-trigger {
          position: fixed; bottom: 28px; left: 28px; z-index: 50; width: 58px; height: 58px; border-radius: 50%;
          background: linear-gradient(135deg, var(--gold-light), var(--gold)); border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 20px rgba(212, 175, 55, .45); animation: aiPulse 2.6s ease-in-out infinite;
        }
        .ai-chat-trigger svg { width: 26px; height: 26px; fill: #141116; }
        @keyframes aiPulse { 0%, 100% { box-shadow: 0 4px 20px rgba(212, 175, 55, .4); }
          50% { box-shadow: 0 4px 30px rgba(212, 175, 55, .75), 0 0 0 8px rgba(212, 175, 55, .1); }
        }

        .ai-chat-panel {
          position: fixed; bottom: 98px; left: 28px; z-index: 60;
          width: min(330px, calc(100vw - 40px)); height: min(460px, calc(100vh - 160px));
          background: linear-gradient(165deg, rgba(20, 18, 26, .97), rgba(9, 8, 13, .99));
          backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: 20px;
          display: none; flex-direction: column; overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, .5);
        }
        .ai-chat-panel.open { display: flex; }

        .ai-chat-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 18px; border-bottom: 1px solid var(--border);
          font-family: 'Playfair Display', serif; font-weight: 600; color: var(--gold-light); font-size: 16px;
        }
        .ai-chat-header button { background: none; border: none; color: var(--muted); font-size: 20px; cursor: pointer; line-height: 1; }
        .ai-chat-header button:hover { color: var(--gold-light); }

        .ai-chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
        .ai-msg {
          max-width: 82%; padding: 10px 14px; border-radius: 16px; font-size: 13.5px; line-height: 1.6;
          direction: rtl; text-align: right;
        }
        .ai-msg.bot {
          align-self: flex-start; background: var(--glass); border: 1px solid var(--border); color: var(--cream);
          border-bottom-left-radius: 4px;
        }
        .ai-msg.user {
          align-self: flex-end; background: linear-gradient(135deg, var(--gold-light), var(--gold)); color: #141116;
          font-weight: 600; border-bottom-right-radius: 4px;
        }
        .ai-msg.typing { display: flex; gap: 4px; padding: 14px; }
        .ai-msg.typing span {
          width: 6px; height: 6px; border-radius: 50%; background: var(--gold-light); opacity: .5;
          animation: typingDot 1.2s ease-in-out infinite;
        }
        .ai-msg.typing span:nth-child(2) { animation-delay: .2s; }
        .ai-msg.typing span:nth-child(3) { animation-delay: .4s; }
        @keyframes typingDot { 0%, 60%, 100% { transform: translateY(0); opacity: .5; } 30% { transform: translateY(-4px); opacity: 1; } }

        .ai-chat-input-row { display: flex; gap: 8px; padding: 14px; border-top: 1px solid var(--border); }
        .ai-chat-input-row input {
          flex: 1; background: var(--glass); border: 1px solid var(--border); border-radius: 24px;
          padding: 10px 16px; color: var(--cream); font-family: 'Cairo', sans-serif; font-size: 13px;
          outline: none; direction: rtl; text-align: right;
        }
        .ai-chat-input-row input:focus { border-color: var(--gold); }
        .ai-chat-input-row button {
          width: 38px; height: 38px; border-radius: 50%; border: none; flex-shrink: 0;
          background: var(--gold); color: #141116; cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: transform .2s;
        }
        .ai-chat-input-row button:hover { transform: scale(1.08); }
        .ai-chat-input-row button:disabled { opacity: .5; cursor: default; transform: none; }
        .ai-chat-input-row button svg { width: 16px; height: 16px; }

        .ai-chat-trigger:focus-visible, .ai-chat-input-row button:focus-visible, .ai-chat-header button:focus-visible {
          outline: 2px solid var(--gold); outline-offset: 3px;
        }

        .toast {
          position: fixed; top: 24px; left: 50%; transform: translateX(-50%) translateY(-100px);
          background: linear-gradient(135deg, #17131c, #0c0a10); border: 1px solid var(--gold); color: var(--gold-light);
          padding: 14px 28px; border-radius: 30px; font-size: 14px; font-weight: 600; z-index: 200;
          transition: transform .4s cubic-bezier(.34, 1.56, .64, 1); box-shadow: 0 8px 30px rgba(0, 0, 0, .5);
          white-space: nowrap;
        }
        .toast.show { transform: translateX(-50%) translateY(0); }

        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: var(--gold-dim); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--gold); }

        .nav-item:focus-visible, .card-container:focus-visible, .add-btn:focus-visible,
        .social a:focus-visible, .whatsapp-float:focus-visible, #search:focus-visible {
          outline: 2px solid var(--gold); outline-offset: 3px;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important;
          }
        }

        @media (max-width: 820px) {
          .sidebar { width: 100%; height: auto; position: relative; flex-direction: row; align-items: center; padding: 14px 18px; border-right: none; border-bottom: 1px solid var(--border); }
          .logo { margin-bottom: 0; }
          .logo-sub { display: none; }
          nav ul { flex-direction: row; gap: 4px; flex: 1; justify-content: flex-end; }
          .nav-item span:not(.nav-icon):not(.cart-badge) { display: none; }
          .sidebar-footer { display: none; }
          .main { margin-left: 0; padding: 30px 22px 90px; }
          .hero h1 { font-size: 30px; }
          .ai-chat-trigger { bottom: 20px; left: 20px; }
          .ai-chat-panel { bottom: 90px; left: 20px; }
        }
      `}</style>

      <div id="loader" className={loading ? '' : 'hide'}>
        <div className="loader-ring"></div>
        <div className="loader-brand">TIMO</div>
      </div>

      <aside className="sidebar">
        <div className="logo">
          <span className="logo-text">TIMO</span>
          <span className="logo-sub">PERFUME</span>
        </div>
        <nav>
          <ul>
            <li
              className={`nav-item ${activeNav === 'home' ? 'active' : ''}`}
              tabIndex={0}
              onClick={() => setActiveNav('home')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveNav('home'); } }}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 11l9-8 9 8" />
                  <path d="M5 10v10h14V10" />
                </svg>
              </span>
              <span>الرئيسية</span>
            </li>
            <li
              className={`nav-item ${activeNav === 'products' ? 'active' : ''}`}
              tabIndex={0}
              onClick={() => setActiveNav('products')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveNav('products'); } }}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 8h12l-1 12H7L6 8z" />
                  <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                </svg>
              </span>
              <span>المنتجات</span>
            </li>
            <li
              className={`nav-item ${activeNav === 'cart' ? 'active' : ''}`}
              tabIndex={0}
              onClick={() => setActiveNav('cart')}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActiveNav('cart'); } }}
            >
              <span className="nav-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="20" r="1.3" fill="currentColor" stroke="none" />
                  <circle cx="18" cy="20" r="1.3" fill="currentColor" stroke="none" />
                  <path d="M2 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.6a2 2 0 0 0 2-1.6L21 7H6" />
                </svg>
              </span>
              <span>السلة</span>
              <span className="cart-badge">{authReady ? products.length : 0}</span>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">عطورك، بصمتك</div>
      </aside>

      <main className="main">
        <header className="hero">
          <h1>Timo <span>Perfume</span></h1>
          <p className="tagline">عطور فاخرة تُعبّر عنك</p>
        </header>

        <div className="search-wrap">
          <span className="search-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" />
            </svg>
          </span>
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث عن عطرك المفضل..."
          />
        </div>

        <form className="add-form" onSubmit={handleAddProduct}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اسم العطر"
            required
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="السعر"
            min="0"
            required
          />
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="رابط الصورة"
            required
          />
          <button type="submit" className="add-btn"><span>إضافة منتج</span></button>
        </form>

        <section className="products">
          {filteredProducts.length === 0 && (
            <p className="empty-state">لسه مفيش منتجات، ضيف أول عطر من الفورم فوق.</p>
          )}

          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className={`card-container ${flippedId === product._id ? 'flipped' : ''}`}
              tabIndex={0}
              onClick={() => setFlippedId(flippedId === product._id ? null : product._id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setFlippedId(flippedId === product._id ? null : product._id);
                }
              }}
            >
              <div className="card">
                <div className="card-face card-front">
                  <div className="scent-trail"><span></span><span></span><span></span></div>
                  <img src={product.image} alt={product.name} className="bottle-svg" loading="lazy" />
                  <h3>{product.name}</h3>
                  <span className="card-hint">اضغط للسعر ↻</span>
                </div>
                <div className="card-face card-back">
                  <h4>{product.name}</h4>
                  <p className="price">{product.price}<span> جنيه</span></p>
                  <button
                    className="add-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(product._id, product.name);
                    }}
                  >
                    <span>حذف</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="social">
          <a href="#" style={{ '--color': '#0A66C2' } as CSSProperties} aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8.5h4V23h-4V8.5zM8.5 8.5h3.83v1.98h.05c.53-1 1.84-2.06 3.79-2.06 4.06 0 4.81 2.67 4.81 6.14V23h-4v-6.6c0-1.57-.03-3.6-2.19-3.6-2.2 0-2.54 1.72-2.54 3.49V23h-4V8.5z" /></svg>
          </a>
          <a href="#" style={{ '--color': '#E1306C' } as CSSProperties} aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.4" cy="6.6" r="1" /></svg>
          </a>
          <a href="#" style={{ '--color': '#ff0000' } as CSSProperties} aria-label="YouTube">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.8 8.2a2.7 2.7 0 0 0-1.9-1.9C18.2 5.8 12 5.8 12 5.8s-6.2 0-7.9.5a2.7 2.7 0 0 0-1.9 1.9A28 28 0 0 0 1.7 12a28 28 0 0 0 .5 3.8 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.9.5 7.9.5s6.2 0 7.9-.5a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22.3 12a28 28 0 0 0-.5-3.8z" /><path d="M9.8 15.3V8.7L15.5 12l-5.7 3.3z" fill="#08080c" /></svg>
          </a>
          <a href="#" style={{ '--color': '#1877f2' } as CSSProperties} aria-label="Facebook">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14C17.17 2.09 15.95 2 14.66 2 11.98 2 10 3.66 10 6.7v2.8H7v4h3V22h4v-8.5z" /></svg>
          </a>
        </div>
      </main>

      <a
        href="https://wa.me/201008313604"
        target="_blank"
        rel="noreferrer"
        className="whatsapp-float"
        aria-label="اطلب عبر واتساب"
      >
        <svg viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.47 3.48 1.36 4.98L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.13c-.24.68-1.4 1.32-1.93 1.36-.5.05-1.06.24-3.55-.74-2.98-1.18-4.9-4.19-5.05-4.39-.15-.19-1.2-1.6-1.2-3.05 0-1.46.76-2.17 1.04-2.47.27-.29.6-.36.8-.36.2 0 .4 0 .58.01.19.01.44-.07.68.53.25.61.85 2.1.92 2.25.08.15.13.32.02.52-.1.19-.16.31-.31.48-.15.17-.32.38-.46.51-.15.15-.32.31-.14.61.19.3.83 1.37 1.78 2.22 1.22 1.09 2.25 1.43 2.55 1.59.3.15.48.13.65-.08.18-.2.75-.87.95-1.17.19-.3.39-.24.65-.15.27.1 1.7.8 1.99.95.3.15.49.22.56.34.08.12.08.71-.16 1.39z" /></svg>
      </a>

      <button className="ai-chat-trigger" onClick={openAiChat} aria-label="اسأل مساعدة تيمو عن العطور">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l1.8 5.3L19 9l-5.2 1.7L12 16l-1.8-5.3L5 9l5.2-1.7L12 2z" />
          <path d="M19 14l.9 2.6L22.5 17.5l-2.6.9L19 21l-.9-2.6-2.6-.9 2.6-.9L19 14z" />
          <path d="M5 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" />
        </svg>
      </button>

      <div className={`ai-chat-panel ${aiOpen ? 'open' : ''}`}>
        <div className="ai-chat-header">
          <span>مساعدة TIMO ✨</span>
          <button onClick={() => setAiOpen(false)} aria-label="إغلاق الشات">×</button>
        </div>
        <div className="ai-chat-messages">
          {aiMessages.map((m, i) => (
            <div key={i} className={`ai-msg ${m.sender}`}>{m.text}</div>
          ))}
          {aiSending && (
            <div className="ai-msg bot typing">
              <span></span><span></span><span></span>
            </div>
          )}
          <div ref={aiEndRef} />
        </div>
        <div className="ai-chat-input-row">
          <input
            type="text"
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendAiMessage(); }}
            placeholder="اسألني عن عطرك المفضل..."
          />
          <button onClick={sendAiMessage} disabled={aiSending} aria-label="إرسال">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 11l18-8-8 18-2.5-7.5L3 11z" /></svg>
          </button>
        </div>
      </div>

      <div className={`toast ${toastShow ? 'show' : ''}`}>{toastMsg}</div>
    </>
  );
}