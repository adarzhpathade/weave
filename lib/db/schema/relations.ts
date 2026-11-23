import { relations } from "drizzle-orm";
import { announcementReads, announcements } from "./announcements";
import { assignmentDivisions, assignmentMarks, assignments } from "./assignments";
import { departments, divisions, programs } from "./college";
import { noteLinks, notes } from "./notes";
import { studentElectives, students, users } from "./people";
import { pushLog, pushSubscriptions } from "./push";
import { programSubjects, subjects, topics, units } from "./syllabus";

export const departmentsRelations = relations(departments, ({ many }) => ({
  programs: many(programs),
  subjects: many(subjects),
}));

export const programsRelations = relations(programs, ({ one, many }) => ({
  department: one(departments, {
    fields: [programs.departmentId],
    references: [departments.id],
  }),
  divisions: many(divisions),
  programSubjects: many(programSubjects),
  studentElectives: many(studentElectives),
}));

export const divisionsRelations = relations(divisions, ({ one, many }) => ({
  program: one(programs, {
    fields: [divisions.programId],
    references: [programs.id],
  }),
  students: many(students),
  assignmentDivisions: many(assignmentDivisions),
  announcements: many(announcements),
}));

export const subjectsRelations = relations(subjects, ({ one, many }) => ({
  department: one(departments, {
    fields: [subjects.departmentId],
    references: [departments.id],
  }),
  programSubjects: many(programSubjects),
  units: many(units),
  studentElectives: many(studentElectives),
  assignments: many(assignments),
  announcements: many(announcements),
}));

export const programSubjectsRelations = relations(programSubjects, ({ one }) => ({
  program: one(programs, {
    fields: [programSubjects.programId],
    references: [programs.id],
  }),
  subject: one(subjects, {
    fields: [programSubjects.subjectId],
    references: [subjects.id],
  }),
}));

export const unitsRelations = relations(units, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [units.subjectId],
    references: [subjects.id],
  }),
  topics: many(topics),
  assignments: many(assignments),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
  unit: one(units, {
    fields: [topics.unitId],
    references: [units.id],
  }),
  noteLinks: many(noteLinks),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  notes: many(notes),
  createdAssignments: many(assignments),
  markedAssignments: many(assignmentMarks),
  authoredAnnouncements: many(announcements),
  announcementReads: many(announcementReads),
  pushSubscriptions: many(pushSubscriptions),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  division: one(divisions, {
    fields: [students.divisionId],
    references: [divisions.id],
  }),
  electives: many(studentElectives),
  assignmentMarks: many(assignmentMarks),
  pushLogs: many(pushLog),
}));

export const studentElectivesRelations = relations(studentElectives, ({ one }) => ({
  student: one(students, {
    fields: [studentElectives.studentId],
    references: [students.id],
  }),
  program: one(programs, {
    fields: [studentElectives.programId],
    references: [programs.id],
  }),
  subject: one(subjects, {
    fields: [studentElectives.subjectId],
    references: [subjects.id],
  }),
}));

export const notesRelations = relations(notes, ({ one, many }) => ({
  owner: one(users, {
    fields: [notes.ownerId],
    references: [users.id],
  }),
  outgoingLinks: many(noteLinks, { relationName: "noteOutgoingLinks" }),
  incomingLinks: many(noteLinks, { relationName: "noteIncomingLinks" }),
}));

export const noteLinksRelations = relations(noteLinks, ({ one }) => ({
  note: one(notes, {
    fields: [noteLinks.noteId],
    references: [notes.id],
    relationName: "noteOutgoingLinks",
  }),
  topic: one(topics, {
    fields: [noteLinks.topicId],
    references: [topics.id],
  }),
  targetNote: one(notes, {
    fields: [noteLinks.targetNoteId],
    references: [notes.id],
    relationName: "noteIncomingLinks",
  }),
}));

export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  subject: one(subjects, {
    fields: [assignments.subjectId],
    references: [subjects.id],
  }),
  unit: one(units, {
    fields: [assignments.unitId],
    references: [units.id],
  }),
  creator: one(users, {
    fields: [assignments.createdBy],
    references: [users.id],
  }),
  divisions: many(assignmentDivisions),
  marks: many(assignmentMarks),
  pushLogs: many(pushLog),
}));

export const assignmentDivisionsRelations = relations(assignmentDivisions, ({ one }) => ({
  assignment: one(assignments, {
    fields: [assignmentDivisions.assignmentId],
    references: [assignments.id],
  }),
  division: one(divisions, {
    fields: [assignmentDivisions.divisionId],
    references: [divisions.id],
  }),
}));

export const assignmentMarksRelations = relations(assignmentMarks, ({ one }) => ({
  assignment: one(assignments, {
    fields: [assignmentMarks.assignmentId],
    references: [assignments.id],
  }),
  student: one(students, {
    fields: [assignmentMarks.studentId],
    references: [students.id],
  }),
  marker: one(users, {
    fields: [assignmentMarks.markedBy],
    references: [users.id],
  }),
}));

export const announcementsRelations = relations(announcements, ({ one, many }) => ({
  author: one(users, {
    fields: [announcements.authorUserId],
    references: [users.id],
  }),
  division: one(divisions, {
    fields: [announcements.divisionId],
    references: [divisions.id],
  }),
  subject: one(subjects, {
    fields: [announcements.subjectId],
    references: [subjects.id],
  }),
  reads: many(announcementReads),
}));

export const announcementReadsRelations = relations(announcementReads, ({ one }) => ({
  user: one(users, {
    fields: [announcementReads.userId],
    references: [users.id],
  }),
  announcement: one(announcements, {
    fields: [announcementReads.announcementId],
    references: [announcements.id],
  }),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [pushSubscriptions.userId],
    references: [users.id],
  }),
}));

export const pushLogRelations = relations(pushLog, ({ one }) => ({
  assignment: one(assignments, {
    fields: [pushLog.assignmentId],
    references: [assignments.id],
  }),
  student: one(students, {
    fields: [pushLog.studentId],
    references: [students.id],
  }),
}));
