import { integer, pgTable, serial, text, timestamp, date } from "drizzle-orm/pg-core"

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  columnKey: text("column_key").notNull(),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const cardComments = pgTable("card_comments", {
  id: serial("id").primaryKey(),

  cardId: integer("card_id")
    .notNull()
    .references(() => cards.id, {
      onDelete: "cascade",
    }),

  content: text("content").notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
})

export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("planejado"),
  position: integer("position").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const studyDays = pgTable("study_days", {
  id: serial("id").primaryKey(),

  studyDate: date("study_date", {
    mode: "string",
  })
    .notNull()
    .unique(),

  sessions: integer("sessions")
    .notNull()
    .default(1),

  focusMinutes: integer("focus_minutes")
    .notNull()
    .default(0),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
})

export type StudyDay = typeof studyDays.$inferSelect
export type Card = typeof cards.$inferSelect
export type Milestone = typeof milestones.$inferSelect
export type CardComment = typeof cardComments.$inferSelect
