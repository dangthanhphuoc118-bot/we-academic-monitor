import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { curriculumDefaults } from "../lib/curriculum.ts";
import { sampleSpeakingQuestions, speakingQuestions } from "../lib/speaking-questions.ts";
import { parseVocabularyGroups, vocabularyGroupLabels } from "../lib/vocabulary.ts";

const flyers = curriculumDefaults.filter((unit) => unit.programCode === "FLYERS");

test("Flyers has all 12 units with five ordered vocabulary columns", () => {
  assert.equal(flyers.length, 12);
  for (const [index, unit] of flyers.entries()) {
    assert.equal(unit.unitNumber, index + 1);
    assert.equal(unit.dayStart, index * 3 + 1);
    assert.equal(unit.dayEnd, (index + 1) * 3);
    const groups = parseVocabularyGroups(unit.vocabulary);
    assert.deepEqual(groups.map((group) => group.label), [...vocabularyGroupLabels]);
    assert.ok(groups.find((group) => group.label === "VERB").content.length > 0);
    assert.equal(unit.writingRef, "");
  }
  assert.deepEqual(flyers.map((unit) => unit.vocabularyMax), [19, 21, 20, 12, 20, 13, 20, 12, 20, 27, 11, 23]);
});

test("New PDF vocabulary is assigned to its source column", () => {
  const group = (unit, label) => parseVocabularyGroups(flyers[unit - 1].vocabulary).find((item) => item.label === label).content.split(" - ");
  assert.ok(group(1, "ADJ").includes("Dear"));
  assert.ok(group(1, "VERB").includes("Go out"));
  assert.deepEqual(group(1, "ADV"), ["Away"]);
  assert.deepEqual(group(1, "PREPOSITION"), ["After", "Before"]);
  assert.ok(group(2, "PREPOSITION").includes("In front of"));
  assert.ok(group(4, "PREPOSITION").includes("During"));
  assert.ok(group(6, "VERB").includes("Look after"));
  assert.ok(group(8, "VERB").includes("Fall over"));
  assert.ok(group(9, "NOUN").includes("Chopsticks"));
  assert.ok(group(9, "NOUN").includes("Umbrella"));
  assert.ok(group(10, "VERB").includes("Snowboard"));
  assert.deepEqual(group(12, "ADV"), ["Suddenly"]);
});

test("Empty columns remain present and Movers grouping is unchanged", () => {
  const groups = parseVocabularyGroups(flyers[2].vocabulary);
  assert.equal(groups.find((group) => group.label === "ADV").content, "");
  assert.equal(groups.find((group) => group.label === "PREPOSITION").content, "");
  for (const unit of curriculumDefaults.filter((item) => item.programCode === "MOVERS")) {
    assert.equal(parseVocabularyGroups(unit.vocabulary).length, 5);
  }
  assert.deepEqual(parseVocabularyGroups("Cat - Dog"), []);
  assert.equal(parseVocabularyGroups("adj: Happy\r\nNOUN: Book").length, 5);
});

test("Every Cambridge unit owns an editable Freestyle bank and samples five questions", () => {
  const cambridge = curriculumDefaults.filter((unit) => unit.group === "cambridge");
  assert.equal(cambridge.length, 36);
  for (const unit of cambridge) {
    assert.ok(unit.freestyleQuestions.length >= 5, `${unit.programCode} ${unit.unitLabel}`);
    assert.deepEqual(unit.freestyleQuestions, speakingQuestions[unit.programCode]);
  }
  assert.notEqual(cambridge[0].freestyleQuestions, cambridge[1].freestyleQuestions);
  const bank = ["A?", "B?", "C?", "D?", "E?", "F?"];
  const sampled = sampleSpeakingQuestions(bank);
  assert.equal(sampled.length, 5);
  assert.equal(new Set(sampled).size, 5);
  assert.ok(sampled.every((question) => bank.includes(question)));

  const form = readFileSync(new URL("../app/curriculum-check.tsx", import.meta.url), "utf8");
  assert.ok(form.includes("Freestyle question bank"));
  assert.ok(form.includes("unit.freestyleQuestions"));
  assert.ok(form.includes("mỗi câu trên một dòng"));
});

test("Dashboard and check form do not render aggregate /5 scores", () => {
  for (const file of ["academic-dashboard.tsx", "curriculum-check.tsx"]) {
    const source = readFileSync(new URL(`../app/${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /}\s*\/\s*5(?:\b|<)/);
    assert.doesNotMatch(source, /Điểm tổng|Điểm dự kiến|Điểm TB giáo viên|Thang điểm 5/);
    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
    const visit = (node) => {
      if (ts.isJsxExpression(node)) {
        assert.doesNotMatch(node.getText(tree), /overallScore|overallPercent|row\.score|score\.toFixed/);
      }
      ts.forEachChild(node, visit);
    };
    visit(tree);
  }
});

test("Detailed criteria and grade classification are retained", () => {
  const dashboard = readFileSync(new URL("../app/academic-dashboard.tsx", import.meta.url), "utf8");
  const form = readFileSync(new URL("../app/curriculum-check.tsx", import.meta.url), "utf8");
  for (const label of ["Pattern", "Freestyle", "Vocabulary", "Pronunciation"]) assert.ok(dashboard.includes(`label: "${label}"`));
  assert.ok(form.includes('hasRedflagComponent ? "Redflag" : overallPercent > 80 ? "Good" : "Average"'));
  assert.ok(form.includes('label="PATTERN"'));
  assert.ok(form.includes('label="FREESTYLE"'));
});
