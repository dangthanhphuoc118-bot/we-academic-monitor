export const vocabularyGroupLabels = ["ADJ", "NOUN", "VERB", "ADV", "PREPOSITION"] as const;

// An empty category is valid: still show its column without inventing words.
export function parseVocabularyGroups(content: string) {
  const values = new Map<string, string>();
  content.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^(ADJ|NOUN|VERB|ADV|PREPOSITION):\s*(.*)$/i);
    if (match) values.set(match[1].toUpperCase(), match[2].trim());
  });
  return values.size ? vocabularyGroupLabels.map((label) => ({ label, content: values.get(label) || "" })) : [];
}

export function parseReviewVocabularySections(content: string) {
  const lines = content.split(/\r?\n/);
  const explicit = lines.some((line) => line.startsWith("## "));
  const legacy = !explicit && lines.some((line) => /^Unit \d+:/.test(line));
  if (!explicit && !legacy) return [];
  const sections: { label: string; vocabulary: string }[] = [];
  for (const line of lines) {
    const oldHeader = legacy ? line.match(/^(Unit \d+):\s*(.*)$/) : null;
    if (explicit && line.startsWith("## ")) sections.push({ label: line.slice(3).trim(), vocabulary: "" });
    else if (oldHeader) sections.push({ label: oldHeader[1], vocabulary: oldHeader[2] });
    else if (sections.length) sections[sections.length - 1].vocabulary += `\n${line}`;
  }
  return sections.map((section) => ({ ...section, vocabulary: section.vocabulary.trim() })).filter((section) => section.label && section.vocabulary);
}
