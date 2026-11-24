import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { departments, programs } from "./college";
import { timestamps } from "./common";

export const programSubjectKindEnum = pgEnum("program_subject_kind", [
  "core",
  "departmental_elective",
  "open_elective",
]);

export const subjects = pgTable(
  "subjects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "restrict" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    shortName: text("short_name").notNull(),
    colorToken: text("color_token").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("subjects_department_code_uidx").on(table.departmentId, table.code),
    index("subjects_department_id_idx").on(table.departmentId),
  ],
);

export const programSubjects = pgTable(
  "program_subjects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "restrict" }),
    semester: integer("semester").notNull(),
    order: integer("order").notNull(),
    kind: programSubjectKindEnum("kind").notNull().default("core"),
    electiveGroup: text("elective_group"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("program_subjects_program_subject_uidx").on(table.programId, table.subjectId),
    index("program_subjects_program_semester_idx").on(table.programId, table.semester),
    check("program_subjects_semester_chk", sql`${table.semester} >= 3 AND ${table.semester} <= 8`),
    check("program_subjects_order_chk", sql`${table.order} >= 1`),
    check(
      "program_subjects_elective_group_chk",
      sql`(${table.kind} = 'core' AND ${table.electiveGroup} IS NULL) OR (${table.kind} <> 'core' AND ${table.electiveGroup} IS NOT NULL)`,
    ),
  ],
);

export const units = pgTable(
  "units",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    order: integer("order").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("units_subject_order_uidx").on(table.subjectId, table.order),
    check("units_order_chk", sql`${table.order} >= 1`),
  ],
);

export const topics = pgTable(
  "topics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    unitId: uuid("unit_id")
      .notNull()
      .references(() => units.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    order: integer("order").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("topics_unit_order_uidx").on(table.unitId, table.order),
    check("topics_order_chk", sql`${table.order} >= 1`),
  ],
);
