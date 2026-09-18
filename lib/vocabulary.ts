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
