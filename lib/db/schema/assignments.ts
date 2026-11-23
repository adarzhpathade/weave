import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { divisions } from "./college";
import { timestamps } from "./common";
import { students, users } from "./people";
import { subjects, units } from "./syllabus";

export const assignmentMarkStatusEnum = pgEnum("assignment_mark_status", [
  "submitted",
  "late",
  "not_submitted",
]);

export const assignments = pgTable(
  "assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "restrict" }),
    unitId: uuid("unit_id").references(() => units.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
    maxMarks: integer("max_marks"),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => [
    index("assignments_subject_due_at_idx").on(table.subjectId, table.dueAt),
    check("assignments_max_marks_chk", sql`${table.maxMarks} IS NULL OR ${table.maxMarks} > 0`),
  ],
);

export const assignmentDivisions = pgTable(
  "assignment_divisions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    divisionId: uuid("division_id")
      .notNull()
      .references(() => divisions.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("assignment_divisions_assignment_division_uidx").on(
      table.assignmentId,
      table.divisionId,
    ),
    index("assignment_divisions_division_id_idx").on(table.divisionId),
  ],
);

export const assignmentMarks = pgTable(
  "assignment_marks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assignmentId: uuid("assignment_id")
      .notNull()
      .references(() => assignments.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    status: assignmentMarkStatusEnum("status").notNull(),
    marks: integer("marks"),
    remark: text("remark"),
    markedBy: uuid("marked_by").references(() => users.id, { onDelete: "set null" }),
    markedAt: timestamp("marked_at", { withTimezone: true }).notNull().defaultNow(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("assignment_marks_assignment_student_uidx").on(table.assignmentId, table.studentId),
    index("assignment_marks_student_id_idx").on(table.studentId),
    check("assignment_marks_marks_chk", sql`${table.marks} IS NULL OR ${table.marks} >= 0`),
  ],
);
