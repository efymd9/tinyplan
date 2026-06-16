// Admin-only i18n dictionary.
//
// This is intentionally SEPARATE from the public app i18n (`src/lib/i18n/*`).
// It only powers chrome/labels inside `/admin`, which is not a localized route
// and is never seen by end users. Supported languages: English (default) and
// Russian. Raw analytics data (event names, paths, referrers, user ids, device
// enums, timestamps) is never translated — only UI labels are.

export type AdminLang = "en" | "ru";

export const ADMIN_LANGS: AdminLang[] = ["en", "ru"];
export const DEFAULT_ADMIN_LANG: AdminLang = "en";

export function isAdminLang(value: unknown): value is AdminLang {
  return value === "en" || value === "ru";
}

export interface AdminDict {
  badge: string;
  backToDashboard: string;
  homeAria: string;
  title: string;
  /** aria-label for the language toggle. */
  switchLanguage: string;
  sections: {
    keyMetrics: string;
    conversionFunnel: string;
    dropoffAnalysis: string;
    recentSessions: string;
    quizDropoff: string;
    topAnswers: string;
    pageViews: string;
    trafficSources: string;
    ctaClicks: string;
    deviceBreakdown: string;
    eventBreakdown: string;
    recentEvents: string;
  };
  metrics: {
    totalUsers: string;
    anonSessions: string;
    anonSessionsSub: string;
    plansGenerated: string;
    quizSessions: string;
    purchases: string;
    /** Sub-label under the Purchases metric, e.g. "paying customers". */
    purchasesSub: string;
    quizToPurchase: string;
    maxQuizDepth: string;
    maxQuizDepthSub: string;
    avgQuizDepth: string;
    avgQuizDepthSub: string;
    totalEvents: string;
  };
  funnel: {
    quizStarts: string;
    quizCompletes: string;
    pricingViews: string;
    purchaseStarts: string;
    /** Real purchases (distinct paying customers) — the funnel's final step. */
    purchases: string;
  };
  /** Suffix in the funnel bar, e.g. "-12% dropoff". */
  dropoffSuffix: string;
  /** Word used in "12 lost (40%)" rows. */
  lost: string;
  /** Prefix for a quiz step label, e.g. "Step 5 · ...". */
  step: string;
  empty: {
    dropoffs: string;
    answers: string;
    pageViews: string;
    referrers: string;
    ctas: string;
    devices: string;
    events: string;
    eventsShort: string;
    sessions: string;
  };
  table: {
    event: string;
    user: string;
    properties: string;
    time: string;
  };
  sessions: {
    started: string;
    lastActivity: string;
    events: string;
    device: string;
    source: string;
    user: string;
    quizStep: string;
    referrer: string;
    anonymous: string;
    /** Prefix shown before a logged-in user id chip, e.g. "user 3f2a…". */
    userPrefix: string;
    /** Suffix after a count, e.g. "14 events". */
    eventsWord: string;
    eventTimeline: string;
    /** Leading text of "Ended on /pricing". */
    endedOn: string;
  };
  /** "Users & Sessions" page (/admin/users). */
  usersPage: {
    /** Header nav link to this page from the main dashboard. */
    navLink: string;
    /** Header nav link back to the main dashboard from this page. */
    backToOverview: string;
    title: string;
    subtitle: string;
    registeredUsers: string;
    anonymousSessions: string;
    anonymousSub: string;
    subscription: string;
    joined: string;
    lastActive: string;
    /** Suffix after a session count, e.g. "5 sessions". */
    sessionsWord: string;
    /** Suffix after an event count, e.g. "42 events". */
    eventsWord: string;
    /** Fallback when a user has no name on record. */
    noName: string;
    never: string;
    empty: {
      users: string;
      userSessions: string;
      anonymous: string;
    };
  };
  /** "Incomplete Quizzes" page (/admin/incomplete-quizzes). */
  incompletePage: {
    /** Header nav link to this page from the main dashboard. */
    navLink: string;
    /** Header nav link back to the main dashboard from this page. */
    backToOverview: string;
    title: string;
    subtitle: string;
    /** Suffix after a session count, e.g. "5 sessions". */
    sessionsWord: string;
    anonymous: string;
    /** Prefix for a quiz step label, e.g. "Step 5". */
    step: string;
    /** Column / field label for the inferred quiz question. */
    question: string;
    lastAnswer: string;
    lastActive: string;
    source: string;
    /** Readable labels for known quiz stages; unknown stages fall back to raw. */
    stages: Record<string, string>;
    empty: string;
  };
}

const en: AdminDict = {
  badge: "Admin",
  backToDashboard: "Back to Dashboard",
  homeAria: "TinyPlan home",
  title: "Admin Dashboard",
  switchLanguage: "Switch admin language",
  sections: {
    keyMetrics: "Key Metrics",
    conversionFunnel: "Conversion Funnel",
    dropoffAnalysis: "Dropoff Analysis",
    recentSessions: "Recent Sessions",
    quizDropoff: "Quiz Drop-off (last step before exit)",
    topAnswers: "Top Answers / Pain Points",
    pageViews: "Page Views by Path",
    trafficSources: "Traffic Sources (by session)",
    ctaClicks: "CTA Clicks by Location",
    deviceBreakdown: "Device Breakdown (by session)",
    eventBreakdown: "Event Breakdown",
    recentEvents: "Recent Events",
  },
  metrics: {
    totalUsers: "Total Users",
    anonSessions: "Anon Sessions",
    anonSessionsSub: "distinct visitors",
    plansGenerated: "Plans Generated",
    quizSessions: "Quiz Sessions",
    purchases: "Purchases",
    purchasesSub: "paying customers",
    quizToPurchase: "Quiz → Purchase",
    maxQuizDepth: "Max Quiz Depth",
    maxQuizDepthSub: "deepest step reached",
    avgQuizDepth: "Avg Quiz Depth",
    avgQuizDepthSub: "per session",
    totalEvents: "Total Events",
  },
  funnel: {
    quizStarts: "Quiz Starts",
    quizCompletes: "Quiz Completes",
    pricingViews: "Pricing Views",
    purchaseStarts: "Purchase Starts",
    purchases: "Purchases",
  },
  dropoffSuffix: "dropoff",
  lost: "lost",
  step: "Step",
  empty: {
    dropoffs: "No drop-offs recorded yet.",
    answers: "No quiz answers recorded yet.",
    pageViews: "No page views recorded yet.",
    referrers: "No referrers recorded yet.",
    ctas: "No CTA clicks recorded yet.",
    devices: "No device data recorded yet.",
    events: "No events recorded yet.",
    eventsShort: "No events yet.",
    sessions: "No sessions recorded yet.",
  },
  table: {
    event: "Event",
    user: "User",
    properties: "Properties",
    time: "Time",
  },
  sessions: {
    started: "Started",
    lastActivity: "Last activity",
    events: "Events",
    device: "Device",
    source: "Source",
    user: "User",
    quizStep: "Quiz step",
    referrer: "Referrer",
    anonymous: "anonymous",
    userPrefix: "user",
    eventsWord: "events",
    eventTimeline: "Event timeline",
    endedOn: "Ended on",
  },
  usersPage: {
    navLink: "Users",
    backToOverview: "← Overview",
    title: "Users & Sessions",
    subtitle: "Registered users and the analytics sessions linked to each.",
    registeredUsers: "Registered Users",
    anonymousSessions: "Anonymous / Unassigned Sessions",
    anonymousSub: "Sessions not linked to a registered user.",
    subscription: "Subscription",
    joined: "Joined",
    lastActive: "Last active",
    sessionsWord: "sessions",
    eventsWord: "events",
    noName: "(no name)",
    never: "never",
    empty: {
      users: "No users registered yet.",
      userSessions: "No sessions recorded for this user yet.",
      anonymous: "No anonymous sessions recorded yet.",
    },
  },
  incompletePage: {
    navLink: "Incomplete Quizzes",
    backToOverview: "← Overview",
    title: "Incomplete Quizzes",
    subtitle: "Sessions that started the quiz but never reached completion.",
    sessionsWord: "sessions",
    anonymous: "anonymous",
    step: "Step",
    question: "Question",
    lastAnswer: "Last answer",
    lastActive: "Last active",
    source: "Source",
    stages: {
      "help-moment": "Help moment",
      email: "Email",
      "summary-1": "Summary",
    },
    empty: "No incomplete quizzes recorded yet.",
  },
};

const ru: AdminDict = {
  badge: "Админ",
  backToDashboard: "Назад в панель",
  homeAria: "Главная TinyPlan",
  title: "Панель администратора",
  switchLanguage: "Сменить язык админки",
  sections: {
    keyMetrics: "Ключевые метрики",
    conversionFunnel: "Воронка конверсии",
    dropoffAnalysis: "Анализ оттока",
    recentSessions: "Недавние сессии",
    quizDropoff: "Отток в квизе (последний шаг перед выходом)",
    topAnswers: "Топ ответов / болевые точки",
    pageViews: "Просмотры страниц по пути",
    trafficSources: "Источники трафика (по сессиям)",
    ctaClicks: "Клики по CTA (по расположению)",
    deviceBreakdown: "Разбивка по устройствам (по сессиям)",
    eventBreakdown: "Разбивка по событиям",
    recentEvents: "Недавние события",
  },
  metrics: {
    totalUsers: "Всего пользователей",
    anonSessions: "Анонимные сессии",
    anonSessionsSub: "уникальные посетители",
    plansGenerated: "Создано планов",
    quizSessions: "Сессии квиза",
    purchases: "Покупки",
    purchasesSub: "платящие клиенты",
    quizToPurchase: "Квиз → Покупка",
    maxQuizDepth: "Макс. глубина квиза",
    maxQuizDepthSub: "самый дальний шаг",
    avgQuizDepth: "Средняя глубина квиза",
    avgQuizDepthSub: "на сессию",
    totalEvents: "Всего событий",
  },
  funnel: {
    quizStarts: "Начатые квизы",
    quizCompletes: "Завершённые квизы",
    pricingViews: "Просмотры цен",
    purchaseStarts: "Начатые покупки",
    purchases: "Покупки",
  },
  dropoffSuffix: "отток",
  lost: "потеряно",
  step: "Шаг",
  empty: {
    dropoffs: "Отток пока не зафиксирован.",
    answers: "Ответов в квизе пока нет.",
    pageViews: "Просмотров страниц пока нет.",
    referrers: "Источников переходов пока нет.",
    ctas: "Кликов по CTA пока нет.",
    devices: "Данных об устройствах пока нет.",
    events: "Событий пока нет.",
    eventsShort: "Событий пока нет.",
    sessions: "Сессий пока нет.",
  },
  table: {
    event: "Событие",
    user: "Пользователь",
    properties: "Свойства",
    time: "Время",
  },
  sessions: {
    started: "Начало",
    lastActivity: "Последняя активность",
    events: "События",
    device: "Устройство",
    source: "Источник",
    user: "Пользователь",
    quizStep: "Шаг квиза",
    referrer: "Реферер",
    anonymous: "аноним",
    userPrefix: "польз.",
    eventsWord: "событий",
    eventTimeline: "Хронология событий",
    endedOn: "Завершено на",
  },
  usersPage: {
    navLink: "Пользователи",
    backToOverview: "← Обзор",
    title: "Пользователи и сессии",
    subtitle: "Зарегистрированные пользователи и связанные с каждым аналитические сессии.",
    registeredUsers: "Зарегистрированные пользователи",
    anonymousSessions: "Анонимные / непривязанные сессии",
    anonymousSub: "Сессии, не привязанные к зарегистрированному пользователю.",
    subscription: "Подписка",
    joined: "Регистрация",
    lastActive: "Последняя активность",
    sessionsWord: "сессий",
    eventsWord: "событий",
    noName: "(без имени)",
    never: "никогда",
    empty: {
      users: "Пользователей пока нет.",
      userSessions: "Для этого пользователя сессий пока нет.",
      anonymous: "Анонимных сессий пока нет.",
    },
  },
  incompletePage: {
    navLink: "Незавершённые квизы",
    backToOverview: "← Обзор",
    title: "Незавершённые квизы",
    subtitle: "Сессии, начавшие квиз, но не дошедшие до завершения.",
    sessionsWord: "сессий",
    anonymous: "аноним",
    step: "Шаг",
    question: "Вопрос",
    lastAnswer: "Последний ответ",
    lastActive: "Последняя активность",
    source: "Источник",
    stages: {
      "help-moment": "Момент помощи",
      email: "Эл. почта",
      "summary-1": "Сводка",
    },
    empty: "Незавершённых квизов пока нет.",
  },
};

const DICTS: Record<AdminLang, AdminDict> = { en, ru };

export function getAdminDict(lang: AdminLang): AdminDict {
  return DICTS[lang] ?? en;
}
