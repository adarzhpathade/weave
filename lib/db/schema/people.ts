import { boolean, index, pgEnum, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { divisions, programs } from "./college";
import { timestamps } from "./common";
import { subjects } from "./syllabus";

export const userRoleEnum = pgEnum("user_role", ["student", "faculty", "admin"]);

export const studentStatusEnum = pgEnum("student_status", ["active", "inactive"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    role: userRoleEnum("role").notNull().default("student"),
    imageUrl: text("image_url"),
    ...timestamps,
  },
  (table) => [uniqueIndex("users_email_uidx").on(table.email)],
);

export const students = pgTable(
  "students",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    email: text("email").notNull(),
    fullName: text("full_name").notNull(),
    enrollmentNo: text("enrollment_no").notNull(),
    divisionId: uuid("division_id")
      .notNull()
      .references(() => divisions.id, { onDelete: "restrict" }),
    phone: text("phone"),
    status: studentStatusEnum("status").notNull().default("active"),
    notifyDeadline: boolean("notify_deadline").notNull().default(true),
    notifyNewAssignment: boolean("notify_new_assignment").notNull().default(true),
    notifyStatus: boolean("notify_status").notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("students_email_uidx").on(table.email),
    uniqueIndex("students_user_id_uidx").on(table.userId),
    uniqueIndex("students_enrollment_no_uidx").on(table.enrollmentNo),
    index("students_division_id_idx").on(table.divisionId),
  ],
);

export const studentElectives = pgTable(
  "student_electives",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    studentId: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "restrict" }),
    electiveGroup: text("elective_group").notNull(),
    subjectId: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "restrict" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("student_electives_student_group_uidx").on(table.studentId, table.electiveGroup),
    index("student_electives_subject_id_idx").on(table.subjectId),
  ],
);
