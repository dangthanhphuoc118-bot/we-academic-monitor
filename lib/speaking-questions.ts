export type SpeakingProgramCode = "STARTERS" | "MOVERS" | "FLYERS";

export type FreestyleQuestionCategory = {
  category: string;
  yesNoQuestions: string[];
  whQuestions: string[];
};

export type FreestyleBank = {
  programCode: SpeakingProgramCode;
  programLabel: string;
  categories: FreestyleQuestionCategory[];
  updatedAt?: string | null;
};

export const defaultFreestyleBanks: Record<SpeakingProgramCode, FreestyleQuestionCategory[]> = {
  STARTERS: [
    {
      category: "Personal information",
      yesNoQuestions: [
        "Are you eight years old?",
        "Are your eyes blue?",
        "Do you wear glasses?",
        "Are you wearing red shoes today?",
        "Are your shoes new or old?",
        "Is your bike red / new / old?",
      ],
      whQuestions: [
        "What's your name?",
        "How do you spell your name?",
        "How old are you?",
        "When is your birthday?",
        "What colour are your eyes?",
        "What are you wearing?",
        "What colour is your bike / your schoolbag / house?",
      ],
    },
    {
      category: "Family and Friends",
      yesNoQuestions: [
        "Do you have a brother?",
        "Do you have a sister?",
        "Is your mother's/friend's hair long?",
        "Are your friends girls/boys?",
      ],
      whQuestions: [
        "How many people are there in your family?",
        "How old is your father/mother/brother/sister/friend?",
      ],
    },
    {
      category: "Your house",
      yesNoQuestions: [
        "Do you live in a house?",
        "Is your house big?",
        "Do you have a garden?",
      ],
      whQuestions: [
        "How many rooms are there in your house?",
        "What do you have in your living room?",
      ],
    },
    {
      category: "Sports",
      yesNoQuestions: [
        "Can you swim / play badminton?",
        "Do you like swimming?",
      ],
      whQuestions: ["What is your favorite sport?"],
    },
    {
      category: "Food",
      yesNoQuestions: [
        "Do you like chicken?",
        "Do you eat vegetables?",
      ],
      whQuestions: [
        "What's your favourite food?",
        "What do you eat for lunch / dinner?",
        "What's your favourite drink / fruit?",
        "What do you eat for lunch?",
      ],
    },
    {
      category: "Animals",
      yesNoQuestions: [
        "Do you like animals?",
        "Do you like dogs?",
        "Do you have a pet?",
      ],
      whQuestions: ["What animals do you like?"],
    },
    {
      category: "Schools",
      yesNoQuestions: [
        "Do you go to school by car?",
        "Is your school big?",
        "Do you like your school?",
      ],
      whQuestions: [
        "How do you go to school?",
        "What is the name of your school?",
        "What's your favourite subject?",
        "Who's your favorite teacher?",
        "Where is your school?",
        "What do you like to do at school?",
      ],
    },
  ],
  MOVERS: [],
  FLYERS: [],
};

const cleanQuestions = (value: unknown) => Array.isArray(value)
  ? Array.from(new Set(value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean))).slice(0, 200)
  : [];

export function normalizeFreestyleCategories(value: unknown): FreestyleQuestionCategory[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 50).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const source = item as Record<string, unknown>;
    const category = typeof source.category === "string" ? source.category.trim() : "";
    const yesNoQuestions = cleanQuestions(source.yesNoQuestions);
    const whQuestions = cleanQuestions(source.whQuestions);
    if (!category || !yesNoQuestions.length && !whQuestions.length) return [];
    return [{ category, yesNoQuestions, whQuestions }];
  });
}

export function flattenFreestyleCategories(categories: readonly FreestyleQuestionCategory[]) {
  return Array.from(new Set(categories.flatMap((category) => [...category.yesNoQuestions, ...category.whQuestions])));
}

export function sampleSpeakingQuestions(questions: readonly string[], count = 5) {
  const shuffled = [...questions];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export type FreestyleQuestionKind = "yes_no" | "wh";

export function freestyleQuestionKind(
  question: string,
  categories: readonly FreestyleQuestionCategory[]
): FreestyleQuestionKind {
  if (categories.some((category) => category.yesNoQuestions.includes(question))) return "yes_no";
  if (categories.some((category) => category.whQuestions.includes(question))) return "wh";
  return /^(am|is|are|was|were|do|does|did|can|could|will|would|have|has|had)\b/i.test(question.trim())
    ? "yes_no"
    : "wh";
}

export function splitFreestyleQuestions(
  questions: readonly string[],
  categories: readonly FreestyleQuestionCategory[]
) {
  return {
    yesNo: questions.filter((question) => freestyleQuestionKind(question, categories) === "yes_no"),
    wh: questions.filter((question) => freestyleQuestionKind(question, categories) === "wh"),
  };
}

export function sampleFreestyleQuestionsByType(
  categories: readonly FreestyleQuestionCategory[],
  count = 5
) {
  const yesNo = Array.from(new Set(categories.flatMap((category) => category.yesNoQuestions)));
  const wh = Array.from(new Set(categories.flatMap((category) => category.whQuestions)));
  const yesTarget = Math.min(yesNo.length, Math.ceil(count / 2));
  const whTarget = Math.min(wh.length, Math.floor(count / 2));
  const selected = [
    ...sampleSpeakingQuestions(yesNo, yesTarget),
    ...sampleSpeakingQuestions(wh, whTarget),
  ];
  const remaining = [...yesNo, ...wh].filter((question) => !selected.includes(question));
  return [...selected, ...sampleSpeakingQuestions(remaining, count - selected.length)].slice(0, count);
}

export function freestyleCategoryQuestions(category: FreestyleQuestionCategory) {
  return Array.from(new Set([...category.yesNoQuestions, ...category.whQuestions]));
}

export function eligibleFreestyleCategories(
  categories: readonly FreestyleQuestionCategory[],
  count = 5
) {
  return categories.filter((category) => freestyleCategoryQuestions(category).length >= count);
}

export function sampleFreestyleQuestionsFromCategory(
  category: FreestyleQuestionCategory,
  count = 5
) {
  const selected = sampleFreestyleQuestionsByType([category], count);
  return selected.slice(0, count);
}

export function findFreestyleCategoryForQuestions(
  questions: readonly string[],
  categories: readonly FreestyleQuestionCategory[]
) {
  return categories.find((category) => {
    const available = new Set(freestyleCategoryQuestions(category));
    return questions.length > 0 && questions.every((question) => available.has(question));
  });
}
