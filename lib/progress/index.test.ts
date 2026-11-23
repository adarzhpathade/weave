import { describe, expect, it } from "vitest";
import {
  computeSemesterPercent,
  computeSubjectPercent,
  computeUnitPercent,
  computeUnitProgress,
  getProgressStatusBand,
  isTopicCovered,
} from "./index";

describe("progress formula", () => {
  describe("isTopicCovered", () => {
    it("treats 0 or negative note counts as not covered", () => {
      expect(isTopicCovered(0)).toBe(false);
      expect(isTopicCovered(-1)).toBe(false);
    });

    it("treats 1 or more linked notes as covered", () => {
      expect(isTopicCovered(1)).toBe(true);
      expect(isTopicCovered(4)).toBe(true);
    });
  });

  describe("computeUnitPercent", () => {
    it("returns 0 when a unit has no topics", () => {
      expect(computeUnitPercent(0, 0)).toBe(0);
      expect(computeUnitPercent(2, 0)).toBe(0);
    });

    it("computes rounded covered/total percentage", () => {
      expect(computeUnitPercent(0, 5)).toBe(0);
      expect(computeUnitPercent(1, 3)).toBe(33);
      expect(computeUnitPercent(2, 3)).toBe(67);
      expect(computeUnitPercent(1, 2)).toBe(50);
      expect(computeUnitPercent(5, 5)).toBe(100);
    });

    it("clamps out-of-range covered counts", () => {
      expect(computeUnitPercent(-2, 4)).toBe(0);
      expect(computeUnitPercent(7, 4)).toBe(100);
    });
  });

  describe("computeUnitProgress", () => {
    it("counts topics with >=1 note and computes unit percentage", () => {
      expect(computeUnitProgress([])).toEqual({
        coveredTopics: 0,
        totalTopics: 0,
        percent: 0,
      });

      expect(computeUnitProgress([0, 1, 3, 0])).toEqual({
        coveredTopics: 2,
        totalTopics: 4,
        percent: 50,
      });

      expect(computeUnitProgress([2, 1, 5])).toEqual({
        coveredTopics: 3,
        totalTopics: 3,
        percent: 100,
      });
    });
  });

  describe("computeSubjectPercent", () => {
    it("returns 0 when a subject has no units", () => {
      expect(computeSubjectPercent([])).toBe(0);
    });

    it("averages unit percentages rather than raw topic totals", () => {
      // Unit 1: 1/1 = 100%, Unit 2: 0/9 = 0% -> average is 50%, not 1/10 (10%)
      expect(
        computeSubjectPercent([
          { coveredTopics: 1, totalTopics: 1 },
          { coveredTopics: 0, totalTopics: 9 },
        ]),
      ).toBe(50);
    });

    it("rounds the average of unit percentages to the nearest integer", () => {
      // (1/3 + 1/3 + 1/3) / 3 = 33.33% -> 33
      expect(
        computeSubjectPercent([
          { coveredTopics: 1, totalTopics: 3 },
          { coveredTopics: 1, totalTopics: 3 },
          { coveredTopics: 1, totalTopics: 3 },
        ]),
      ).toBe(33);

      // (1/2 + 1/4) / 2 = 37.5% -> 38
      expect(
        computeSubjectPercent([
          { coveredTopics: 1, totalTopics: 2 },
          { coveredTopics: 1, totalTopics: 4 },
        ]),
      ).toBe(38);
    });

    it("treats units with 0 topics as 0% in the average", () => {
      expect(
        computeSubjectPercent([
          { coveredTopics: 0, totalTopics: 0 },
          { coveredTopics: 2, totalTopics: 2 },
        ]),
      ).toBe(50);
    });
  });

  describe("computeSemesterPercent", () => {
    it("returns 0 when there are no subjects", () => {
      expect(computeSemesterPercent([])).toBe(0);
    });

    it("averages subject percentages and rounds to integer", () => {
      expect(computeSemesterPercent([100, 50, 0])).toBe(50);
      expect(computeSemesterPercent([33, 67, 50])).toBe(50);
      expect(computeSemesterPercent([10, 20, 20])).toBe(17);
    });
  });

  describe("getProgressStatusBand", () => {
    it("maps boundary values to AGENTS.md §4 status bands", () => {
      expect(getProgressStatusBand(0)).toBe("not_started");
      expect(getProgressStatusBand(1)).toBe("low");
      expect(getProgressStatusBand(39)).toBe("low");
      expect(getProgressStatusBand(40)).toBe("in_progress");
      expect(getProgressStatusBand(75)).toBe("in_progress");
      expect(getProgressStatusBand(76)).toBe("mastered");
      expect(getProgressStatusBand(100)).toBe("mastered");
    });
  });
});
