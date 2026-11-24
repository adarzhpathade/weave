// Contract between the Assignments route (server) and the Assignments screen (client).
export type AssignmentStatus = "pending" | "submitted" | "late" | "not_submitted";

export type AssignmentItem = {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  subjectShort: string;
  unitLabel: string | null;
  givenBy: string | null;
  dueAt: string /* ISO */;
  maxMarks: number | null;
  marks: number | null;
  remark: string | null;
  description: string | null;
  status: AssignmentStatus;
};

export type AssignmentsPageData = {
  divisionCode: string;
  semester: number;
  now: string /* ISO */;
  items: AssignmentItem[];
};
