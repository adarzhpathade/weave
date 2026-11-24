import type { SQL } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { check, index, integer, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { timestamps, tsvector } from "./common";
import { users } from "./people";
import { topics } from "./syllabus";

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    contentMd: text("content_md").notNull().default(""),
    searchVector: tsvector("search_vector").generatedAlwaysAs(
      (): SQL =>
        sql`setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(content_md, '')), 'B')`,
    ),
    wordCount: integer("word_count").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("notes_owner_updated_at_idx").on(table.ownerId, table.updatedAt.desc()),
    index("notes_search_vector_gin_idx").using("gin", table.searchVector),
    check("notes_word_count_chk", sql`${table.wordCount} >= 0`),
  ],
);

export const noteLinks = pgTable(
  "note_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id").references(() => topics.id, { onDelete: "restrict" }),
    targetNoteId: uuid("target_note_id").references(() => notes.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("note_links_note_topic_uidx").on(table.noteId, table.topicId),
    uniqueIndex("note_links_note_target_note_uidx").on(table.noteId, table.targetNoteId),
    index("note_links_topic_id_idx").on(table.topicId),
    index("note_links_target_note_id_idx").on(table.targetNoteId),
    check(
      "note_links_exactly_one_target_chk",
      sql`(${table.topicId} IS NOT NULL AND ${table.targetNoteId} IS NULL) OR (${table.topicId} IS NULL AND ${table.targetNoteId} IS NOT NULL)`,
    ),
    check(
      "note_links_no_self_link_chk",
      sql`${table.targetNoteId} IS NULL OR ${table.noteId} <> ${table.targetNoteId}`,
    ),
  ],
);
