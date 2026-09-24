import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { curriculumDefaults } from "../lib/curriculum.ts";
import { normalizeCambridgeEvaluation } from "../lib/cambridge-evaluation.ts";
import { defaultFreestyleBanks, eligibleFreestyleCategories, flattenFreestyleCategories, freestyleCategoryQuestions, sampleFreestyleQuestionsFromCategory, sampleSpeakingQuestions, splitFreestyleQuestions } from "../lib/speaking-questions.ts";
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

test("Freestyle is one editable bank per Cambridge level and Starters has the PDF questions", () => {
  const cambridge = curriculumDefaults.filter((unit) => unit.group === "cambridge");
  assert.equal(cambridge.length, 36);
  assert.ok(cambridge.every((unit) => !("freestyleQuestions" in unit)));
  assert.deepEqual(defaultFreestyleBanks.STARTERS.map((group) => group.category), ["Personal information", "Family and Friends", "Your house", "Sports", "Food", "Animals", "Schools"]);
  assert.equal(flattenFreestyleCategories(defaultFreestyleBanks.STARTERS).length, 46);
  assert.deepEqual(defaultFreestyleBanks.MOVERS, []);
  assert.deepEqual(defaultFreestyleBanks.FLYERS, []);
  const bank = ["A?", "B?", "C?", "D?", "E?", "F?"];
  const sampled = sampleSpeakingQuestions(bank);
  assert.equal(sampled.length, 5);
  assert.equal(new Set(sampled).size, 5);
  assert.ok(sampled.every((question) => bank.includes(question)));
  const eligible = eligibleFreestyleCategories(defaultFreestyleBanks.STARTERS);
  assert.deepEqual(eligible.map((category) => category.category), ["Personal information", "Family and Friends", "Your house", "Food", "Schools"]);
  const selectedTopic = eligible[0];
  const topicSample = sampleFreestyleQuestionsFromCategory(selectedTopic);
  const groupedSample = splitFreestyleQuestions(topicSample, [selectedTopic]);
  assert.equal(topicSample.length, 5);
  assert.ok(topicSample.every((question) => freestyleCategoryQuestions(selectedTopic).includes(question)));
  assert.equal(groupedSample.yesNo.length + groupedSample.wh.length, 5);

  const form = readFileSync(new URL("../app/curriculum-check.tsx", import.meta.url), "utf8");
  assert.ok(form.includes("Freestyle · ngân hàng chung level"));
  assert.ok(form.includes("áp dụng cho toàn bộ level"));
  assert.ok(form.includes('send("updateFreestyleBank"'));
  assert.ok(!form.includes("unit.freestyleQuestions"));
  assert.ok(form.includes('title="YES / NO"'));
  assert.ok(form.includes('title="WH QUESTIONS"'));
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
  for (const label of ["Vocabulary", "Pronunciation", "Pattern · Điểm %", "Free · Điểm %"]) assert.ok(dashboard.includes(`label: "${label}"`));
  assert.ok(form.includes('hasRedflagComponent ? "Redflag" : overallPercent > 80 ? "Good" : "Average"'));
  assert.ok(form.includes("CambridgeEvaluationMatrix"));
  assert.ok(form.includes('id="pattern-percent"'));
  assert.ok(form.includes('id="free-percent"'));
  assert.ok(form.includes("Pronunciation dùng chung"));
  assert.ok(form.includes("sampleFreestyleQuestionsFromCategory"));
});

test("Cambridge matrix keeps one shared pronunciation and reads legacy checks", () => {
  const legacy = normalizeCambridgeEvaluation({ pronunciation: "clear", oneOrMany: "correct", amIsAre: "incorrect" });
  assert.deepEqual(legacy.pattern, legacy.free);
  assert.equal(legacy.pronunciation, "clear");
  const previousMatrix = normalizeCambridgeEvaluation({
    pattern: { pronunciation: "clear", oneOrMany: "correct", amIsAre: "correct" },
    free: { pronunciation: "unclear", oneOrMany: "incorrect", amIsAre: "correct" },
  });
  assert.equal(previousMatrix.pronunciation, "clear");
  const current = normalizeCambridgeEvaluation({ pronunciation: "unclear", pattern: { oneOrMany: "correct", amIsAre: "correct" }, free: { oneOrMany: "incorrect", amIsAre: "correct" } });
  assert.equal(current.pronunciation, "unclear");
  assert.equal(current.pattern.oneOrMany, "correct");
  assert.equal(current.free.oneOrMany, "incorrect");
});

test("Vocabulary is rendered as compact bullet lists instead of chips", () => {
  const form = readFileSync(new URL("../app/curriculum-check.tsx", import.meta.url), "utf8");
  assert.ok(form.includes('<ul className="grid gap-x-6 gap-y-1.5'));
  assert.ok(form.includes('<ul className="grid gap-x-4 gap-y-1'));
  assert.ok(form.includes('rounded-full bg-[#4a90c2]'));
});

test("Class editor exposes multiple teacher assignments", () => {
  const dashboard = readFileSync(new URL("../app/academic-dashboard.tsx", import.meta.url), "utf8");
  assert.ok(dashboard.includes("selectedTeacherIds"));
  assert.ok(dashboard.includes('type="checkbox"'));
  assert.ok(dashboard.includes('item.teacherNames.join(" · ")'));
});
