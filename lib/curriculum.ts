import { speakingQuestions, type SpeakingProgramCode } from "./speaking-questions";

export type ProgramGroup = "baby" | "super" | "cambridge";

export type ProgramDefinition = {
  code: string;
  label: string;
  series: string;
  group: ProgramGroup;
  lessons: number;
  color: "rose" | "amber" | "green";
};

export type CurriculumUnit = {
  programCode: string;
  programLabel: string;
  series: string;
  group: ProgramGroup;
  unitNumber: number;
  unitLabel: string;
  topic: string;
  content: string;
  vocabulary: string;
  grammar: string;
  freestyleQuestions: string[];
  vocabularyMax: number;
  writingRef: string;
  dayStart: number;
  dayEnd: number;
  isOverride?: boolean;
};

export type LearningCheck = {
  id: number;
  createdAt?: string;
  studentId: number;
  studentName: string;
  classId: number | null;
  className: string | null;
  programCode: string;
  programLabel: string;
  unitNumber: number;
  unitLabel: string;
  teacherName: string;
  checkedAt: string;
  evaluationJson: string;
  overallScore: number;
  result: string;
  feedbackJson: string;
  notes: string;
  actionPlan: string;
};

export type StudentCheckQueueItem = {
  id: number;
  studentId: number;
  studentName: string;
  classId: number | null;
  className: string | null;
  level: string;
  scheduledDate: string;
  status: "pending" | "completed";
  createdBy: string;
  completedAt: string | null;
};

export const programs: ProgramDefinition[] = [
  { code: "BABY_STARS", label: "Baby Stars", series: "Baby Stars", group: "baby", lessons: 36, color: "rose" },
  { code: "SUPER_KIDS_1", label: "Super Kids 1", series: "Smart Explorers 1", group: "super", lessons: 24, color: "amber" },
  { code: "SUPER_KIDS_2", label: "Super Kids 2", series: "Smart Explorers 2", group: "super", lessons: 24, color: "amber" },
  { code: "SUPER_KIDS_3", label: "Super Kids 3", series: "Smart Learners 1", group: "super", lessons: 24, color: "amber" },
  { code: "SUPER_KIDS_4", label: "Super Kids 4", series: "Smart Learners 2", group: "super", lessons: 24, color: "amber" },
  { code: "SUPER_KIDS_5", label: "Super Kids 5", series: "Smart Performers 1", group: "super", lessons: 24, color: "amber" },
  { code: "SUPER_KIDS_6", label: "Super Kids 6", series: "Smart Performers 2", group: "super", lessons: 24, color: "amber" },
  { code: "SUPER_KIDS_7", label: "Super Kids 7", series: "Smart Achievers 1", group: "super", lessons: 24, color: "amber" },
  { code: "SUPER_KIDS_8", label: "Super Kids 8", series: "Smart Achievers 2", group: "super", lessons: 24, color: "amber" },
  { code: "STARTERS", label: "Starters", series: "Cambridge Young Learners", group: "cambridge", lessons: 36, color: "green" },
  { code: "MOVERS", label: "Movers", series: "Cambridge Young Learners", group: "cambridge", lessons: 36, color: "green" },
  { code: "FLYERS", label: "Flyers", series: "Cambridge Young Learners", group: "cambridge", lessons: 36, color: "green" },
];

type SourceUnit = Omit<CurriculumUnit, "programCode" | "programLabel" | "series" | "group" | "unitLabel" | "dayStart" | "dayEnd" | "freestyleQuestions"> & {
  unitLabel?: string;
  dayStart?: number;
  dayEnd?: number;
  freestyleQuestions?: string[];
};

function units(programCode: string, source: SourceUnit[]): CurriculumUnit[] {
  const program = programs.find((item) => item.code === programCode)!;
  return source.map((item) => ({
    ...item,
    freestyleQuestions: item.freestyleQuestions
      ? [...item.freestyleQuestions]
      : program.group === "cambridge"
        ? [...(speakingQuestions[programCode as SpeakingProgramCode] || [])]
        : [],
    programCode,
    programLabel: program.label,
    series: program.series,
    group: program.group,
    unitLabel: item.unitLabel ?? `Unit ${item.unitNumber}`,
    dayStart: item.dayStart ?? (item.unitNumber - 1) * 3 + 1,
    dayEnd: item.dayEnd ?? item.unitNumber * 3,
  }));
}

const babyContents = [
  "Teach A - B",
  "Review & Teach C - D",
  "Review ABCD & Practice",
  "Review & Teach E - F",
  "Review ABCDEF & Practice",
  "Review & Teach G - H",
  "Review ABCDEFGH & Practice",
  "Review & Teach I - J",
  "Review ABCDEFGHIJ & Practice",
  "Review & Teach K - L",
  "Review ABCDEFGHIJKL & Practice",
  "Review & Teach M - N",
  "Review ABCDEFGHIJKLMN & Practice",
  "Review & Teach O - P",
  "Review ABCDEFGHIJKLMNOP & Practice",
  "Review & Teach Q - R",
  "Review ABCDEFGHIJKLMNOPQR & Practice",
  "Review & Teach S - T",
  "Review ABCDEFGHIJKLMNOPQRST & Practice",
  "Review & Teach U - V",
  "Review ABCDEFGHIJKLMNOPQRSTUV & Practice",
  "Review & Teach W - X",
  "Review ABCDEFGHIJKLMNOPQRSTUVWX & Practice",
  "Review & Teach Y - Z",
  "Review ABCDEFGHIJKLMNOPQRSTUVWXYZ & Practice",
  ...Array.from({ length: 11 }, () => "All reviews"),
];

const babyStars = units("BABY_STARS", babyContents.map((content, index) => ({
  unitNumber: index + 1,
  unitLabel: `Day ${index + 1}`,
  topic: index < 25 ? "Alphabet follow-up" : "All reviews",
  content,
  vocabulary: "",
  grammar: "",
  vocabularyMax: 0,
  writingRef: "",
  dayStart: index + 1,
  dayEnd: index + 1,
})));

const superKids1 = units("SUPER_KIDS_1", [
  { unitNumber: 1, topic: "Back to School", content: "Vocabulary and communication follow-up", vocabulary: "Book - crayon - pencil - notebook - book bag - pencil case - pen - ruler", grammar: "It's a pencil. What is this? It's a pencil.", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 2, topic: "My Family", content: "Vocabulary and communication follow-up", vocabulary: "Mother - father - big sister - big brother - little sister - little brother - grandmother - grandfather", grammar: "She's my little sister. He's my little brother. Who's she? She's my little sister. Who's he? He's my little brother.", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 3, topic: "On a Picnic", content: "Vocabulary and communication follow-up", vocabulary: "Rice - chicken - cake - candy - water - juice - milk - tea", grammar: "I like chicken. I don't like chicken. Do you like chicken? Yes, I do. / No, I don't.", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 4, topic: "Having Fun", content: "Vocabulary and communication follow-up", vocabulary: "Swim - skate - skateboard - fly a kite - draw - ride a bike - juggle - sing", grammar: "I can swim. I can't swim. Can you swim? Yes, I can. / No, I can't.", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 5, topic: "Pet Day", content: "Vocabulary and communication follow-up", vocabulary: "Dog - cat - rabbit - hamster - turtle - bird - fish - snake", grammar: "This is a snake. Is this a snake? Yes, it is. Is this a rabbit? No, it isn't.", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 6, topic: "In the Classroom", content: "Vocabulary and communication follow-up", vocabulary: "Clock - board - door - desk - CD player - trash can - computer - chair", grammar: "This is a computer. That's a clock. What's this? It's a CD player. What's that? It's a CD player.", vocabularyMax: 8, writingRef: "" },
]);

const superKids2 = units("SUPER_KIDS_2", [
  { unitNumber: 1, topic: "At Home", content: "Vocabulary and communication follow-up", vocabulary: "Reading - painting - dancing - watching TV - eating - sleeping - playing - coloring", grammar: "I'm coloring. What are you doing? I'm coloring.", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 2, topic: "Playing Sports", content: "Vocabulary and communication follow-up", vocabulary: "Bat - glove - baseball - basketball - soccer ball - helmet - racket - paddle", grammar: "I have a glove. I don't have a glove. Do you have a glove? No, I don't. / Yes, I do.", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 3, topic: "Craft Time", content: "Vocabulary and communication follow-up", vocabulary: "Rulers - crayons - erasers - staplers - colored pencils - pens - markers - hats", grammar: "I have 1 pen. I have 2 pens. How many pens do you have?", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 4, topic: "Feelings", content: "Vocabulary and communication follow-up", vocabulary: "Happy - sad - sleepy - angry - sick - hot - cold - scared", grammar: "I am scared. Are you scared? Yes, I am. / No, I'm not.", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 5, topic: "Our House", content: "Vocabulary and communication follow-up", vocabulary: "Kitchen - living room - dining room - hall - bedroom - bathroom - closet - yard", grammar: "Joey is in the bathroom. Where's Joey? He's in the bathroom.", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 6, topic: "Weather", content: "Vocabulary and communication follow-up", vocabulary: "Sunny - cloudy - windy - rainy - snowy - foggy - warm - cool", grammar: "It's windy. What's the weather like? It's windy.", vocabularyMax: 8, writingRef: "" },
]);

const superKids3 = units("SUPER_KIDS_3", [
  { unitNumber: 1, topic: "Telling Time", content: "Vocabulary and communication follow-up", vocabulary: "1:00 - 2:00 - 3:00 - 4:00 - 5:00 - 6:00 - 7:00 - 8:00 - 9:00 - 10:00 - 11:00 - 12:00", grammar: "It's 12:00. What time is it?", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 2, topic: "In a Toy Store", content: "Vocabulary and communication follow-up", vocabulary: "Kites - video games - board games - toy cars - comic books - yo-yos - balloons - rockets", grammar: "These are yo-yos. Those are kites. What are these? These are yo-yos. What are those? Those are kites.", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 3, topic: "Eating Out", content: "Vocabulary and communication follow-up", vocabulary: "Spaghetti - French fries - fish - salad - ice cream - noodles - fruit - soup", grammar: "I want noodles. We want soup. What do you want? I want noodles. / We want soup.", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 4, topic: "Art Class", content: "Vocabulary and communication follow-up", vocabulary: "Scissors - paintbrushes - paints - stickers - pins - in - on - under", grammar: "The scissors are in the box. Where are the scissors? They're in the box.", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 5, topic: "After School", content: "Vocabulary and communication follow-up", vocabulary: "English class - math class - calligraphy class - swimming class - dance class - soccer practice - judo practice - baseball practice", grammar: "Where are you going? I'm going to judo practice.", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 6, topic: "Class Party", content: "Vocabulary and communication follow-up", vocabulary: "Eating a snack - drinking juice - playing the drums - watching a DVD - reading a book - feeding the hamster - painting a picture - drawing a map", grammar: "He's drawing a map. What's Mojo doing? He's drawing a map.", vocabularyMax: 8, writingRef: "" },
]);

const superKids4 = units("SUPER_KIDS_4", [
  { unitNumber: 1, topic: "Days", content: "Vocabulary and communication follow-up", vocabulary: "Sunday - Monday - Tuesday - Wednesday - Thursday - Friday - Saturday", grammar: "It's Monday. What day is it today? It's Monday.", vocabularyMax: 7, writingRef: "" },
  { unitNumber: 2, topic: "Favorite Sports", content: "Vocabulary and communication follow-up", vocabulary: "Ping-pong - soccer - volleyball - gymnastics - badminton - hockey - running - tennis", grammar: "She likes tennis. He doesn't like tennis. Does Peter like tennis? No, he doesn't. Does Sandy like ping-pong? Yes, he does.", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 3, topic: "Lunch", content: "Vocabulary and communication follow-up", vocabulary: "Pizza - cheese - watermelon - pretzels - grapes - potato chips - crackers - peanuts", grammar: "He has some pizza. She doesn't have any pizza. Does she have any pizza? No, she doesn't. Does she have any potato chips? Yes, she does.", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 4, topic: "Months", content: "Vocabulary and communication follow-up", vocabulary: "January - February - March - April - May - June - July - August - September - October - November - December", grammar: "My birthday's in November. When's your birthday? It is in November.", vocabularyMax: 12, writingRef: "" },
  { unitNumber: 5, topic: "Careers", content: "Vocabulary and communication follow-up", vocabulary: "Vet - teacher - baseball player - magician - pilot - doctor - police officer - firefighter", grammar: "She's a vet. He's a pilot. Is she a vet? Yes, she is. Is he a police officer? Yes, he is. / No, he isn't.", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 6, topic: "His and Hers", content: "Vocabulary and communication follow-up", vocabulary: "Handkerchief - water bottle - towel - lunchbox - baseball cap - key - his - her", grammar: "It's his lunchbox. It's her baseball cap. Whose lunchbox is this? It's his lunchbox. Whose baseball cap is this? It's her baseball cap.", vocabularyMax: 8, writingRef: "" },
]);

const superKids5 = units("SUPER_KIDS_5", [
  { unitNumber: 1, topic: "What I Did", content: "Vocabulary and communication follow-up", vocabulary: "Play/played baseball - study/studied English - watch/watched DVDs - bake/baked cookies - paint/painted pictures - brush/brushed the dog - wash/washed the car - practice/practiced the piano", grammar: "She baked cookies. Did she wash the car yesterday? No, she didn't. Did you play baseball yesterday? Yes, I did.", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 2, topic: "My Day", content: "Vocabulary and communication follow-up", vocabulary: "Make/made a poster - see/saw a movie - sing/sang a new song - swim/swam in the pool - go/went to the park - write/wrote stories - read/read books - draw/drew pictures", grammar: "They saw a movie. What did they do today? They saw a movie.", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 3, topic: "Around Town", content: "Vocabulary and communication follow-up", vocabulary: "Restaurant - bookstore - pet shop - toy store - museum - bakery - supermarket - library", grammar: "He's going to the pet shop. Where's Donny going? He's going to the pet shop.", vocabularyMax: 8, writingRef: "" },
  { unitNumber: 4, topic: "Countries", content: "Vocabulary and communication follow-up", vocabulary: "Australia - Japan - Mexico - the U.S. - Korea - the U.K. - Brazil - China - Spain - Taiwan", grammar: "We're going to the U.K. They're not going to Brazil. Are you going to the U.K.? Yes, we are. Are they going to Brazil? No, they're not.", vocabularyMax: 10, writingRef: "" },
  { unitNumber: 5, topic: "In My Backpack", content: "Vocabulary and communication follow-up", vocabulary: "Suitcase - toothbrush - camera - flashlight - journal - passport - ticket - mine - his - hers", grammar: "It's not mine. It's hers. Is this your suitcase? No, it's not. It's hers. / Yes, it is.", vocabularyMax: 10, writingRef: "" },
  { unitNumber: 6, topic: "Animals in Australia", content: "Vocabulary and communication follow-up", vocabulary: "Kangaroo - koala - platypus - crocodile - wombat - emu - big/bigger - small/smaller - fast/faster - slow/slower", grammar: "A kangaroo is fast, but an emu is faster. Is a kangaroo fast? Yes, it is, but an emu is faster.", vocabularyMax: 10, writingRef: "" },
]);

const superKids6 = units("SUPER_KIDS_6", [
  { unitNumber: 1, topic: "Souvenirs in Japan", content: "Vocabulary and communication follow-up", vocabulary: "Fans - key chains - postcard - T-shirt - sweatshirts - wallets - mugs - in front of - behind - above", grammar: "The fans are behind the key chains. Where are the fans? They're behind the key chains.", vocabularyMax: 10, writingRef: "" },
  { unitNumber: 2, topic: "A Family in Mexico", content: "Vocabulary and communication follow-up", vocabulary: "Grandma - grandpa - aunt - uncle - cousin - tall/taller - short/shorter - strong/stronger - old/older - young/younger", grammar: "My brother's stronger than my cousin. Who's stronger, your brother or your cousin? My brother's stronger.", vocabularyMax: 10, writingRef: "" },
  { unitNumber: 3, topic: "Places in New York", content: "Vocabulary and communication follow-up", vocabulary: "Post office - bank - arcade - museum - drugstore - hospital - police station - movie theater - candy store - gift shop", grammar: "I was in the candy store. She was in the hospital. Where were you? I was in the candy store. Where was she? She was in the hospital.", vocabularyMax: 10, writingRef: "" },
  { unitNumber: 4, topic: "Sightseeing in Korea", content: "Vocabulary and communication follow-up", vocabulary: "Go sightseeing - take pictures - play cards - take a boat ride - buy souvenirs - send emails - call home - write postcards - go to the aquarium - see a show", grammar: "She doesn't want to take a boat ride. He wants to play cards. Does Toni want to take a boat ride? No, she doesn't. Does Chip want to play cards? Yes, he does.", vocabularyMax: 10, writingRef: "" },
  { unitNumber: 5, topic: "Fun Day in the U.K.", content: "Vocabulary and communication follow-up", vocabulary: "Merry-go-round - bumper cars - Ferris wheel - roller coaster - cable cars - cotton candy - ice cream - caramel corn - corn dogs - snow cones", grammar: "We're going to go on the Ferris wheel. Then we're going to get some cotton candy. What are you going to do?", vocabularyMax: 10, writingRef: "" },
  { unitNumber: 6, topic: "What We Did", content: "Vocabulary and communication follow-up", vocabulary: "Saw a platypus - climbed a mountain - made a new friend - ate tacos - went to a party - rode a roller coaster - went to a museum - had a picnic - took a boat ride - bought souvenirs", grammar: "We rode a roller coaster. What did you do in the U.K.? We rode a roller coaster.", vocabularyMax: 10, writingRef: "" },
]);

const superKids7 = units("SUPER_KIDS_7", [
  { unitNumber: 1, topic: "Introductions", content: "Vocabulary and communication follow-up", vocabulary: "Build models - collect stickers - cook - ice skate - go on the Internet - Mexico/Spanish - Korea/Korean - Taiwan/Chinese - Australia/English", grammar: "He likes to build models. What does he like to do? He likes to build models.", vocabularyMax: 10, writingRef: "" },
  { unitNumber: 2, topic: "The Best", content: "Vocabulary and communication follow-up", vocabulary: "Tallest - shortest - oldest - fastest - best - chess player - soccer player - actor - artist - singer", grammar: "Donny is the tallest in the class. Who's the tallest in the class? Donny.", vocabularyMax: 10, writingRef: "" },
  { unitNumber: 3, topic: "Getting Up", content: "Vocabulary and communication follow-up", vocabulary: "Stomachache - headache - cold - fever - sore throat - brush/brushed your teeth - comb/combed your hair - wash/washed your face - pack/packed your bag - do/did your homework", grammar: "I brushed my teeth. She didn't brush her teeth. Did you brush your teeth? Yes, I did.", vocabularyMax: 10, writingRef: "" },
  { unitNumber: 4, topic: "Planning a Fair", content: "Vocabulary and communication follow-up", vocabulary: "Have an international fair - send the invitations - put on a play - visit a farm - pick strawberries - tonight - tomorrow - on Thursday - next week - next month", grammar: "We're going to send the invitations tomorrow. When are we going to send the invitations? Tomorrow.", vocabularyMax: 10, writingRef: "" },
  { unitNumber: 5, topic: "A School Fire Drill", content: "Vocabulary and communication follow-up", vocabulary: "Classroom - playground - lunchroom - gym - office - talking to the principal - doing gymnastics - eating lunch - looking at a magazine - taking a test", grammar: "I was talking to the principal. What were you doing? I was talking to the principal.", vocabularyMax: 10, writingRef: "" },
  { unitNumber: 6, topic: "Helping at Home", content: "Vocabulary and communication follow-up", vocabulary: "Rake the leaves - wipe the table - take out the trash - pull the weeds - sweep the steps - wash the dishes - vacuum the carpet - make your bed - hang up your clothes - clean up your room", grammar: "He has to rake the leaves. Does he have to rake the leaves? Yes, he does.", vocabularyMax: 10, writingRef: "" },
]);

const superKids8 = units("SUPER_KIDS_8", [
  { unitNumber: 1, topic: "Getting Around", content: "Vocabulary and communication follow-up", vocabulary: "Take a train - take a bus - take the subway - go by car - walk - always - usually - sometimes - hardly ever - never", grammar: "I usually walk to school. How do you get to school? I usually walk.", vocabularyMax: 10, writingRef: "" },
  { unitNumber: 2, topic: "Setting the Table", content: "Vocabulary and communication follow-up", vocabulary: "Bowls - plates - knives - forks - spoons - soy sauce - salt - pepper - sugar - ketchup", grammar: "There's some soy sauce. There isn't any soy sauce. There are some spoons. There aren't any spoons. Is there any soy sauce? Are there any spoons?", vocabularyMax: 10, writingRef: "" },
  { unitNumber: 3, topic: "In the International Fair", content: "Vocabulary and communication follow-up", vocabulary: "Broke the piñata - dropped the cake - spilled the juice - won the prize - brought the kimchi - magic show - clowns - fireworks - band - food", grammar: "Who broke the piñata? Toni. Toni broke the piñata.", vocabularyMax: 10, writingRef: "" },
  { unitNumber: 4, topic: "Summer Vacation", content: "Vocabulary and communication follow-up", vocabulary: "South Africa - Hawaii - Canada - the Grand Canyon - the Great Barrier Reef - summer camp - wildlife park - mountains - beach - grandparents' house", grammar: "It takes 7 hours to get to Hawaii by plane. How long does it take to get to Hawaii? It takes 7 hours by plane.", vocabularyMax: 10, writingRef: "" },
  { unitNumber: 5, topic: "Lost in Hawaii", content: "Vocabulary and communication follow-up", vocabulary: "Straight black hair - long blond hair - curly red hair - short brown hair - I/me - you/you - he/him - she/her - we/us - they/them", grammar: "She's shorter than me. We're younger than them. Is she taller than you? No, she's not. Are you younger than them? No, we're not.", vocabularyMax: 10, writingRef: "" },
  { unitNumber: 6, topic: "Summer Camp in Canada", content: "Vocabulary and communication follow-up", vocabulary: "Gone canoeing - made a campfire - slept in a tent - used a compass - caught a fish - sleeping bag - life jacket - Thermos - sunscreen - bug spray", grammar: "I've never gone canoeing. We've slept in a tent. Have you ever gone canoeing? No, I haven't. / Yes, I have.", vocabularyMax: 10, writingRef: "" },
]);

const starters = units("STARTERS", [
  { unitNumber: 1, topic: "I Love Animals", content: "Vocabulary and communication check", vocabulary: "Bee - bird - chicken - cow - donkey - duck - fish - frog - goat - horse - mice - sheep - mouse - cat - dog - monkey - tiger", grammar: "Where is the ...? Where are the ...? What is ... doing?", vocabularyMax: 17, writingRef: "" },
  { unitNumber: 2, topic: "At Home", content: "Vocabulary, writing and communication check", vocabulary: "Armchair - bath - bathroom - bed - bedroom - clock - computer - cupboard - dining room - floor - garden - hall - home - kitchen - living room - mat - phone - radio - right - room - television - rug - window - sofa - lamp - door - table - bookcase - wall - mirror - picture - behind - between - under - in front of", grammar: "Where is the ...? Where are the ...? What is ... doing?", vocabularyMax: 35, writingRef: "" },
  { unitNumber: 3, topic: "Family and Friends", content: "Vocabulary and communication check", vocabulary: "Baby - boy - big - brother - dad - family - father - friends - funny - girl - grandfather - grandmother - happy - his - mother - old - sad - scary - pet - sister - small - young - cousin - grandma - grandpa - grandparents", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 26, writingRef: "" },
  { unitNumber: 4, topic: "Food", content: "Vocabulary, writing and communication check", vocabulary: "Banana - beans - bread - breakfast - burger - carrot - chips - coconut - dinner - eat - egg - favourite - food - fruit - grape - kiwi - lemon - lime - lunch - mango - meal - meat - meatball - onion - pear - peas - pie - pineapple - potato - rice - tomato - watermelon - orange - sausage", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 34, writingRef: "" },
  { unitNumber: 5, topic: "I Like Clothes", content: "Vocabulary and communication check", vocabulary: "Bag - baseball cap - boots - clothes - dress - glasses - handbag - hat - jacket - jeans - shirt - shoes - shorts - skirt - socks - trousers - T-shirt - watch - wear", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 19, writingRef: "" },
  { unitNumber: 6, topic: "Look at Us", content: "Vocabulary, writing and communication check", vocabulary: "Arm - body - ear - eye - face - foot - feet - hair - hand - head - leg - mouth - nose - short - ugly - tail - alien - monster - doll - play - toy - kite - robot - spider - teddy bear", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 25, writingRef: "" },
  { unitNumber: 7, topic: "We Love School", content: "Vocabulary and communication check", vocabulary: "Board - book - boy - children - classmates - classroom - crayon - draw - English - girl - good - kids - keyboard - painting - paper - pen - pencil - poster - rubber - ruler - school - show - sit - sleep - some - stand - talk - teacher - word - write - computer - mouse - letter - page", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 34, writingRef: "" },
  { unitNumber: 8, topic: "In the Playground", content: "Vocabulary, writing and communication check", vocabulary: "Badminton - ball - baseball - basketball - bike - bounce - catch - football - here - hit - hockey - kick - playground - ride - run - sport - table tennis - tennis - throw - too - wall - walk", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 22, writingRef: "" },
  { unitNumber: 9, topic: "My Hobbies", content: "Vocabulary and communication check", vocabulary: "Board game - cake - double - draw - enjoy - guitar - hobby - jump - love - listen - music - paint - park - piano - picture - read - sea - sing - song - spell - sport - story - swim - kite", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 24, writingRef: "" },
  { unitNumber: 10, topic: "Your Day", content: "Vocabulary, writing and communication check", vocabulary: "About - afternoon - again - bed - day - English - get - go to bed - go to sleep - goodbye - have - lesson - morning - paint - painting", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 15, writingRef: "" },
  { unitNumber: 11, topic: "In the Street", content: "Vocabulary and communication check", vocabulary: "Angry - bus - car - child - class - clean - closed - dirty - fly - go - helicopter - her - motorbike - new - nice - open - people - sad - ship - shop - street - train - women - lorry - plane - wave", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 23, writingRef: "" },
  { unitNumber: 12, topic: "Happy Birthday", content: "Vocabulary, writing and communication check", vocabulary: "Balloon - bat - camera - chocolates - lemonade - milk - mine - party - present - see you - skateboard - tablet - tennis racket - whose", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 14, writingRef: "" },
]);

const movers = units("MOVERS", [
  { unitNumber: 1, topic: "At the Park", content: "Vocabulary and communication check", vocabulary: "ADJ: All right - Asleep - Careful - Orange - Pink - Yellow - Black - Green - Purple - Brown - Blue - Red - Grey - Young - Big - Short - Long - Bigger - Younger - Taller - Older - Smaller - Shorter\nNOUN: Coat - Roller skating - Tennis - Drawing - Basketball\nVERB: Carry - Climb - Fall - Fish - Help - Hop - Skip - Walk - Laugh - Roller skate - Dance - Cry - Hide\nADV: All right - Down\nPREPOSITION: A pair of - Be good at", grammar: "Pattern and freestyle communication", vocabularyMax: 20, writingRef: "" },
  { unitNumber: 2, topic: "A Busy Week", content: "Vocabulary and communication check", vocabulary: "ADJ:\nNOUN: CD - DVD - E-book - Film - Homework - Idea - Internet - Music - Thing - Website - Week - Weekend - Shopping - Monday - Tuesday - Wednesday - Thursday - Friday - Saturday - Sunday\nVERB: Cook - Drive - Email - Go shopping - Practice - Ride - Sail - Swim - Text - Walk - Wash - Call - Text my friends - Do my homework - Watch TV - Cook dinner\nADV: Every - Sometimes - Never - Often - Always\nPREPOSITION: At - On - At the weekend - On Saturdays - On Sundays - On Wednesdays", grammar: "Pattern and freestyle communication", vocabularyMax: 17, writingRef: "" },
  { unitNumber: 3, topic: "In the Town", content: "Vocabulary and communication check", vocabulary: "ADJ: Afraid - Busy - Cold - Hot - Huge - Last - Surprised - Tired - Wet\nNOUN: App - Band - Bus station - Café - Car park - Circus - Funfair - Library - Market - Pop star - Present - Roof - Shopping centre - Sports centre - Square - Station - Supermarket - Town centre - Town - Playground - Hospital - Train station\nVERB: Be called - Buy - Catch - Practise\nADV: After - Then - Yesterday\nPREPOSITION: Above - Below - Near - Opposite", grammar: "Pattern and freestyle communication", vocabularyMax: 17, writingRef: "" },
  { unitNumber: 4, topic: "At Home", content: "Vocabulary and communication check", vocabulary: "ADJ: Any\nNOUN: Bat - Blanket - Cage - Comic - Ground - Helmet - Laptop - Map of the World - Plant - Shop - Shower - Square - Thing - Toothbrush - Toothpaste - Towel\nVERB: Dance - Drop - Get dressed - Get up - Look for - Lose - Shout - Think - Wake - Picked up - Looked - Danced - Dropped - Shouted - Walked - Smiled - Shopped - Planted - Skipped - Listened - Closed - Called - Fished - Watched - Sailed - Emailed - Opened\nADV: Around - Downstairs - Inside - Outside - Round - Upstairs\nPREPOSITION: Around - Inside - Outside - Round", grammar: "Pattern and freestyle communication", vocabularyMax: 12, writingRef: "" },
  { unitNumber: 5, topic: "Let's Go on Holiday", content: "Vocabulary and communication check", vocabulary: "ADJ: Blonde - Curly - Fair - Grown-up - Loud\nNOUN: Age - Aunt - Beard - Build - Circle - Daughter - Granddaughter - Grandparent - Grandson - Milkshake - Pool - Seat - Stairs - Wave - Ticket - Cinema - Lift - Sea - Balcony - Beach - Swimming pool - Movie - Elevator - Chair - Snake - Pear - Story - Lunch - Ice cream - Book - Cake\nVERB: Could - Grow - Send - Wait - Sleep - Watch - Go - Swim - Play - Have\nADV: Loudly\nPREPOSITION:", grammar: "Pattern and freestyle communication", vocabularyMax: 10, writingRef: "" },
  { unitNumber: 6, topic: "My Favourite", content: "Vocabulary and communication check", vocabulary: "ADJ: Brilliant - Difficult - Easy - Exciting - Famous - Hungry - Kind - Little - Terrible - Worse - Worst\nNOUN: Bottle - Bowl - Cheese - Coffee - Cook - Cup - Glass - Noodles - Machine - Mistake - Nurse - Pirate - Place - Score - Treasure - Video - Village - Camera - Doctor - Town - Clown - Island - City - Farmer - Jungle - Train driver - Robot\nVERB: Break - Feed - Have to - Work - Would - Would you like\nADV: Before - More - Most\nPREPOSITION:", grammar: "Pattern and freestyle communication", vocabularyMax: 16, writingRef: "" },
  { unitNumber: 7, topic: "This Is My Family", content: "Vocabulary and communication check", vocabulary: "ADJ: Bad - Good - Loud - Quiet - Slow - Quick\nNOUN: Mother - Father - Mum - Dad - Grandpa - Grandma - Grandmother - Grandfather - Brother - Sister - Parents - Son - Daughter - Children - Child - Grown-ups - Uncle - Aunt - Cousin\nVERB:\nADV:\nPREPOSITION:", grammar: "Pattern and freestyle communication", vocabularyMax: 19, writingRef: "" },
  { unitNumber: 8, topic: "What's for Lunch?", content: "Vocabulary and communication check", vocabulary: "ADJ: Big\nNOUN: Cheese - Chicken - Milk - Pasta - Coffee - Salad - Tea - Water - Soup - Sandwiches - Vegetables - Noodles - Floor - Plants - Fish - Alphabet - Bag\nVERB: Feed - Sit - Say - Carry - Go\nADV: Outside\nPREPOSITION: On", grammar: "Pattern and freestyle communication", vocabularyMax: 12, writingRef: "" },
  { unitNumber: 9, topic: "Do You Like Animals?", content: "Vocabulary and communication check", vocabulary: "ADJ:\nNOUN: Kangaroo - Kitten - Parrot - Puppy - Rabbit - Giraffe - Hippo - Shark - Penguin - Whale - Dolphin - Crocodile - Bear - Snail - Tiger - Panda - Lion - Bat - Fly\nVERB:\nADV: Up - Down - Round\nPREPOSITION: Into - Out of - Onto - Off", grammar: "Pattern and freestyle communication", vocabularyMax: 19, writingRef: "" },
  { unitNumber: 10, topic: "The Weather", content: "Vocabulary and communication check", vocabulary: "ADJ: Cold - Hot - Windy - Cloudy - Sunny\nNOUN: Wind - Sun - Snow - Rain - Moon - Rainbow - Stars - Cloud - Ice\nVERB: Drive - Take off - Ask - Put on - Make - Catch - Answer - Cook\nADV:\nPREPOSITION:", grammar: "Pattern and freestyle communication", vocabularyMax: 14, writingRef: "" },
  { unitNumber: 11, topic: "What's the Matter?", content: "Vocabulary and communication check", vocabulary: "ADJ: Sad - Fine - Dry - Quiet - Naughty - Fat - Strong - Short - Loud - Clever - Thin - Ugly - Tall - Weak - Wet - Pretty\nNOUN: Shoulder - Stomach - Leg - Foot - Head - Teeth - Neck - Back - Hand - Temperature - Cough - Cold - Earache - Headache - Stomachache\nVERB:\nADV:\nPREPOSITION:", grammar: "Pattern and freestyle communication", vocabularyMax: 15, writingRef: "" },
  { unitNumber: 12, topic: "In the Countryside", content: "Vocabulary and communication check", vocabulary: "ADJ:\nNOUN: Grass - River - Field - Waterfall - Mountain - Farm - Lake - Forest - Leaf - Rock - Road - Sky\nVERB:\nADV:\nPREPOSITION:", grammar: "Pattern and freestyle communication", vocabularyMax: 12, writingRef: "" },
]);

const flyers = units("FLYERS", [
  { unitNumber: 1, topic: "Our Home", content: "Vocabulary and communication check", vocabulary: "ADJ: Bored - Broken - Clever - Dear - Difficult - Empty - Friendly - Full - Fun - Important - Interesting - Kind - Unkind - Late - Little - Lucky - Much - Noisy - Popular - Quiet - Tidy - Untidy\nNOUN: Bin - Bit - Brush - Channel - Chess - College - Cooker - Cushion - Cycle - Diary - Drums - Envelope - File - Fridge - Key - Letter - Meal - Mirror - Necklace - News - Oven - Paper - Post - Postcard - Programme - Rucksack - Shampoo - Soap - Stamps - Violin - Bracelet - Anyone - Anything - Anywhere - Everyone - Everything - Everywhere - No one - Comb - Telephone - Shelf\nVERB: Arrive - Borrow - Brush - Chat - Cycle - Go out - Keep - Post - Search\nADV: Away\nPREPOSITION: After - Before", grammar: "Pattern and freestyle communication", vocabularyMax: 19, writingRef: "" },
  { unitNumber: 2, topic: "Going to Town", content: "Vocabulary and communication check", vocabulary: "ADJ: Expensive - Cheap - Unhappy - Lovely\nNOUN: Airport - Ambulance - Bank - Bicycle - Bridge - Castle - Chemist's - Corner - Factory - Fire engine - Fire station - Front - Hill - Hotel - Middle - Money - Motorway - Museum - Police station - Post office - Pyjamas - Railway station - Restaurant - Sky - Skyscraper - Stadium - Taxi - Traffic - University - Wood\nVERB: Fetch - Forget - Get to - Remember - Will\nADV: How long - Later\nPREPOSITION: Past - Through - Next to - Behind - Between - In front of", grammar: "Pattern and freestyle communication", vocabularyMax: 21, writingRef: "" },
  { unitNumber: 3, topic: "Eating Out", content: "Vocabulary and communication check", vocabulary: "ADJ: Amazing - Dangerous - Delicious - Excited - Frightened - Hard - Noisy - Similar - Soft - Slow\nNOUN: Biscuit - Bracelet - Butter - Chopsticks - Chocolate - Flour - Fork - Group - Honey - Jam - Knife - Lovely - Medicine - Olives - Olive - Pepper - Piece - Pizza - Rock - Salt - Spoon - Strawberry - Sugar - Surprise - Tortoise - Wool - Yoghurt\nVERB: Feel - Finish - Hear - Look like - Mind - Smell - Sound - Spend - Tastes - Travel - Visit\nADV: \nPREPOSITION: ", grammar: "Pattern and freestyle communication", vocabularyMax: 20, writingRef: "" },
  { unitNumber: 4, topic: "At School", content: "Vocabulary and communication check", vocabulary: "ADJ: Difficult - Enormous - Excellent - Favourite - Frightened - Lazy - Same - Sure - Tired\nNOUN: Art - Beetle - Card - Club - Dictionary - Geography - Half - History - Information - Invitation - It - Languages - Maths - Metal - Midday - Midnight - Music - Platform - Program - Quarter - Quiz - Scarf - Science - Sport - Subject - Test - Timetable\nVERB: Agree - Borrow - Cut - Disappear - Improve - Join - Repeat - Save - Study\nADV: A.m - Actually - O'clock - P.m\nPREPOSITION: During - Past - To", grammar: "Pattern and freestyle communication", vocabularyMax: 12, writingRef: "" },
  { unitNumber: 5, topic: "A Day Out", content: "Vocabulary and communication check", vocabulary: "ADJ: Brave - Cheap - Empty - Extinct - Frightening - High - Interesting - Pleased - Several - Special - Wild\nNOUN: Actor - Air - Cage - Cartoon - Cereal - Cinema - Circus - Clown - Dinosaurs - Gym - Hole - Hour - Million - Museum - Ocean - Project - Pyramids - Screen - Seat - Stamp - Swing - Stage - Telephone - Theatre - Tune - Wild animals - Zoo\nVERB: Act - Find out - Hate - Sell - Stay\nADV: Ago - Also - Tomorrow - Evening - Afternoon - Night - Morning\nPREPOSITION: ", grammar: "Pattern and freestyle communication", vocabularyMax: 20, writingRef: "" },
  { unitNumber: 6, topic: "Dream Job", content: "Vocabulary and communication check", vocabulary: "ADJ: Early - Fast - Lazy - Poor - Rich\nNOUN: Artist - Astronaut - Bandage - Businessman/woman - Clown - Cook - Dentist - Designer - Doctor - Engineer - Factory - Fire fighter - Job - Journalist - Manager - Mechanic - Meeting - Nurse - Office - Photographer - Pilot - Police officer - Singer - Teacher - Tennis player - Theatre - Uniform - Waiter\nVERB: Begin - Cook - Happen - Look after\nADV: \nPREPOSITION: ", grammar: "Pattern and freestyle communication", vocabularyMax: 13, writingRef: "" },
  { unitNumber: 7, topic: "At the Castle", content: "Vocabulary and communication check", vocabulary: "ADJ: Interested - Unusual - Wild - Wonderful\nNOUN: Bridge - Building - Butterfly - Century - Conversation - Costume - Creature - Crown - Date - Design - East - Entrance - Exit - Festival - Finger - Flag - Gate - Glass - Gold - Insect - Journey - King - North - Postcard - Playground - Queen - Ring - River - Silver - South - Steps - Swan - Swing - Tour - View - West\nVERB: Appear - Follow - Leave - Make sure - Might - Send - Swing - Touch\nADV: \nPREPOSITION: ", grammar: "Pattern and freestyle communication", vocabularyMax: 20, writingRef: "" },
  { unitNumber: 8, topic: "Sports Days", content: "Vocabulary and communication check", vocabulary: "ADJ: Sore\nNOUN: Competition - End - Goal - Golf - Knee - Match - Prize - Race - Stadium - Snack - Team - Tennis - Volleyball - Winner\nVERB: Explain - Fall over\nADV: Already - Just - Yet\nPREPOSITION: ", grammar: "Pattern and freestyle communication", vocabularyMax: 12, writingRef: "" },
  { unitNumber: 9, topic: "Our Camping Adventure", content: "Vocabulary and communication check", vocabulary: "ADJ: Amazing - Dangerous - Delicious - Excited - Frightened - Hard - Ill - Lovely - Soft\nNOUN: Biscuit - Bracelet - Butter - Chopsticks - Flour - Fork - Group - Honey - Jam - Knife - Medicine - Olives - Pepper - Piece - Pizza - Salt - Spoon - Strawberry - Sugar - Surprise - Tortoise - Wool - Yoghurt - Bats - Bridge - Biscuits - Cave - Fire - Hill - Magazine - Moon - Nest - Newspaper - Pocket - Rock - River - Rucksack - Stars - Swan - Tent - Torch - Umbrella - Wing\nVERB: Feel - Finish - Hear - Look like - Mind - Smell - Sound - Spend - Tastes - Visit\nADV: \nPREPOSITION: ", grammar: "Pattern and freestyle communication", vocabularyMax: 20, writingRef: "" },
  { unitNumber: 10, topic: "A Good Year", content: "Vocabulary and communication check", vocabulary: "ADJ: Alone - Dark - Deep - Furry - Heavy - Horrible - Large - Missing - Soft - Strange\nNOUN: Beach - Biscuits - Boat trip - Camp - Cave - Clothes - Earth - Elbow - Fire - Fur - Hill - Kilometre - Magazine - Nest - Newspaper - Path - Pocket - Rock - Stars - Stone - Sledge - Snowball - Tent - Torch - Tyre - Umbrella - Vegetables - Wing - Wood\nVERB: Burn - Decide - Explore - Whisper - Whistle - Play - Go - Ride - Buy - Walk - Collect - Fly - Lie - Eat - Grow - Ski - Snowboard - Make - Throw - Climb\nADV: Together - Up - In - On - Down\nPREPOSITION: ", grammar: "Pattern and freestyle communication", vocabularyMax: 27, writingRef: "" },
  { unitNumber: 11, topic: "Our Summer Holidays", content: "Vocabulary and communication check", vocabulary: "ADJ: Foggy - Heavy - Striped - Sunny\nNOUN: Belt - Camel - Competition - Desert - Environment - Gloves - London - Magazine - Octopus - Pop music - Pyjamas - Pyramid - Rock music - Soap - Storm - Suitcase - Spotted shorts - Sunglasses - Toe - Trainers - Umbrella\nVERB: Lift - Meet - Raining - Should - Snowing\nADV: Ever\nPREPOSITION: ", grammar: "Pattern and freestyle communication", vocabularyMax: 11, writingRef: "" },
  { unitNumber: 12, topic: "Past and Future", content: "Vocabulary and communication check", vocabulary: "ADJ: Enough - Ready - Worried\nNOUN: Air - City - Calendar - Camel - Desert - Dinosaur - Eagle - Environment - Forest - Future - Land - Mountain - Nest - Ocean - Octopus - Past - Planet - Pond - Pyramid - Racing bike - Rocket - Shell - Skyscraper - Space - Spaceship - Stadium - Steam - Stone - Stream - Tree\nVERB: Guess - Hope - Ski\nADV: Suddenly\nPREPOSITION: ", grammar: "Pattern and freestyle communication", vocabularyMax: 23, writingRef: "" },
]);

export const curriculumDefaults: CurriculumUnit[] = [
  ...babyStars,
  ...superKids1,
  ...superKids2,
  ...superKids3,
  ...superKids4,
  ...superKids5,
  ...superKids6,
  ...superKids7,
  ...superKids8,
  ...starters,
  ...movers,
  ...flyers,
];

export function programByLabel(label: string) {
  return programs.find((program) => program.label.toLowerCase() === label.trim().toLowerCase());
}

export function curriculumKey(programCode: string, unitNumber: number) {
  return `${programCode}:${unitNumber}`;
}
