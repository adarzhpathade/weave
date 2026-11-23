// Contract between the subjects route pages (backend) and these screens. Do not rename.
export type SubjectKind = "core" | "dept_elective" | "open_elective";

export type SubjectCard = {
  id: string;
  code: string;
  name: string;
  shortName: string;
  kind: SubjectKind;
  colorIndex: number;
  percent: number;
  coveredTopics: number;
  totalTopics: number;
};

export type SubjectsPageData = { semester: number; divisionCode: string; subjects: SubjectCard[] };

export type TopicRow = { id: string; order: number; title: string; noteCount: number };

export type UnitBlock = { id: string; order: number; title: string; covered: number; total: number; topics: TopicRow[] };

export type SubjectDetail = {
  id: string;
  code: string;
  name: string;
  shortName: string;
  kind: SubjectKind;
  colorIndex: number;
  percent: number;
  noteCount: number;
  units: UnitBlock[];
};
