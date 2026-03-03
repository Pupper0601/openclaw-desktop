# AEGIS Calendar v2.0 — خطة إعادة البناء الشاملة

> **المشروع:** AEGIS Desktop v5.4.1
> **التاريخ:** 2026-03-03
> **الهدف:** تقويم احترافي متكامل مع OpenClaw Cron للتنبيهات

---

## 🎯 الرؤية

التقويم الحالي هيكل أساسي — يعرض أحداث ويتنقل بين Month/Week/Day. الهدف هو تحويله لنظام تقويم كامل يكون:

1. **متكامل مع OpenClaw** — الأحداث تُخزن في ذاكرة الوكيل ويقدر يقرأها ويعدلها
2. **مربوط بـ Cron** — كل حدث له تذكير يشتغل كـ cron job حقيقي عبر Gateway
3. **ثنائي اللغة بالكامل** — عربي/إنجليزي عبر i18n بدون أي نص hardcoded
4. **يدعم التقويم الهجري** — عرض مزدوج ميلادي/هجري
5. **بمستوى باقي صفحات AEGIS** — نفس جودة CronMonitor و Dashboard

---

## 🏗️ المعمارية الجديدة

### هيكل الملفات

```
src/
├── pages/Calendar/
│   ├── index.tsx              ← الصفحة الرئيسية (toolbar + layout + sidebar)
│   ├── MonthView.tsx          ← عرض الشهر (grid)
│   ├── WeekView.tsx           ← عرض الأسبوع (timeline)
│   ├── DayView.tsx            ← عرض اليوم (timeline + detail)
│   ├── EventModal.tsx         ← إضافة / تعديل / حذف حدث
│   ├── EventCard.tsx          ← [جديد] بطاقة حدث قابلة لإعادة الاستخدام
│   ├── MiniCalendar.tsx       ← [جديد] تقويم مصغر منفصل (sidebar)
│   ├── UpcomingEvents.tsx     ← [جديد] قائمة الأحداث القادمة منفصلة
│   ├── ReminderBadge.tsx      ← [جديد] شارة حالة التذكير (cron status)
│   ├── calendarUtils.ts       ← المساعدات (dates, formatting, hijri)
│   └── calendarTypes.ts       ← [جديد] كل الأنواع في ملف واحد
│
├── stores/
│   └── calendarStore.ts       ← إعادة بناء كاملة
│
├── services/gateway/
│   └── index.ts               ← إضافة calendar + cron methods
│
├── locales/
│   ├── ar.json                ← إضافة section "calendar" كامل
│   └── en.json                ← إضافة section "calendar" كامل
│
└── types/
    └── global.d.ts            ← إضافة Calendar IPC types
```

---

### مصادر البيانات (Data Flow)

```
┌─────────────────────────────────────────────────────┐
│                    AEGIS Calendar                     │
│                                                       │
│  ┌──────────────┐    ┌──────────────┐                │
│  │ calendarStore │◄───│  Gateway WS  │                │
│  │              │    │  (events)    │                │
│  └──────┬───────┘    └──────────────┘                │
│         │                                             │
│         ▼                                             │
│  ┌──────────────────────────────────────────┐        │
│  │           3 مصادر للأحداث:                │        │
│  │                                          │        │
│  │  1. LOCAL (localStorage/JSON)            │        │
│  │     → أحداث أنشأها المستخدم يدوياً        │        │
│  │     → محفوظة محلياً                       │        │
│  │                                          │        │
│  │  2. MEMORY (OpenClaw Agent Memory)       │        │
│  │     → gateway.call('chat.send', {        │        │
│  │         message: 'list my calendar'      │        │
│  │       })                                 │        │
│  │     → الوكيل يقرأ MEMORY.md ويرجع       │        │
│  │       الأحداث كـ JSON                    │        │
│  │                                          │        │
│  │  3. ICS IMPORT (اختياري)                 │        │
│  │     → import من Google Calendar/Outlook  │        │
│  │     → ملف .ics يتحول لأحداث محلية       │        │
│  │                                          │        │
│  └──────────────────────────────────────────┘        │
│         │                                             │
│         ▼                                             │
│  ┌──────────────────────────────────────────┐        │
│  │         نظام التذكيرات (Cron)             │        │
│  │                                          │        │
│  │  كل حدث له reminder = cron job          │        │
│  │  يُنشأ عبر: gateway.call('cron.add', {  │        │
│  │    schedule: { kind: 'at', at: ... },    │        │
│  │    payload: { kind: 'agentTurn',         │        │
│  │      message: 'remind about: ...'        │        │
│  │    },                                    │        │
│  │    sessionTarget: 'isolated'             │        │
│  │  })                                      │        │
│  │                                          │        │
│  │  النتيجة: OpenClaw يشغل الوكيل          │        │
│  │  بالوقت المحدد → يرسل تنبيه للمستخدم    │        │
│  └──────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────┘
```

---

## 📋 الخطة التفصيلية — 7 مراحل

---

### المرحلة 1: الأنواع والبنية التحتية
**المدة:** نصف يوم
**الأولوية:** 🔴 حرجة

#### 1.1 — `calendarTypes.ts` (ملف جديد)

```typescript
// ═══════════════════════════════════════════════════════════
// Calendar Types — Single source of truth
// ═══════════════════════════════════════════════════════════

export type EventCategory = 'work' | 'personal' | 'health' | 'social' | 'education' | 'other';
export type EventSource = 'local' | 'memory' | 'ics';
export type ReminderStatus = 'pending' | 'scheduled' | 'fired' | 'failed' | 'none';
export type RecurrenceFreq = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CalendarEvent {
  id: string;
  title: string;

  // التوقيت
  date: string;           // YYYY-MM-DD
  startTime?: string;     // HH:MM (بدونه = all-day)
  endTime?: string;       // HH:MM (بدونه = ساعة واحدة افتراضي)
  allDay: boolean;

  // التفاصيل
  location?: string;
  notes?: string;
  category: EventCategory;
  color?: string;         // override لون التصنيف

  // المصدر
  source: EventSource;
  externalId?: string;    // Notion ID / ICS UID / Memory ref

  // التذكير
  reminderMinutes: number;       // 0 = بدون تذكير
  reminderCronJobId?: string;    // ربط بـ OpenClaw cron job
  reminderStatus: ReminderStatus;

  // التكرار
  recurrence?: {
    freq: RecurrenceFreq;
    interval: number;      // كل 1 أسبوع, كل 2 شهر...
    until?: string;        // YYYY-MM-DD
    count?: number;        // أو عدد مرات
    byDay?: number[];      // أيام الأسبوع [0=أحد..6=سبت]
    exceptions?: string[]; // تواريخ مستثناة
  };

  // Meta
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CalendarFilter {
  categories: EventCategory[];
  sources: EventSource[];
  search: string;
  showCompleted: boolean;
}

export interface CalendarSettings {
  weekStartDay: 0 | 6;       // 0=أحد (EN), 6=سبت (AR)
  showHijri: boolean;
  defaultView: 'month' | 'week' | 'day';
  defaultReminder: number;    // دقائق
  timelineStart: number;      // ساعة البداية (default 0)
  timelineEnd: number;        // ساعة النهاية (default 23)
  showWeekNumbers: boolean;
}
```

#### 1.2 — تحديث `global.d.ts`

```typescript
// داخل AegisAPI interface:
calendar: {
  getEvents: () => Promise<CalendarEvent[]>;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; id: string }>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<{ success: boolean }>;
  deleteEvent: (id: string) => Promise<{ success: boolean }>;
  importICS: (filePath: string) => Promise<{ events: CalendarEvent[]; count: number }>;
  exportICS: (events: CalendarEvent[]) => Promise<{ filePath: string }>;
};
```

#### 1.3 — إضافة calendar methods في `gateway/index.ts`

```typescript
// Calendar-specific cron operations
async addCalendarReminder(event: CalendarEvent) {
  if (event.reminderMinutes <= 0) return null;

  const eventDate = new Date(`${event.date}T${event.startTime || '00:00'}:00`);
  const reminderDate = new Date(eventDate.getTime() - event.reminderMinutes * 60000);

  // لا تسوي cron لموعد في الماضي
  if (reminderDate.getTime() <= Date.now()) return null;

  return connection.request('cron.add', {
    name: `📅 ${event.title}`,
    schedule: {
      kind: 'at',
      at: reminderDate.toISOString(),
    },
    payload: {
      kind: 'agentTurn',
      message: [
        `⏰ تذكير: ${event.title}`,
        event.startTime ? `الوقت: ${event.startTime}` : 'طوال اليوم',
        event.location ? `المكان: ${event.location}` : '',
        event.notes ? `ملاحظات: ${event.notes}` : '',
        '',
        'أرسل هذا التذكير للمستخدم عبر القنوات المتاحة (تيليجرام/ديسكورد/واتساب).',
      ].filter(Boolean).join('\n'),
    },
    sessionTarget: 'isolated',
    enabled: true,
  });
},

async removeCalendarReminder(cronJobId: string) {
  return connection.request('cron.remove', { id: cronJobId });
},

async updateCalendarReminder(cronJobId: string, event: CalendarEvent) {
  // حذف القديم وإنشاء جديد (أبسط وأضمن)
  await this.removeCalendarReminder(cronJobId);
  return this.addCalendarReminder(event);
},

async syncCalendarWithMemory() {
  // يطلب من الوكيل يقرأ الأحداث من ذاكرته
  return connection.request('chat.send', {
    sessionKey: 'isolated',
    message: [
      'اقرأ ملف MEMORY.md وأي ملفات calendar في مجلد memory/',
      'استخرج كل المواعيد والأحداث القادمة.',
      'أرجعها كـ JSON array بالتنسيق التالي فقط بدون أي نص إضافي:',
      '[{"title":"...","date":"YYYY-MM-DD","startTime":"HH:MM","category":"work|personal|health|social|education|other","location":"...","notes":"..."}]',
    ].join('\n'),
    idempotencyKey: `cal-sync-${Date.now()}`,
  });
},
```

---

### المرحلة 2: نظام الترجمة الكامل (i18n)
**المدة:** نصف يوم
**الأولوية:** 🔴 حرجة

#### 2.1 — إضافة في `ar.json`

```json
"calendar": {
  "title": "التقويم",
  "today": "اليوم",
  "month": "شهر",
  "week": "أسبوع",
  "day": "يوم",
  "addEvent": "إضافة موعد",
  "editEvent": "تعديل الموعد",
  "newEvent": "موعد جديد",
  "deleteEvent": "حذف الموعد",
  "deleteConfirm": "هل أنت متأكد من حذف هذا الموعد؟",
  "upcoming": "المواعيد القادمة",
  "noUpcoming": "لا مواعيد قادمة",
  "noEvents": "لا مواعيد",
  "allDay": "طوال اليوم",
  "loading": "جاري التحميل...",
  "moreEvents": "+{{n}} أخرى",
  "daySummary": "ملخص اليوم",
  "eventCount": "{{count}} موعد",
  "untitled": "بدون عنوان",

  "field": {
    "title": "العنوان",
    "titlePlaceholder": "اسم الموعد...",
    "date": "التاريخ",
    "startTime": "وقت البداية",
    "endTime": "وقت النهاية",
    "location": "الموقع",
    "locationPlaceholder": "اختياري...",
    "notes": "ملاحظات",
    "notesPlaceholder": "أضف ملاحظات...",
    "category": "التصنيف",
    "reminder": "التذكير",
    "recurrence": "التكرار",
    "source": "المصدر"
  },

  "category": {
    "work": "🏢 عمل",
    "personal": "🏠 شخصي",
    "health": "🏥 صحة",
    "social": "👥 اجتماعي",
    "education": "📚 تعليم",
    "other": "📌 أخرى"
  },

  "reminder": {
    "none": "بدون تذكير",
    "5min": "قبل 5 دقائق",
    "15min": "قبل 15 دقيقة",
    "30min": "قبل 30 دقيقة",
    "1hour": "قبل ساعة",
    "2hours": "قبل ساعتين",
    "1day": "قبل يوم",
    "1week": "قبل أسبوع",
    "status": "حالة التذكير",
    "scheduled": "مجدول ✓",
    "pending": "في الانتظار",
    "fired": "تم الإرسال ✓",
    "failed": "فشل ✗",
    "cronLinked": "مربوط بـ Cron Job"
  },

  "recurrence": {
    "none": "لا يتكرر",
    "daily": "يومياً",
    "weekly": "أسبوعياً",
    "monthly": "شهرياً",
    "yearly": "سنوياً",
    "every": "كل",
    "until": "حتى",
    "times": "مرات",
    "custom": "مخصص"
  },

  "hijri": {
    "toggle": "عرض الهجري",
    "format": "{{hijri}} هـ"
  },

  "source": {
    "local": "محلي",
    "memory": "ذاكرة الوكيل",
    "ics": "مستورد (ICS)"
  },

  "sync": {
    "syncMemory": "مزامنة مع الذاكرة",
    "syncing": "جاري المزامنة...",
    "syncSuccess": "تم مزامنة {{count}} موعد",
    "syncFailed": "فشلت المزامنة",
    "importICS": "استيراد ICS",
    "exportICS": "تصدير ICS"
  },

  "actions": {
    "save": "حفظ",
    "cancel": "إلغاء",
    "delete": "حذف",
    "edit": "تعديل",
    "duplicate": "نسخ",
    "markComplete": "إكمال",
    "saving": "جاري الحفظ..."
  },

  "settings": {
    "weekStart": "بداية الأسبوع",
    "saturday": "السبت",
    "sunday": "الأحد",
    "monday": "الاثنين",
    "showHijri": "عرض التقويم الهجري",
    "defaultReminder": "التذكير الافتراضي",
    "defaultView": "العرض الافتراضي"
  },

  "weekday": {
    "sat": "سبت",
    "sun": "أحد",
    "mon": "اثنين",
    "tue": "ثلاثاء",
    "wed": "أربعاء",
    "thu": "خميس",
    "fri": "جمعة"
  },

  "month": {
    "jan": "يناير", "feb": "فبراير", "mar": "مارس",
    "apr": "أبريل", "may": "مايو", "jun": "يونيو",
    "jul": "يوليو", "aug": "أغسطس", "sep": "سبتمبر",
    "oct": "أكتوبر", "nov": "نوفمبر", "dec": "ديسمبر"
  }
}
```

#### 2.2 — إضافة في `en.json` (نفس الهيكل بالإنجليزي)

> كل المفاتيح نفسها — القيم بالإنجليزي

---

### المرحلة 3: إعادة بناء calendarStore
**المدة:** يوم واحد
**الأولوية:** 🔴 حرجة

#### 3.1 — `calendarStore.ts` الجديد

**المسؤوليات:**

| الوظيفة | الشرح |
|---------|-------|
| `events` | مصفوفة الأحداث الموحّدة من كل المصادر |
| `settings` | إعدادات التقويم (بداية الأسبوع, هجري, default view) |
| `filter` | فلترة حسب التصنيف والمصدر والبحث |
| `selectedDate` | التاريخ المحدد حالياً |
| `view` | العرض الحالي (month/week/day) |
| `fetchEvents()` | جلب الأحداث (local + IPC + memory) |
| `addEvent()` | إضافة حدث + إنشاء cron reminder |
| `updateEvent()` | تعديل حدث + تحديث cron reminder |
| `deleteEvent()` | حذف حدث + حذف cron reminder |
| `syncWithMemory()` | مزامنة الأحداث من ذاكرة الوكيل |
| `importICS()` | استيراد ملف ICS |
| `navigate()` | التنقل (شهر/أسبوع/يوم) |

**العلاقة مع Gateway:**

```
addEvent() ──┬──► localStorage.setItem('aegis-calendar-events', ...)
             │
             └──► gateway.addCalendarReminder(event)
                    │
                    └──► gateway.call('cron.add', {
                           schedule: { kind: 'at', at: reminderDate },
                           payload: { kind: 'agentTurn', message: '⏰ ...' },
                           sessionTarget: 'isolated'
                         })
                           │
                           └──► يرجع cronJobId
                                  │
                                  └──► event.reminderCronJobId = cronJobId
                                       event.reminderStatus = 'scheduled'
```

**التخزين المحلي:**

الأحداث المحلية تُخزن في `localStorage` بمفتاح `aegis-calendar-events` كـ JSON array. هذا يضمن بقاء الأحداث حتى بدون اتصال بالـ Gateway. عند الاتصال، يتحقق الـ store من حالة الـ cron jobs المرتبطة ويحدّث `reminderStatus`.

#### 3.2 — Cron Integration Logic

```typescript
// داخل calendarStore:

addEvent: async (eventData) => {
  // 1. إنشاء الحدث محلياً
  const event: CalendarEvent = {
    ...eventData,
    id: `cal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    source: 'local',
    reminderStatus: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 2. حفظ محلياً أولاً (offline-first)
  set(s => ({ events: [...s.events, event] }));
  persistEvents(get().events);

  // 3. إنشاء cron job للتذكير (لو متصل)
  if (event.reminderMinutes > 0 && chatStore.getState().connected) {
    try {
      const result = await gateway.addCalendarReminder(event);
      if (result?.id) {
        const updated = { ...event, reminderCronJobId: result.id, reminderStatus: 'scheduled' as const };
        set(s => ({
          events: s.events.map(e => e.id === event.id ? updated : e)
        }));
        persistEvents(get().events);
      }
    } catch (err) {
      console.error('[Calendar] Failed to create cron reminder:', err);
      // الحدث يظل محفوظ — التذكير يتعاد لاحقاً
    }
  }

  return event;
},

// عند الاتصال مجدداً — مزامنة التذكيرات المعلقة
syncPendingReminders: async () => {
  const { events } = get();
  const pending = events.filter(e =>
    e.reminderMinutes > 0 &&
    e.reminderStatus === 'pending' &&
    !e.reminderCronJobId
  );

  for (const event of pending) {
    try {
      const result = await gateway.addCalendarReminder(event);
      if (result?.id) {
        set(s => ({
          events: s.events.map(e =>
            e.id === event.id
              ? { ...e, reminderCronJobId: result.id, reminderStatus: 'scheduled' }
              : e
          )
        }));
      }
    } catch { /* retry next sync */ }
  }
  persistEvents(get().events);
},
```

---

### المرحلة 4: إعادة بناء الـ Views
**المدة:** يومين
**الأولوية:** 🟡 متوسطة

#### 4.1 — `calendarUtils.ts` — التحديثات

| الإضافة | الشرح |
|---------|-------|
| `getWeekOrder(lang)` | ترتيب الأيام حسب اللغة (سبت-أول للعربي، أحد-أول للإنجليزي) |
| `firstDayOffset(year, month, weekStart)` | يقبل يوم البداية كـ parameter |
| `toHijriDate(gregorianDate)` | تحويل ميلادي → هجري باستخدام `Intl.DateTimeFormat` |
| `formatHijri(date, locale)` | تنسيق التاريخ الهجري |
| `parseICSFile(content)` | تحويل ملف ICS → CalendarEvent[] |
| `generateICSFile(events)` | تحويل CalendarEvent[] → محتوى ICS |
| `getEventDuration(event)` | حساب المدة بالدقائق |
| `detectOverlaps(events)` | كشف الأحداث المتداخلة + إرجاع layout columns |
| `expandRecurrence(event, rangeStart, rangeEnd)` | توليد instances من حدث متكرر |
| `formatTimeLocalized(time, locale)` | تنسيق الوقت حسب اللغة |

#### 4.2 — `MonthView.tsx` — التعديلات

- `WEEK_ORDER` → `getWeekOrder(i18n.language)` (ديناميكي)
- `borderRight` → `borderInlineStart` (RTL fix)
- عرض التاريخ الهجري كرقم صغير تحت الميلادي (لو `showHijri`)
- all-day events بار فوق الخلية
- الضغط على حدث → يفتح EventModal بوضع التعديل
- hover tooltip يعرض تفاصيل الحدث
- أحداث متعددة الأيام تمتد عبر الخلايا (multi-day span)
- color coding حسب ReminderStatus (أخضر = scheduled, أصفر = pending, أحمر = failed)

#### 4.3 — `WeekView.tsx` — التعديلات

- Timeline ديناميكي (0:00-23:00 أو حسب الإعدادات)
- **Event duration حقيقي** — الطول يتناسب مع المدة الفعلية
- **Overlap detection** — أحداث متداخلة تعرض جنب بعض (columns)
- All-day events bar فوق الـ timeline
- `borderInlineStart` بدل `borderRight`
- Drag & Drop لتغيير الوقت/اليوم
- Current time indicator يتحدث كل دقيقة (مو كل mount فقط)
- الضغط على حدث → EventModal (edit mode)
- الضغط على خلية فاضية → EventModal (new, pre-filled time)

#### 4.4 — `DayView.tsx` — التعديلات

- نفس تعديلات WeekView (duration, overlap, drag)
- Sidebar اليمين يعرض:
  - ملخص اليوم (عدد الأحداث، إجمالي الساعات)
  - قائمة الأحداث مع حالة التذكير
  - التاريخ الهجري
  - أحداث بدون وقت (all-day)

#### 4.5 — `EventCard.tsx` (جديد) — Component قابل لإعادة الاستخدام

```typescript
// يُستخدم في MonthView, WeekView, DayView, UpcomingEvents
interface EventCardProps {
  event: CalendarEvent;
  compact?: boolean;      // MonthView = compact, DayView = full
  showReminder?: boolean; // يعرض شارة حالة التذكير
  onClick?: () => void;
  onDragStart?: () => void;
}
```

---

### المرحلة 5: نظام التذكيرات المتكامل مع Cron
**المدة:** يوم واحد
**الأولوية:** 🔴 حرجة (الميزة الرئيسية)

#### 5.1 — كيف يشتغل التذكير

```
المستخدم يضيف حدث
    │
    ▼
EventModal → calendarStore.addEvent()
    │
    ├──► 1. حفظ في localStorage
    │
    └──► 2. gateway.call('cron.add', {
              name: '📅 اجتماع فريق التطوير',
              schedule: {
                kind: 'at',
                at: '2026-03-04T09:30:00Z'  ← (وقت الحدث - 30 دقيقة)
              },
              payload: {
                kind: 'agentTurn',
                message: `
                  ⏰ تذكير بعد 30 دقيقة:
                  📌 اجتماع فريق التطوير
                  🕐 10:00
                  📍 Teams
                  
                  أرسل هذا التذكير للمستخدم عبر القنوات المتاحة.
                  اذكر الوقت المتبقي والموقع.
                `
              },
              sessionTarget: 'isolated'
           })
           │
           ▼
    OpenClaw Gateway يحفظ الـ cron job
           │
           ▼
    عند الوقت المحدد → Gateway يشغّل isolated session
           │
           ▼
    Claude يرسل التذكير عبر:
    ├── تيليجرام (لو مفعّل)
    ├── ديسكورد (لو مفعّل)
    ├── واتساب (لو مفعّل)
    └── AEGIS Desktop notification
```

#### 5.2 — `ReminderBadge.tsx` (جديد)

يعرض حالة التذكير على كل حدث:
- 🟢 `scheduled` — مجدول في Cron
- 🟡 `pending` — في الانتظار (غير متصل أو ما انحفظ بعد)
- ✅ `fired` — تم إرسال التذكير
- 🔴 `failed` — فشل التذكير
- ⚫ `none` — بدون تذكير

يضغط عليه المستخدم → يعرض:
- الـ cron job ID
- وقت التذكير المجدول
- حالة التوصيل (delivered/failed)
- زر "إعادة جدولة" لو فشل

#### 5.3 — مزامنة حالة التذكيرات

```typescript
// يشتغل كل 60 ثانية (أو عند عودة الاتصال)
syncReminderStatuses: async () => {
  const { events } = get();
  const cronJobs = useGatewayDataStore.getState().cronJobs;

  const updates = events.map(event => {
    if (!event.reminderCronJobId) return event;

    const cronJob = cronJobs.find(j => j.id === event.reminderCronJobId);
    if (!cronJob) {
      // الـ cron job ما موجود — يمكن اتحذف أو انتهى
      return { ...event, reminderStatus: 'fired' as const };
    }

    // تحقق من حالة التشغيل
    const runStatus = cronJob.state?.lastRunStatus || cronJob.state?.lastStatus;
    if (runStatus === 'ok') return { ...event, reminderStatus: 'fired' as const };
    if (runStatus === 'error') return { ...event, reminderStatus: 'failed' as const };

    return event;
  });

  set({ events: updates });
  persistEvents(updates);
},
```

#### 5.4 — التذكيرات المتكررة

للأحداث المتكررة، يُنشأ cron job بجدول متكرر بدل `at`:

```typescript
// حدث أسبوعي كل أحد 10:00
schedule: {
  kind: 'cron',
  expr: '30 9 * * 0',    // 9:30 (30 دقيقة قبل 10:00)
  tz: 'Asia/Riyadh'
}
```

---

### المرحلة 6: التقويم الهجري والـ RTL
**المدة:** نصف يوم
**الأولوية:** 🟡 متوسطة

#### 6.1 — التقويم الهجري

```typescript
export function toHijriDate(date: Date): { year: number; month: number; day: number; monthName: string } {
  const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const parts = formatter.formatToParts(date);
  return {
    year: Number(parts.find(p => p.type === 'year')?.value || 0),
    month: Number(parts.find(p => p.type === 'month')?.value || 0),
    day: Number(parts.find(p => p.type === 'day')?.value || 0),
    monthName: parts.find(p => p.type === 'month')?.value || '',
  };
}
```

**العرض:**
- MonthView: رقم هجري صغير (بلون خافت) تحت الرقم الميلادي
- Header: `مارس 2026 / رمضان 1447`
- DayView sidebar: التاريخ الهجري الكامل
- EventModal: عرض التاريخ الهجري بجانب date picker

#### 6.2 — إصلاحات RTL الشاملة

| العنصر | القديم | الجديد |
|--------|--------|--------|
| Event border | `borderRight` | `borderInlineStart` |
| Navigation arrows | ثابتة | تنعكس في RTL (ChevronRight ↔ ChevronLeft) |
| Sidebar position | يمين ثابت | `border-l` → `border-inline-start` |
| Time labels | `en-US` ثابت | حسب `i18n.language` |
| Week order | Saturday ثابت | حسب `calendarSettings.weekStartDay` |

---

### المرحلة 7: Keyboard Navigation + Command Palette + Prefetch
**المدة:** نصف يوم
**الأولوية:** 🔵 تحسينات

#### 7.1 — Keyboard Shortcuts

| Shortcut | الوظيفة |
|----------|---------|
| `←` / `→` | التنقل (يوم/أسبوع/شهر حسب العرض) |
| `T` | الرجوع لليوم |
| `M` | عرض الشهر |
| `W` | عرض الأسبوع |
| `D` | عرض اليوم |
| `N` | إضافة حدث جديد |
| `Escape` | إغلاق Modal |
| `H` | تبديل عرض الهجري |
| `Enter` (على حدث) | فتح التعديل |
| `Delete` (على حدث) | حذف بتأكيد |

#### 7.2 — Command Palette Integration

إضافة في CommandPalette:

```typescript
{ id: 'cal-open', label: isAr ? 'فتح التقويم' : 'Open Calendar', action: () => navigate('/calendar'), icon: CalendarDays },
{ id: 'cal-add', label: isAr ? 'إضافة موعد' : 'Add Event', action: () => { navigate('/calendar'); openEventModal(); }, icon: Plus },
{ id: 'cal-today', label: isAr ? 'اذهب لليوم' : 'Go to Today', action: () => { navigate('/calendar'); goToToday(); }, icon: CalIcon },
{ id: 'cal-sync', label: isAr ? 'مزامنة التقويم' : 'Sync Calendar', action: () => syncWithMemory(), icon: RefreshCw },
```

#### 7.3 — NavSidebar Prefetch

```typescript
const PREFETCH_MAP: Record<string, () => void> = {
  '/chat': () => import('@/pages/ChatPage'),
  '/costs': () => import('@/pages/FullAnalytics'),
  '/cron': () => import('@/pages/CronMonitor'),
  '/terminal': () => import('@/pages/TerminalPage'),
  '/calendar': () => import('@/pages/Calendar'),    // ← إضافة
};
```

---

## 📊 ملخص المراحل

| المرحلة | المحتوى | المدة | الأولوية |
|---------|---------|-------|----------|
| 1 | الأنواع + البنية التحتية + Gateway methods | نصف يوم | 🔴 |
| 2 | نظام الترجمة الكامل (i18n) | نصف يوم | 🔴 |
| 3 | إعادة بناء calendarStore + Cron integration | يوم | 🔴 |
| 4 | إعادة بناء Views (Month/Week/Day) | يومين | 🟡 |
| 5 | نظام التذكيرات المتكامل | يوم | 🔴 |
| 6 | التقويم الهجري + RTL fixes | نصف يوم | 🟡 |
| 7 | Keyboard + Command Palette + Prefetch | نصف يوم | 🔵 |
| **الإجمالي** | | **~6 أيام** | |

---

## 🔑 النقاط الحرجة

### لماذا `cron.add` بدل notification عادي؟

تذكير عادي (setTimeout في الـ renderer) **يموت** لما المستخدم يقفل التطبيق. لكن cron job في OpenClaw Gateway:
- يشتغل حتى لو AEGIS Desktop مقفل
- الوكيل يرسل التذكير عبر **كل القنوات** (تيليجرام، ديسكورد، واتساب)
- يقدر **يتفاعل** — يسأل "تبي أأجل الموعد؟"
- يظهر في CronMonitor ويقدر تراقبه
- يسجل في Activity Log

### لماذا localStorage بدل IPC فقط؟

**Offline-first:** المستخدم يقدر يضيف أحداث حتى لو الـ Gateway مو متصل. لما يتصل → الـ store يزامن التذكيرات المعلقة تلقائياً.

### لماذا مصادر متعددة؟

| المصدر | متى يُستخدم |
|--------|-------------|
| `local` | المستخدم يضيف يدوياً من الـ UI |
| `memory` | الوكيل يذكر مواعيد في المحادثة → تُستخرج من MEMORY.md |
| `ics` | المستخدم يستورد من Google Calendar / Outlook |

هذا يعطي مرونة — الوكيل يقدر "يضيف" مواعيد للتقويم من المحادثة، والمستخدم يقدر يستورد تقويمه الحالي.

---

*نهاية الخطة*
