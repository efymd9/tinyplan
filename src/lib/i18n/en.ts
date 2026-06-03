export const en = {
  common: {
    appName: "TinyPlan",
    loading: "Loading...",
    error: "Something went wrong",
    retry: "Try again",
    cancel: "Cancel",
    save: "Save",
    saved: "Saved",
    back: "Back",
    next: "Next",
    previous: "Previous",
    done: "Done",
    skip: "Skip",
    close: "Close",
    continue: "Continue",
    logOut: "Log out",
    search: "Search",
    getStarted: "Get started",
    learnMore: "Learn more",
    yes: "Yes",
    no: "No",
    minutes: "minutes",
    min: "min",
    day: "Day",
    week: "Week",
    of: "of",
    today: "Today",
    clearFilters: "Clear filters",
  },
  nav: {
    today: "Today",
    week: "Week",
    sos: "SOS",
    library: "Library",
    progress: "Progress",
  },
  dashboard: {
    today: {
      title: "Today's Activity",
      noPlan: "No plan yet",
      noPlanDesc: "Take the quiz to get your personalized weekly plan.",
      startQuiz: "Start Quiz",
      markDone: "Done!",
      tooHard: "Too hard",
      tooEasy: "Too easy",
      skipped: "Skip",
      completed: "Completed",
      minutesLabel: "min",
      parentScript: "What to say",
      materials: "You'll need",
      steps: "How to play",
      fallback: "If they refuse",
      whyItWorks: "Why it works",
      weekComplete: "Week complete!",
      weekCompleteDesc: "You finished all 7 days. A new week will be generated soon.",
    },
    week: {
      title: "This Week",
      dayLabel: "Day",
      profile: "Play Profile",
      goal: "This Week's Goal",
      today: "Today",
      done: "Done",
    },
    sos: {
      title: "SOS",
      subtitle: "Quick help for tough moments",
    },
    library: {
      title: "Activity Library",
      searchPlaceholder: "Search activities...",
      noActivities: "No activities yet. Activities appear after your plan is generated.",
      filterAll: "All",
      minutes: "min",
    },
    progress: {
      title: "Progress",
      thisWeek: "This Week",
      activitiesDone: "Activities Done",
      currentStreak: "Day Streak",
      days: "days",
      completionRate: "Completion",
      noData: "Complete activities to see your progress.",
    },
    account: {
      manageSubscription: "Manage subscription",
      openingPortal: "Opening...",
      noBillingAccount: "No billing account yet",
    },
  },
  errors: {
    generic: "Something went wrong. Please try again.",
    network: "Connection problem. Check your internet and try again.",
    notFound: "We couldn't find what you were looking for.",
    sessionExpired: "Your session has expired. Please log in again.",
    tryAgain: "Try again",
  },
  admin: {
    title: "Admin Dashboard",
    funnel: "Conversion Funnel",
    quizStarts: "Quiz Starts",
    quizCompletes: "Quiz Completes",
    pricingViews: "Pricing Views",
    purchases: "Purchases",
    plansGenerated: "Plans Generated",
    activeUsers: "Active Users",
    totalUsers: "Total Users",
    conversionRate: "Quiz → Purchase",
    dropoff: "Dropoff Analysis",
    recentEvents: "Recent Events",
    activityUsage: "Top Activities",
    noData: "No data yet.",
  },
} as const;

/**
 * Widen the `as const` literal types of `en` into plain `string`s while keeping
 * the exact nested key structure. This makes `Dictionary` the single source of
 * the dictionary shape (derived from `en`) yet lets `es.ts` provide translated
 * values that still satisfy the type. A missing/extra key remains a compile error.
 */
type Widen<T> = T extends string
  ? string
  : { [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof en>;
