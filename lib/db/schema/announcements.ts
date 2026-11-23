import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { divisions } from "./college";
import { timestamps } from "./common";
import { users } from "./people";
import { subjects } from "./syllabus";

export const announcementKindEnum = pgEnum("announcement_kind", [
  "exam",
  "material",
  "class",
  "assignment",
]);

export const announcements = pgTable(
  "announcements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authorUserId: uuid("author_user_id").references(() => users.id, { onDelete: "set null" }),
    divisionId: uuid("division_id").references(() => divisions.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id").references(() => subjects.id, { onDelete: "set null" }),
    kind: announcementKindEnum("kind").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    fileKey: text("file_key"),
    ...timestamps,
  },
  (table) => [
    index("announcements_division_created_at_idx").on(table.divisionId, table.createdAt.desc()),
    index("announcements_subject_created_at_idx").on(table.subjectId, table.createdAt.desc()),
    index("announcements_created_at_idx").on(table.createdAt.desc()),
  ],
);

export const announcementReads = pgTable(
  "announcement_reads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    announcementId: uuid("announcement_id")
      .notNull()
      .references(() => announcements.id, { onDelete: "cascade" }),
    readAt: timestamp("read_at", { withTimezone: true }).notNull().defaultNow(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("announcement_reads_user_announcement_uidx").on(table.userId, table.announcementId),
    index("announcement_reads_announcement_id_idx").on(table.announcementId),
  ],
);
