import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { assignments } from "./assignments";
import { timestamps } from "./common";
import { students, users } from "./people";

export const pushKindEnum = pgEnum("push_kind", ["due_2d", "due_today", "new", "status"]);

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    userAgent: text("user_agent"),
    lastSuccessAt: timestamp("last_success_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("push_subscriptions_endpoint_uidx").on(table.endpoint),
    index("push_subscriptions_user_id_idx").on(table.userId),
  ],
);

export const pushLog = pgTable(
  "push_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    kind: pushKindEnum("kind").notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("push_log_assignment_student_kind_uidx").on(
      table.assignmentId,
      table.studentId,
      table.kind,
    ),
    index("push_log_student_id_idx").on(table.studentId),
  ],
);
