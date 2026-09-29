import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import ts from "typescript";
import { curriculumDefaults, PREVIOUS_LEVEL_REVIEW_UNIT_NUMBER } from "../lib/curriculum.ts";
import React from "react";
import { renderToString } from "react-dom/server";
import { CurriculumManager, CurriculumStudentCheck, isUnitScoreComplete, unitScoreIssue } from "../app/curriculum-check.tsx";
import { evaluationCriteria, EvaluationCriteriaGrid } from "../app/academic-dashboard.tsx";
import { normalizeCambridgeEvaluation } from "../lib/cambridge-evaluation.ts";
import { choiceCriterionTone, percentCriterionTone, vocabularyCriterionTone } from "../lib/criterion-colors.ts";
import { defaultFreestyleBanks, eligibleFreestyleCategories, flattenFreestyleCategories, freestyleCategoryQuestions, sampleFreestyleQuestionsFromCategory, sampleSpeakingQuestions, splitFreestyleQuestions } from "../lib/speaking-questions.ts";
import { parseReviewVocabularySections, parseVocabularyGroups, vocabularyGroupLabels } from "../lib/vocabulary.ts";
import { evaluationGroups } from "../lib/unit-evaluation.ts";

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
  for (const label of ["Vocabulary", "Pattern · Pronunciation", "Free · Pronunciation", "Pattern · Điểm %", "Free · Điểm %"]) assert.ok(dashboard.includes(`label: "${label}"`));
  assert.ok(form.includes('hasRedflagComponent ? "Redflag" : overallPercent > 80 ? "Good" : "Average"'));
  assert.ok(form.includes("CambridgeEvaluationMatrix"));
  assert.ok(form.includes('id="pattern-percent"'));
  assert.ok(form.includes('id="free-percent"'));
  assert.ok(form.includes('label="Pattern pronunciation"'));
  assert.ok(form.includes('label="Free pronunciation"'));
  assert.ok(form.includes("freestyleCategoryQuestions(category)"));
  assert.ok(!form.includes("Đổi 5 câu"));
});

test("Cambridge pronunciation is independent and legacy shared values fill both columns", () => {
  const legacy = normalizeCambridgeEvaluation({ pronunciation: "clear", oneOrMany: "correct", amIsAre: "incorrect" });
  assert.deepEqual(legacy.pattern, legacy.free);
  assert.equal(legacy.pattern.pronunciation, "clear");
  assert.equal(legacy.free.pronunciation, "clear");
  const previousMatrix = normalizeCambridgeEvaluation({
    pattern: { pronunciation: "clear", oneOrMany: "correct", amIsAre: "correct" },
    free: { pronunciation: "unclear", oneOrMany: "incorrect", amIsAre: "correct" },
  });
  assert.equal(previousMatrix.pattern.pronunciation, "clear");
  assert.equal(previousMatrix.free.pronunciation, "unclear");
  const current = normalizeCambridgeEvaluation({ pronunciation: "unclear", pattern: { oneOrMany: "correct", amIsAre: "correct" }, free: { oneOrMany: "incorrect", amIsAre: "correct" } });
  assert.equal(current.pattern.pronunciation, "unclear");
  assert.equal(current.free.pronunciation, "unclear");
  assert.equal(current.pattern.oneOrMany, "correct");
  assert.equal(current.free.oneOrMany, "incorrect");
});

test("Baby Stars offers the eight supplied Freestyle questions", () => {
  assert.deepEqual(flattenFreestyleCategories(defaultFreestyleBanks.BABY_STARS), [
    "Can you spell it?", "Do you like it?", "Would you like to paint it red?",
    "Can you count the eggs?", "Can you draw an egg?", "What’s this?",
    "What color is it?", "How many eggs are there?",
  ]);
});

test("Curriculum and Baby Stars check keep rendering if an older question module lacks the Baby bank", () => {
  const babyBank = defaultFreestyleBanks.BABY_STARS;
  delete defaultFreestyleBanks.BABY_STARS;
  try {
    const manager = renderToString(React.createElement(CurriculumManager, {
      curriculum: curriculumDefaults, freestyleBanks: [], onReload: async () => {},
    }));
    assert.ok(manager.includes("Nội dung khung đánh giá"));
    const check = renderToString(React.createElement(CurriculumStudentCheck, {
      classes: [{ id: 1, name: "Baby A", level: "Baby Stars", schedule: "", teacherName: null }],
      students: [{ id: 1, name: "Test", classId: 1, className: "Baby A", level: "Baby Stars" }],
      curriculum: curriculumDefaults, freestyleBanks: [], levelOptions: [], feedbackOptions: [],
      selectedClassId: "1", setSelectedClassId: () => {}, selectedStudentId: "1", setSelectedStudentId: () => {},
      onSaved: () => {}, openFeedbackOptions: () => {},
    }));
    assert.ok(check.includes("SPELLING"));
  } finally {
    defaultFreestyleBanks.BABY_STARS = babyBank;
  }
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

test("Each Super Kids level has a cumulative All reviews chapter after its units", () => {
  for (let level = 1; level <= 8; level++) {
    const units = curriculumDefaults.filter((unit) => unit.programCode === `SUPER_KIDS_${level}`);
    assert.equal(units[0].unitNumber, PREVIOUS_LEVEL_REVIEW_UNIT_NUMBER);
    assert.equal(units[0].unitLabel, `All reviews · ${level === 1 ? "Baby Stars" : `Super Kids ${level - 1}`}`);
    assert.equal(units[1].unitNumber, 1);
    const review = units.at(-1);
    assert.equal(review.unitLabel, "All reviews");
    assert.equal(review.unitNumber, units.at(-2).unitNumber + 1);
    assert.equal(review.vocabularyMax, units.slice(1, -1).reduce((sum, unit) => sum + unit.vocabularyMax, 0));
    assert.equal(parseReviewVocabularySections(review.vocabulary).length, units.length - 2);
    if (level > 1) assert.equal(units[0].vocabulary, curriculumDefaults.find((unit) => unit.programCode === `SUPER_KIDS_${level - 1}` && unit.unitLabel === "All reviews").vocabulary);
  }
});

test("Existing All reviews vocabulary is also separated into Unit sections", () => {
  assert.deepEqual(parseReviewVocabularySections("Unit 1: Fans - T-shirt\nUnit 2: Grandma - uncle"), [
    { label: "Unit 1", vocabulary: "Fans - T-shirt" },
    { label: "Unit 2", vocabulary: "Grandma - uncle" },
  ]);
});

test("Multiple selected Units start collapsed; a single Unit stays open", () => {
  const props = {
    classes: [{ id: 1, name: "Super A", level: "Super Kids 4", schedule: "", teacherName: null }],
    students: [{ id: 1, name: "Test", classId: 1, className: "Super A", level: "Super Kids 4" }],
    curriculum: curriculumDefaults, freestyleBanks: [], levelOptions: [], feedbackOptions: [],
    selectedClassId: "1", setSelectedClassId: () => {}, selectedStudentId: "1", setSelectedStudentId: () => {},
    onSaved: () => {}, openFeedbackOptions: () => {},
  };
  const multiple = renderToString(React.createElement(CurriculumStudentCheck, { ...props, initialUnitNumbers: [4, 5] }));
  assert.match(multiple, /aria-expanded="false" aria-controls="unit-check-4"/);
  assert.match(multiple, /aria-expanded="false" aria-controls="unit-check-5"/);
  assert.doesNotMatch(multiple, /Evaluation Criteria · <!-- -->Unit 4/);
  const single = renderToString(React.createElement(CurriculumStudentCheck, { ...props, initialUnitNumbers: [4] }));
  assert.match(single, /aria-expanded="true" aria-controls="unit-check-4"/);
  assert.match(single, /Unit 4: Months[\s\S]*Evaluation Criteria · <!-- -->Unit 4/);
});

test("Several Baby Stars All reviews Days collapse into one scoring section", () => {
  const html = renderToString(React.createElement(CurriculumStudentCheck, {
    classes: [{ id: 1, name: "Baby A", level: "Baby Stars", schedule: "", teacherName: null }],
    students: [{ id: 1, name: "Test", classId: 1, className: "Baby A", level: "Baby Stars" }],
    curriculum: curriculumDefaults, freestyleBanks: [], levelOptions: [], feedbackOptions: [],
    selectedClassId: "1", setSelectedClassId: () => {}, selectedStudentId: "1", setSelectedStudentId: () => {},
    initialUnitNumbers: [26, 27], onSaved: () => {}, openFeedbackOptions: () => {},
  }));
  assert.match(html, /All reviews · Day 26–27/);
  assert.match(html, /aria-expanded="false" aria-controls="unit-check-26-27"/);
  assert.doesNotMatch(html, /Evaluation Criteria · <!-- -->All reviews/);
});

test("A Unit turns green only when all its scoring fields are complete", () => {
  const unit = curriculumDefaults.find((item) => item.programCode === "SUPER_KIDS_4" && item.unitNumber === 4);
  const group = evaluationGroups([unit])[0];
  const blank = { spellingPercent: "", writingPercent: "", vocabularyCorrect: "", communicationPercent: "", pronunciation: "", patternPercent: "", freestylePercent: "", patternPronunciation: "", freePronunciation: "", patternOneOrMany: "", freeOneOrMany: "", patternAmIsAre: "", freeAmIsAre: "", freestyleCategory: "", freestyleQuestions: [] };
  const score = { ...blank, vocabularyCorrect: String(unit.vocabularyMax), communicationPercent: "90", pronunciation: "clear" };
  assert.equal(isUnitScoreComplete(group, { ...score, communicationPercent: "" }, "super", []), false);
  assert.equal(isUnitScoreComplete(group, { ...score, vocabularyCorrect: String(unit.vocabularyMax + 1) }, "super", []), false);
  assert.equal(isUnitScoreComplete(group, score, "super", []), true);
  const props = {
    classes: [{ id: 1, name: "Super A", level: "Super Kids 4", schedule: "", teacherName: null }],
    students: [{ id: 1, name: "Test", classId: 1, className: "Super A", level: "Super Kids 4" }],
    curriculum: curriculumDefaults, freestyleBanks: [], levelOptions: [], feedbackOptions: [],
    selectedClassId: "1", setSelectedClassId: () => {}, selectedStudentId: "1", setSelectedStudentId: () => {},
    initialUnitNumbers: [4, 5], onSaved: () => {}, openFeedbackOptions: () => {},
    editingCheck: { programCode: "SUPER_KIDS_4", unitNumber: 4, checkedAt: "2026-09-29", notes: "", feedbackJson: "[]", evaluationJson: JSON.stringify({ unitNumbers: [4, 5], unitEvaluations: [{ unitNumbers: [4], vocabularyCorrect: unit.vocabularyMax, communicationPercent: 90, pronunciation: "clear" }] }) },
  };
  const html = renderToString(React.createElement(CurriculumStudentCheck, props));
  assert.match(html, /border-emerald-300 bg-emerald-50[^>]*>[\s\S]*?aria-controls="unit-check-4"/);
  assert.match(html, /aria-controls="unit-check-4"[\s\S]*?Đã hoàn tất/);
  assert.match(html, /aria-controls="unit-check-5"[\s\S]*?Chưa hoàn tất/);
});

test("Vocabulary input explains why 50/8 cannot complete the Unit", () => {
  const unit = curriculumDefaults.find((item) => item.programCode === "SUPER_KIDS_2" && item.unitNumber === 1);
  const group = evaluationGroups([unit])[0];
  const score = { spellingPercent: "", writingPercent: "", vocabularyCorrect: "50", communicationPercent: "60", pronunciation: "clear", patternPercent: "", freestylePercent: "", patternPronunciation: "", freePronunciation: "", patternOneOrMany: "", freeOneOrMany: "", patternAmIsAre: "", freeAmIsAre: "", freestyleCategory: "", freestyleQuestions: [] };
  assert.equal(unit.vocabularyMax, 8);
  assert.equal(isUnitScoreComplete(group, score, "super", []), false);
  assert.match(unitScoreIssue(group, score, "super", []), /0 đến 8, không nhập %/);
  const html = renderToString(React.createElement(CurriculumStudentCheck, {
    classes: [{ id: 1, name: "Super A", level: "Super Kids 2", schedule: "", teacherName: null }],
    students: [{ id: 1, name: "Test", classId: 1, className: "Super A", level: "Super Kids 2" }],
    curriculum: curriculumDefaults, freestyleBanks: [], levelOptions: [], feedbackOptions: [],
    selectedClassId: "1", setSelectedClassId: () => {}, selectedStudentId: "1", setSelectedStudentId: () => {},
    initialUnitNumbers: [1], onSaved: () => {}, openFeedbackOptions: () => {},
    editingCheck: { programCode: "SUPER_KIDS_2", unitNumber: 1, checkedAt: "2026-09-29", notes: "", feedbackJson: "[]", evaluationJson: JSON.stringify({ unitNumbers: [1], unitEvaluations: [{ unitNumbers: [1], vocabularyCorrect: 50, communicationPercent: 60, pronunciation: "clear" }] }) },
  }));
  assert.match(html, /Giá trị 50 không hợp lệ/);
  assert.match(html, /aria-invalid="true"/);
});

test("Report criterion colors follow the existing Good, Average and Redflag thresholds", () => {
  assert.equal(percentCriterionTone(49, 50), "redflag");
  assert.equal(percentCriterionTone(50, 50), "average");
  assert.equal(percentCriterionTone(80, 50), "average");
  assert.equal(percentCriterionTone(81, 50), "good");
  assert.equal(vocabularyCriterionTone(5, 8), "redflag");
  assert.equal(vocabularyCriterionTone(6, 8), "average");
  assert.equal(vocabularyCriterionTone(7, 8), "good");
  assert.equal(percentCriterionTone(50, 60), "redflag");
  assert.equal(percentCriterionTone(60, 60), "average");
  assert.equal(percentCriterionTone(40, 60), "redflag");
  assert.equal(choiceCriterionTone("clear"), "good");
  assert.equal(choiceCriterionTone("incorrect"), "redflag");
  assert.equal(choiceCriterionTone(""), undefined);
});

test("Report colors each saved criterion independently within Super Kids and Cambridge units", () => {
  const superCheck = { programCode: "SUPER_KIDS_2", unitLabel: "Unit 1, Unit 2", evaluationJson: JSON.stringify({ unitEvaluations: [
    { unitNumbers: [1], vocabularyCorrect: 7, vocabularyMax: 8, communicationPercent: 50, pronunciation: "clear" },
    { unitNumbers: [2], vocabularyCorrect: 6, vocabularyMax: 8, communicationPercent: 80, pronunciation: "unclear" },
  ] }) };
  const criteria = evaluationCriteria(superCheck);
  assert.deepEqual(criteria.filter((row) => row.unitLabel === "Unit 1").map((row) => row.tone), ["good", "redflag", "good"]);
  assert.deepEqual(criteria.filter((row) => row.unitLabel === "Unit 2").map((row) => row.tone), ["average", "average", "redflag"]);
  const superHtml = renderToString(React.createElement(EvaluationCriteriaGrid, { criteria }));
  assert.match(superHtml, /border-emerald-200 bg-emerald-50[^>]*>[^<]*<span>Vocabulary<\/span><strong>7\/8<\/strong>/);
  assert.match(superHtml, /border-rose-200 bg-rose-50[^>]*>[^<]*<span>Communication<\/span><strong>50%<\/strong>/);

  const cambridge = evaluationCriteria({ programCode: "STARTERS", unitLabel: "Unit 9", evaluationJson: JSON.stringify({ patternPercent: 40, freestylePercent: 70,
    pattern: { pronunciation: "clear", oneOrMany: "incorrect", amIsAre: "correct" },
    free: { pronunciation: "unclear", oneOrMany: "correct", amIsAre: "correct" },
  }) });
  assert.equal(cambridge.find((row) => row.label === "Pattern · Điểm %").tone, "redflag");
  assert.equal(cambridge.find((row) => row.label === "Free · Điểm %").tone, "average");
  assert.equal(cambridge.find((row) => row.label === "Pattern · Pronunciation").tone, "good");
  const matrixHtml = renderToString(React.createElement(EvaluationCriteriaGrid, { criteria: cambridge }));
  assert.match(matrixHtml, /bg-rose-50 text-rose-900[^>]*>40%/);
  assert.match(matrixHtml, /bg-amber-50 text-amber-950[^>]*>70%/);
});
