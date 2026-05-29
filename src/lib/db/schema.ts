import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// ── Users ────────────────────────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // uuid
  email: text('email').unique().notNull(),
  name: text('name'),
  locale: text('locale').default('en'),
  stripe_customer_id: text('stripe_customer_id'),
  subscription_status: text('subscription_status').default('free'),
  created_at: integer('created_at'),
  updated_at: integer('updated_at'),
});

// ── Auth Tokens ──────────────────────────────────────────────────────────────
export const authTokens = sqliteTable('auth_tokens', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id),
  token: text('token').notNull(),
  expires_at: integer('expires_at').notNull(),
  used: integer('used').default(0),
  created_at: integer('created_at'),
});

// ── Quiz Sessions ────────────────────────────────────────────────────────────
export const quizSessions = sqliteTable('quiz_sessions', {
  id: text('id').primaryKey(), // uuid
  user_id: text('user_id').references(() => users.id),
  answers_json: text('answers_json').notNull(),
  tags_json: text('tags_json'),
  play_profile: text('play_profile'),
  completed: integer('completed').default(0),
  created_at: integer('created_at'),
  updated_at: integer('updated_at'),
});

// ── Activities ───────────────────────────────────────────────────────────────
export const activities = sqliteTable('activities', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  age_min: integer('age_min'),
  age_max: integer('age_max'),
  goal_tags: text('goal_tags'),
  play_style_tags: text('play_style_tags'),
  routine_moment_tags: text('routine_moment_tags'),
  time_minutes: integer('time_minutes'),
  materials: text('materials'),
  location: text('location'),
  energy_level: text('energy_level'),
  steps_json: text('steps_json'),
  parent_script: text('parent_script'),
  fallback_if_refuses: text('fallback_if_refuses'),
  easier_version: text('easier_version'),
  harder_version: text('harder_version'),
  why_it_works: text('why_it_works'),
  safety_note: text('safety_note'),
  category: text('category'),
});

// ── Plans ────────────────────────────────────────────────────────────────────
export const plans = sqliteTable('plans', {
  id: text('id').primaryKey(), // uuid
  user_id: text('user_id').references(() => users.id),
  quiz_session_id: text('quiz_session_id').references(() => quizSessions.id),
  profile_name: text('profile_name'),
  goal: text('goal'),
  plan_json: text('plan_json').notNull(),
  week_number: integer('week_number').default(1),
  active: integer('active').default(1),
  created_at: integer('created_at'),
});

// ── Plan Day Logs ────────────────────────────────────────────────────────────
export const planDayLogs = sqliteTable('plan_day_logs', {
  id: text('id').primaryKey(),
  plan_id: text('plan_id').references(() => plans.id),
  day_number: integer('day_number'),
  activity_id: text('activity_id').references(() => activities.id),
  status: text('status'), // 'pending' | 'done' | 'too_hard' | 'skipped' | 'too_easy'
  completed_at: integer('completed_at'),
});

// ── Payments ─────────────────────────────────────────────────────────────────
export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  user_id: text('user_id').references(() => users.id),
  stripe_session_id: text('stripe_session_id'),
  stripe_subscription_id: text('stripe_subscription_id'),
  amount_cents: integer('amount_cents'),
  currency: text('currency').default('usd'),
  status: text('status'),
  created_at: integer('created_at'),
});

// ── Weekly Check-ins ─────────────────────────────────────────────────────────
export const weeklyCheckins = sqliteTable('weekly_checkins', {
  id: text('id').primaryKey(), // uuid
  user_id: text('user_id').references(() => users.id),
  plan_id: text('plan_id').references(() => plans.id),
  responses_json: text('responses_json'),
  created_at: integer('created_at'),
});

// ── Analytics Events ─────────────────────────────────────────────────────────
// First-party, privacy-conscious website analytics. No IP addresses are stored.
// session_id is an anonymous, client-generated id (localStorage), not tied to PII.
// created_at is stored in milliseconds (Date.now()).
export const analyticsEvents = sqliteTable('analytics_events', {
  id: text('id').primaryKey(),
  user_id: text('user_id'),
  session_id: text('session_id'),
  event_name: text('event_name').notNull(),
  properties_json: text('properties_json'),
  path: text('path'),
  referrer: text('referrer'),
  user_agent: text('user_agent'),
  created_at: integer('created_at'),
});
