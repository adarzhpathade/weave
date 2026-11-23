export type GraphTopic = { id: string; title: string; covered: boolean };
export type GraphUnit = { id: string; order: number; title: string; topics: GraphTopic[] };
export type GraphNote = { id: string; title: string; topicIds: string[]; noteIds: string[] };
export type GraphSubjectOption = { id: string; shortName: string; name: string };
export type GraphData = {
  subject: { id: string; shortName: string; name: string; colorIndex: number };
  semester: number;
  units: GraphUnit[];
  notes: GraphNote[];
  subjects: GraphSubjectOption[];
};
