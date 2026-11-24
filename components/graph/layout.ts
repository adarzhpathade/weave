import type { GraphData } from "./types";

/*
 * Port of the kit's buildGraph(): a left-to-right tree in four columns — subject, units, topics, notes.
 * Topics sit one per row; a unit is centred on its topics, the subject on its units, and a note on the
 * topics it links to (pushed down so notes never overlap). All numbers below are the kit's.
 */

export type NodeKind = "subject" | "unit" | "topic" | "note";
export type EdgeKind = "tree" | "note";

export type LaidNode = {
  key: string; // unique in the SVG: kind prefix + id
  id: string; // the record id (subject / unit / topic / note)
  kind: NodeKind;
  title: string;
  label: string; // title clipped to fit its column
  x: number;
  y: number;
  col: number;
  j: number; // stagger index inside its column (kit: j % 12)
  covered: boolean;
};

export type LaidEdge = { key: string; a: string; b: string; kind: EdgeKind; col: number; d: string };

export type GraphLayout = { nodes: LaidNode[]; edges: LaidEdge[]; width: number; height: number };

type Frame = { x: [number, number, number, number]; width: number; syllabusWidth: number; chars: [number, number, number, number] };

// Phone: fixed-size SVG that scrolls sideways. Wide: scales to the card (min 760 px wide).
const PHONE: Frame = { x: [14, 150, 290, 452], width: 620, syllabusWidth: 470, chars: [16, 19, 23, 24] };
const WIDE: Frame = { x: [24, 240, 470, 720], width: 900, syllabusWidth: 900, chars: [28, 30, 32, 26] };
const ROW = 38;
const TOP = 26;
const NOTE_GAP = ROW * 1.3;
const BOTTOM = 26;
const STAGGER_MOD = 12;

export const nodeKey = {
  subject: (id: string) => `s:${id}`,
  unit: (id: string) => `u:${id}`,
  topic: (id: string) => `t:${id}`,
  note: (id: string) => `n:${id}`,
};

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

// Kit gpath(): S-curve between columns; nodes in the same column bow out to the left.
function edgePath(a: LaidNode, b: LaidNode): string {
  if (a.x === b.x) return `M${a.x} ${a.y}C${a.x - 40} ${a.y} ${b.x - 40} ${b.y} ${b.x} ${b.y}`;
  const [l, r] = a.x < b.x ? [a, b] : [b, a];
  const m = (l.x + r.x) / 2;
  return `M${l.x} ${l.y}C${m} ${l.y} ${m} ${r.y} ${r.x} ${r.y}`;
}

export function layoutGraph(data: GraphData, variant: "phone" | "wide", withNotes: boolean): GraphLayout {
  const f = variant === "wide" ? WIDE : PHONE;
  const counters = [0, 0, 0, 0];
  const make = (kind: NodeKind, id: string, title: string, col: number, y: number, covered = false): LaidNode => ({
    key: nodeKey[kind](id),
    id,
    kind,
    title,
    label: clip(title, f.chars[col]),
    x: f.x[col],
    y,
    col,
    j: counters[col]++ % STAGGER_MOD,
    covered,
  });

  const units = [...data.units].sort((a, b) => a.order - b.order);
  const topicNodes: LaidNode[] = [];
  const unitNodes: LaidNode[] = [];
  const edges: LaidEdge[] = [];
  let row = 0;

  for (const unit of units) {
    const own = unit.topics.map((t) => make("topic", t.id, t.title, 2, TOP + row++ * ROW, t.covered));
    // A unit without topics still gets its own row so it never stacks on a neighbour.
    const y = avg(own.map((t) => t.y)) ?? TOP + row++ * ROW;
    unitNodes.push(make("unit", unit.id, `${unit.order} · ${unit.title}`, 1, y));
    topicNodes.push(...own);
  }

  const subjectY = avg(unitNodes.map((u) => u.y)) ?? TOP;
  const subjectNode = make("subject", data.subject.id, data.subject.name, 0, subjectY);

  const byKey = new Map<string, LaidNode>();
  for (const n of [subjectNode, ...unitNodes, ...topicNodes]) byKey.set(n.key, n);

  // Tree edges: subject → unit → topic.
  units.forEach((unit, i) => {
    const u = unitNodes[i];
    edges.push(treeEdge(subjectNode, u));
    for (const t of unit.topics) {
      const tn = byKey.get(nodeKey.topic(t.id));
      if (tn) edges.push(treeEdge(u, tn));
    }
  });

  const noteNodes = withNotes ? placeNotes(data, byKey, make) : [];
  for (const n of noteNodes) byKey.set(n.key, n);
  if (withNotes) edges.push(...noteEdges(data, byKey));

  const nodes = [subjectNode, ...unitNodes, ...topicNodes, ...noteNodes];
  const height = Math.max(...nodes.map((n) => n.y)) + BOTTOM;
  const width = withNotes && noteNodes.length > 0 ? f.width : f.syllabusWidth;
  return { nodes, edges, width, height };
}

function treeEdge(parent: LaidNode, child: LaidNode): LaidEdge {
  return { key: `${parent.key}>${child.key}`, a: parent.key, b: child.key, kind: "tree", col: child.col, d: edgePath(parent, child) };
}

function placeNotes(
  data: GraphData,
  byKey: Map<string, LaidNode>,
  make: (kind: NodeKind, id: string, title: string, col: number, y: number) => LaidNode,
): LaidNode[] {
  const wanted = data.notes.map((note) => {
    const ys = note.topicIds.flatMap((id) => {
      const t = byKey.get(nodeKey.topic(id));
      return t ? [t.y] : [];
    });
    return { note, y: avg(ys) };
  });
  // Notes linked to topics go in topic order; notes linked only to other notes go last.
  const placed = wanted.filter((w) => w.y !== null).sort((a, b) => (a.y ?? 0) - (b.y ?? 0));
  const loose = wanted.filter((w) => w.y === null);

  let prev: number | null = null;
  return [...placed, ...loose].map(({ note, y }) => {
    let at: number = y ?? (prev === null ? TOP : prev + NOTE_GAP);
    if (prev !== null && at < prev + NOTE_GAP) at = prev + NOTE_GAP;
    prev = at;
    return make("note", note.id, note.title, 3, at);
  });
}

function noteEdges(data: GraphData, byKey: Map<string, LaidNode>): LaidEdge[] {
  const edges: LaidEdge[] = [];
  const seen = new Set<string>();
  const add = (a: LaidNode | undefined, b: LaidNode | undefined) => {
    if (!a || !b || a.key === b.key) return;
    const key = [a.key, b.key].sort().join("~");
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ key, a: a.key, b: b.key, kind: "note", col: 3, d: edgePath(a, b) });
  };
  for (const note of data.notes) {
    const from = byKey.get(nodeKey.note(note.id));
    for (const id of note.topicIds) add(from, byKey.get(nodeKey.topic(id)));
    for (const id of note.noteIds) add(from, byKey.get(nodeKey.note(id)));
  }
  return edges;
}
