import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./common";

export const departments = pgTable(
  "departments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    code: text("code").notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("departments_code_uidx").on(table.code)],
);

export const programs = pgTable(
  "programs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    departmentId: uuid("department_id")
      .notNull()
      .references(() => departments.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    code: text("code").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("programs_code_uidx").on(table.code),
    index("programs_department_id_idx").on(table.departmentId),
  ],
);

export const divisions = pgTable(
  "divisions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    admissionYear: integer("admission_year").notNull(),
    currentSemester: integer("current_semester").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("divisions_program_name_year_uidx").on(
      table.programId,
      table.name,
      table.admissionYear,
    ),
    index("divisions_program_id_idx").on(table.programId),
    check(
      "divisions_current_semester_chk",
      sql`${table.currentSemester} >= 3 AND ${table.currentSemester} <= 8`,
    ),
    check("divisions_admission_year_chk", sql`${table.admissionYear} >= 2000`),
  ],
);
