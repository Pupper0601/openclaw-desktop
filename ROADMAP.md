# 🗺️ AEGIS Desktop — الخارطة الكاملة

> هذا الملف يحتوي على التحليل المعماري الكامل المستلهم من PyGPT + خارطة الطريق لكل مراحل التطوير.

---

## 📐 التحليل المعماري — الأنماط المستلهمة من PyGPT

### 1. RenderBlock — أهم pattern في المشروع

بدل ما يرسل text خام للرندر، PyGPT يحوّل كل رسالة إلى RenderBlock مهيكل:

```typescript
// ← هذا اللي نبي نسويه لـ AEGIS
interface RenderBlock {
  id: number;
  meta_id?: number;
  input?: { text: string; name?: string; timestamp?: number };
  output?: { text: string; name?: string; timestamp?: number };
  files: Record<string, any>;
  images: Record<string, any>;
  urls: Record<string, any>;
  tools: Record<string, any>;
  tools_outputs: Record<string, any>;
  extra: Record<string, any>;
}
```

الرسالة تتحلل لـ structured data **قبل** ما توصل الرندر.
الرندر يستقبل بيانات نظيفة ويعرضها — **ما يحلل ولا يفلتر**.

### 2. Event-Driven Render Pipeline

الـ rendering كله عبر events — مو method calls مباشرة:

```
RenderEvent.BEGIN        → renderer.begin()
RenderEvent.STREAM_APPEND → renderer.append_chunk()
RenderEvent.STREAM_END   → renderer.stream_end()
RenderEvent.TOOL_BEGIN   → renderer.tool_begin()
RenderEvent.TOOL_END     → renderer.tool_end()
```

هذا يعني إنك تقدر تبدّل الرندر بالكامل بدون ما تعدل أي شي ثاني — يبقى نفس الـ events.

### 3. _AppendBuffer — Streaming Optimization

عندهم buffer خاص للـ streaming يستخدم `StringIO` مع explicit memory management.
هذا أذكى من setTimeout/requestAnimationFrame لأنه يتعامل مع الذاكرة مو بس التوقيت.

### 4. Chat Controller Decomposition

14 ملف بدل ملف واحد. كل ملف يعرف مسؤوليته:

```
Chat (root)       ← يجمّع الكل
├── input.py      ← يستقبل الرسالة من UI
├── text.py       ← يعالج النص (cleaning, formatting)
├── command.py    ← يحلل الأوامر
├── output.py     ← يجهز الرسالة للعرض
├── render.py     ← يوجّه للرندر الصحيح
├── stream.py     ← يدير الـ streaming
├── response.py   ← يعالج الرد من API
├── attachment.py  ← الملفات المرفقة
├── audio.py      ← الصوت
├── image.py      ← الصور
└── common.py     ← utilities مشتركة
```

---

## 🔄 كيف نطبّق هذا على AEGIS Desktop

### الـ Mapping من PyGPT → AEGIS

| PyGPT | AEGIS الحالي | AEGIS الجديد |
|-------|------------|-------------|
| `core/render/base.py` | مو موجود | `renderers/BaseRenderer.ts` |
| `core/render/web/renderer.py` | `MessageBubble.tsx` (كل شي فيه) | `renderers/` folder مع تخصص |
| `core/render/web/parser.py` | `autoDetectCode.ts` + ReactMarkdown inline | `processing/ContentParser.ts` |
| `core/render/web/body.py` | مو موجود | `processing/RenderBlock.ts` |
| `core/events/render.py` | مو موجود (direct calls) | اختياري — أو Zustand actions |
| `controller/chat/chat.py` | `gateway.ts` (700 سطر monolith) | فصل لـ 5-6 ملفات |
| `controller/chat/stream.py` | `handleEvent` في gateway.ts | `services/StreamHandler.ts` |
| `controller/chat/render.py` | ChatView.tsx (يخلط rendering + processing) | ChatView.tsx (rendering فقط) |
| `controller/chat/text.py` | `stripUserMeta` + `NOISE_PATTERNS` | `processing/TextCleaner.ts` |
| `controller/chat/command.py` | `parseAndExecuteWorkshopCommands` | `processing/CommandParser.ts` |
| `item/ctx.py` (CtxItem) | `ChatMessage` interface (15 fields) | `RenderBlock` interface |

### الخطة المحدّثة المستلهمة من PyGPT

الفكرة الأساسية: **اللي يدخل الرندر يكون structured data, مو raw text**.

```
Gateway (WebSocket)
       ↓
StreamHandler.ts (يستقبل events)
       ↓
TextCleaner.ts (strips noise, meta, directives)
       ↓
ContentParser.ts (يحلل → RenderBlock)
       ↓
chatStore.ts (يخزن RenderBlock[])
       ↓
ChatView.tsx (يعرض RenderBlocks)
       ↓
MessageBubble.tsx (يوجّه لـ renderer حسب type)
       ↓
renderers/ (كل نوع محتوى = renderer مخصص)
```

---

## Phase 0: Chat Engine Rewrite ← نقطة البداية

**الاستثمار الأهم. كل شي بعده يُبنى فوقه.**

- RenderBlock pipeline
- فصل gateway.ts
- renderers مخصصة
- MessageGroup + CollapsedMeta
- حذف dead code (artifacts, noise patterns)

---

## Phase 1: الأشياء اللي الـ Chat Rewrite يفتحها مباشرة

### 1. Virtual Scroll / Windowed Rendering

بعد ما يصير عندك `RenderBlock[]` نظيف، تقدر تطبّق virtualization — يعني الشات يرندر بس الرسائل المرئية على الشاشة.

الحين مع `messages.map()` كل رسالة في الـ DOM حتى لو فيه 500 رسالة. هذا يأثر على الأداء بشكل واضح في المحادثات الطويلة.

### 2. Search Inside Chat

مع RenderBlocks مهيكلة، تقدر تسوي Ctrl+F يبحث داخل المحادثة — في النص، في الكود، في أسماء الأدوات.

الحين مافيه هالميزة.

### 3. Message Actions (Edit / Regenerate / Fork)

بعد ما كل رسالة تصير RenderBlock مع ID واضح ومكانها في الـ group معروف، تقدر تضيف:
- edit رسالة user → يعيد إرسال من هالنقطة
- regenerate رد assistant

هذا يحتاج الـ grouping يكون جاهز أول.

### 4. Export Chat (Markdown / PDF / HTML)

مع RenderBlocks مهيكلة، الـ export يصير سهل — تمشي على الـ blocks وتحوّلها للفورمات اللي تبي.

الحين لازم تتعامل مع raw text + regex.

---

## Phase 2: ميزات مستقلة عن الشات

### 5. Multi-Agent View

عندك أصلاً sessions و tabs. بس الحين الـ sub-agent sessions مخفية (`gateway.ts` يتجاهلها).

بعد الـ rewrite تقدر تعرض كل session في tab مستقل مع live streaming. يعني تشوف الـ main agent يتكلم مع sub-agent في الوقت الحقيقي.

### 6. File Manager Panel

الـ agent يقرأ ويكتب ملفات. بس ما عندك UI يعرض وش الملفات اللي الـ agent عنده أو عدّلها.

Panel جانبي يعرض workspace files مع preview — مثل PyGPT بالضبط.

### 7. Settings / Config UI Overhaul

الحين الإعدادات تُقرأ من `clawdbot.json` عبر Electron IPC. ما فيه UI يعدّل الإعدادات.

تحتاج Settings page فيها: model selection, thinking level, temperature, context window, tool permissions, وغيرها.

---

## Phase 3: القدرات الجديدة

### 8. MCP Integration في AEGIS Desktop

PyGPT يدعم MCP (Model Context Protocol). AEGIS Desktop يقدر يكون MCP client — يعني الـ agent يستخدم أدوات خارجية (GitHub, Slack, Google, etc.) مباشرة من الـ Desktop.

OpenClaw أصلاً يدعم tools — بس الـ UI ما يعرض MCP tools بشكل واضح.

### 9. Knowledge Base / RAG Panel

ربط الـ AEGIS Memory System بالـ Desktop:
- تشوف memories
- تعدّلها
- تحذفها
- تبحث فيها

الحين الـ memory system يشتغل في الخلفية بدون أي UI.

### 10. Code Interpreter / Sandbox View

لما الـ agent ينفّذ كود، الحين يظهر كـ tool call مطوي. تقدر تسوي panel مخصص يعرض:
- الكود
- الـ output
- الـ errors

في بيئة مثل terminal — مشابه لـ PyGPT's Code Interpreter window.

---

## Phase 4: Polish & Production

### 11. Theming System

عندك أصلاً dark/light. لكن تحتاج:
- custom themes
- accent color picker (على الأقل)

CSS variables جاهزة — بس تحتاج UI يتحكم فيها.

### 12. Keyboard Shortcuts + Accessibility

Ctrl+K command palette موجود (`CommandPalette.tsx`). لكن تحتاج:
- keyboard navigation كامل
- screen reader support
- customizable shortcuts

### 13. Auto-Update System

عندك Electron + installer. تحتاج:
- check for updates
- download
- install بدون ما المستخدم يحمّل manually

### 14. Plugin System

مستلهم من PyGPT — القدرة إنك تضيف plugins بدون ما تعدّل الكود الأساسي.

Event-driven architecture (اللي نبنيه في الـ Chat Rewrite) هو الأساس لهذا.

---

## 🚦 الترتيب المقترح

| الأولوية | المرحلة | المهمة | السبب |
|:---------:|:-------:|--------|-------|
| 🔴 الحين | Phase 0 | **Chat Engine Rewrite** | الأساس لكل شي |
| 🟠 بعده مباشرة | Phase 1 | Virtual Scroll + Message Actions | أكبر تحسين UX بأقل جهد بعد الـ rewrite |
| 🟡 قريب | Phase 2 | Settings UI + Multi-Agent View | يخلي التطبيق usable بدون تعديل JSON files |
| 🟢 لاحقاً | Phase 1+2 | File Manager + Search + Export | ميزات quality-of-life |
| 🔵 مستقبلي | Phase 3 | MCP + Knowledge Base + Code Interpreter | يحوّل AEGIS من chat client لـ full IDE |
| ⚪ طويل المدى | Phase 4 | Plugin System + Auto-Update + Theming | production-ready polish |

---

## ⚠️ ملاحظة مهمة

الـ **Chat Engine Rewrite (Phase 0)** هو الاستثمار الأهم لأن كل شي بعده يُبنى فوقه.

بدون RenderBlock pipeline نظيف وRenderers مفصولة، كل ميزة جديدة راح تكون patch فوق patch — نفس المشكلة اللي نبي نحلها الحين.
