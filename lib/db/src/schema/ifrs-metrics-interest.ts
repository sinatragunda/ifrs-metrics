import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import {
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const ifrsMetricsInterestTable = pgTable(
  "ifrs_metrics_interest",
  {
    id: serial("id").primaryKey(),
    email: text("email").notNull(),
    standards: text("standards")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    consentAt: timestamp("consent_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("ifrs_metrics_interest_email_unique").on(
      sql`lower(${table.email})`,
    ),
  ],
);

export const insertIfrsMetricsInterestSchema = createInsertSchema(
  ifrsMetricsInterestTable,
).omit({ id: true, consentAt: true, createdAt: true });

export type InsertIfrsMetricsInterest = z.infer<
  typeof insertIfrsMetricsInterestSchema
>;
export type IfrsMetricsInterest = typeof ifrsMetricsInterestTable.$inferSelect;
