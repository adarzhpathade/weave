CREATE TYPE "public"."announcement_kind" AS ENUM('exam', 'material', 'class', 'assignment');--> statement-breakpoint
CREATE TYPE "public"."assignment_mark_status" AS ENUM('submitted', 'late', 'not_submitted');--> statement-breakpoint
CREATE TYPE "public"."student_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('student', 'faculty', 'admin');--> statement-breakpoint
CREATE TYPE "public"."push_kind" AS ENUM('due_2d', 'due_today', 'new', 'status');--> statement-breakpoint
CREATE TYPE "public"."program_subject_kind" AS ENUM('core', 'departmental_elective', 'open_elective');--> statement-breakpoint
CREATE TABLE "announcement_reads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"announcement_id" uuid NOT NULL,
	"read_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_user_id" uuid,
	"division_id" uuid,
	"subject_id" uuid,
	"kind" "announcement_kind" NOT NULL,
	"title" text NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"file_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignment_divisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" uuid NOT NULL,
	"division_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assignment_marks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"status" "assignment_mark_status" NOT NULL,
	"marks" integer,
	"remark" text,
	"marked_by" uuid,
	"marked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assignment_marks_marks_chk" CHECK ("assignment_marks"."marks" IS NULL OR "assignment_marks"."marks" >= 0)
);
--> statement-breakpoint
CREATE TABLE "assignments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"unit_id" uuid,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"max_marks" integer,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assignments_max_marks_chk" CHECK ("assignments"."max_marks" IS NULL OR "assignments"."max_marks" > 0)
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "divisions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"name" text NOT NULL,
	"admission_year" integer NOT NULL,
	"current_semester" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "divisions_current_semester_chk" CHECK ("divisions"."current_semester" >= 3 AND "divisions"."current_semester" <= 8),
	CONSTRAINT "divisions_admission_year_chk" CHECK ("divisions"."admission_year" >= 2000)
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department_id" uuid NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "note_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"note_id" uuid NOT NULL,
	"topic_id" uuid,
	"target_note_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "note_links_exactly_one_target_chk" CHECK (("note_links"."topic_id" IS NOT NULL AND "note_links"."target_note_id" IS NULL) OR ("note_links"."topic_id" IS NULL AND "note_links"."target_note_id" IS NOT NULL)),
	CONSTRAINT "note_links_no_self_link_chk" CHECK ("note_links"."target_note_id" IS NULL OR "note_links"."note_id" <> "note_links"."target_note_id")
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content_md" text DEFAULT '' NOT NULL,
	"search_vector" "tsvector" GENERATED ALWAYS AS (setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(content_md, '')), 'B')) STORED,
	"word_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notes_word_count_chk" CHECK ("notes"."word_count" >= 0)
);
--> statement-breakpoint
CREATE TABLE "student_electives" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid NOT NULL,
	"program_id" uuid NOT NULL,
	"elective_group" text NOT NULL,
	"subject_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"enrollment_no" text NOT NULL,
	"division_id" uuid NOT NULL,
	"phone" text,
	"status" "student_status" DEFAULT 'active' NOT NULL,
	"notify_deadline" boolean DEFAULT true NOT NULL,
	"notify_new_assignment" boolean DEFAULT true NOT NULL,
	"notify_status" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'student' NOT NULL,
	"image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"assignment_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"kind" "push_kind" NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"user_agent" text,
	"last_success_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program_subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"semester" integer NOT NULL,
	"order" integer NOT NULL,
	"kind" "program_subject_kind" DEFAULT 'core' NOT NULL,
	"elective_group" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "program_subjects_semester_chk" CHECK ("program_subjects"."semester" >= 3 AND "program_subjects"."semester" <= 8),
	CONSTRAINT "program_subjects_order_chk" CHECK ("program_subjects"."order" >= 1),
	CONSTRAINT "program_subjects_elective_group_chk" CHECK (("program_subjects"."kind" = 'core' AND "program_subjects"."elective_group" IS NULL) OR ("program_subjects"."kind" <> 'core' AND "program_subjects"."elective_group" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"department_id" uuid NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"short_name" text NOT NULL,
	"color_token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"unit_id" uuid NOT NULL,
	"title" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "topics_order_chk" CHECK ("topics"."order" >= 1)
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_id" uuid NOT NULL,
	"title" text NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "units_order_chk" CHECK ("units"."order" >= 1)
);
--> statement-breakpoint
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_reads" ADD CONSTRAINT "announcement_reads_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_division_id_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_divisions" ADD CONSTRAINT "assignment_divisions_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_divisions" ADD CONSTRAINT "assignment_divisions_division_id_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_marks" ADD CONSTRAINT "assignment_marks_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_marks" ADD CONSTRAINT "assignment_marks_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignment_marks" ADD CONSTRAINT "assignment_marks_marked_by_users_id_fk" FOREIGN KEY ("marked_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "divisions" ADD CONSTRAINT "divisions_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "programs" ADD CONSTRAINT "programs_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_links" ADD CONSTRAINT "note_links_note_id_notes_id_fk" FOREIGN KEY ("note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_links" ADD CONSTRAINT "note_links_topic_id_topics_id_fk" FOREIGN KEY ("topic_id") REFERENCES "public"."topics"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "note_links" ADD CONSTRAINT "note_links_target_note_id_notes_id_fk" FOREIGN KEY ("target_note_id") REFERENCES "public"."notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_electives" ADD CONSTRAINT "student_electives_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_electives" ADD CONSTRAINT "student_electives_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_electives" ADD CONSTRAINT "student_electives_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "students" ADD CONSTRAINT "students_division_id_divisions_id_fk" FOREIGN KEY ("division_id") REFERENCES "public"."divisions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_log" ADD CONSTRAINT "push_log_assignment_id_assignments_id_fk" FOREIGN KEY ("assignment_id") REFERENCES "public"."assignments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_log" ADD CONSTRAINT "push_log_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_subjects" ADD CONSTRAINT "program_subjects_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "program_subjects" ADD CONSTRAINT "program_subjects_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" ADD CONSTRAINT "subjects_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "topics" ADD CONSTRAINT "topics_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "announcement_reads_user_announcement_uidx" ON "announcement_reads" USING btree ("user_id","announcement_id");--> statement-breakpoint
CREATE INDEX "announcement_reads_announcement_id_idx" ON "announcement_reads" USING btree ("announcement_id");--> statement-breakpoint
CREATE INDEX "announcements_division_created_at_idx" ON "announcements" USING btree ("division_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "announcements_subject_created_at_idx" ON "announcements" USING btree ("subject_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "announcements_created_at_idx" ON "announcements" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "assignment_divisions_assignment_division_uidx" ON "assignment_divisions" USING btree ("assignment_id","division_id");--> statement-breakpoint
CREATE INDEX "assignment_divisions_division_id_idx" ON "assignment_divisions" USING btree ("division_id");--> statement-breakpoint
CREATE UNIQUE INDEX "assignment_marks_assignment_student_uidx" ON "assignment_marks" USING btree ("assignment_id","student_id");--> statement-breakpoint
CREATE INDEX "assignment_marks_student_id_idx" ON "assignment_marks" USING btree ("student_id");--> statement-breakpoint
CREATE INDEX "assignments_subject_due_at_idx" ON "assignments" USING btree ("subject_id","due_at");--> statement-breakpoint
CREATE UNIQUE INDEX "departments_code_uidx" ON "departments" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "divisions_program_name_year_uidx" ON "divisions" USING btree ("program_id","name","admission_year");--> statement-breakpoint
CREATE INDEX "divisions_program_id_idx" ON "divisions" USING btree ("program_id");--> statement-breakpoint
CREATE UNIQUE INDEX "programs_code_uidx" ON "programs" USING btree ("code");--> statement-breakpoint
CREATE INDEX "programs_department_id_idx" ON "programs" USING btree ("department_id");--> statement-breakpoint
CREATE UNIQUE INDEX "note_links_note_topic_uidx" ON "note_links" USING btree ("note_id","topic_id");--> statement-breakpoint
CREATE UNIQUE INDEX "note_links_note_target_note_uidx" ON "note_links" USING btree ("note_id","target_note_id");--> statement-breakpoint
CREATE INDEX "note_links_topic_id_idx" ON "note_links" USING btree ("topic_id");--> statement-breakpoint
CREATE INDEX "note_links_target_note_id_idx" ON "note_links" USING btree ("target_note_id");--> statement-breakpoint
CREATE INDEX "notes_owner_updated_at_idx" ON "notes" USING btree ("owner_id","updated_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "notes_search_vector_gin_idx" ON "notes" USING gin ("search_vector");--> statement-breakpoint
CREATE UNIQUE INDEX "student_electives_student_group_uidx" ON "student_electives" USING btree ("student_id","elective_group");--> statement-breakpoint
CREATE INDEX "student_electives_subject_id_idx" ON "student_electives" USING btree ("subject_id");--> statement-breakpoint
CREATE UNIQUE INDEX "students_email_uidx" ON "students" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "students_user_id_uidx" ON "students" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "students_enrollment_no_uidx" ON "students" USING btree ("enrollment_no");--> statement-breakpoint
CREATE INDEX "students_division_id_idx" ON "students" USING btree ("division_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_uidx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "push_log_assignment_student_kind_uidx" ON "push_log" USING btree ("assignment_id","student_id","kind");--> statement-breakpoint
CREATE INDEX "push_log_student_id_idx" ON "push_log" USING btree ("student_id");--> statement-breakpoint
CREATE UNIQUE INDEX "push_subscriptions_endpoint_uidx" ON "push_subscriptions" USING btree ("endpoint");--> statement-breakpoint
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "program_subjects_program_subject_uidx" ON "program_subjects" USING btree ("program_id","subject_id");--> statement-breakpoint
CREATE INDEX "program_subjects_program_semester_idx" ON "program_subjects" USING btree ("program_id","semester");--> statement-breakpoint
CREATE UNIQUE INDEX "subjects_department_code_uidx" ON "subjects" USING btree ("department_id","code");--> statement-breakpoint
CREATE INDEX "subjects_department_id_idx" ON "subjects" USING btree ("department_id");--> statement-breakpoint
CREATE UNIQUE INDEX "topics_unit_order_uidx" ON "topics" USING btree ("unit_id","order");--> statement-breakpoint
CREATE UNIQUE INDEX "units_subject_order_uidx" ON "units" USING btree ("subject_id","order");