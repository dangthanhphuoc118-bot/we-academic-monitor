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
  vocabularyMax: number;
  writingRef: string;
  dayStart: number;
  dayEnd: number;
  isOverride?: boolean;
};

export type LearningCheck = {
  id: number;
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

type SourceUnit = Omit<CurriculumUnit, "programCode" | "programLabel" | "series" | "group" | "unitLabel" | "dayStart" | "dayEnd"> & {
  unitLabel?: string;
  dayStart?: number;
  dayEnd?: number;
};

function units(programCode: string, source: SourceUnit[]): CurriculumUnit[] {
  const program = programs.find((item) => item.code === programCode)!;
  return source.map((item) => ({
    ...item,
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
  { unitNumber: 2, topic: "At Home", content: "Vocabulary, writing and communication check", vocabulary: "Armchair - bath - bathroom - bed - bedroom - clock - computer - cupboard - dining room - floor - garden - hall - home - kitchen - living room - mat - phone - radio - right - room - television - rug - window - sofa - lamp - door - table - bookcase - wall - mirror - picture - behind - between - under - in front of", grammar: "Where is the ...? Where are the ...? What is ... doing?", vocabularyMax: 35, writingRef: "Writing p.10" },
  { unitNumber: 3, topic: "Family and Friends", content: "Vocabulary and communication check", vocabulary: "Baby - boy - big - brother - dad - family - father - friends - funny - girl - grandfather - grandmother - happy - his - mother - old - sad - scary - pet - sister - small - young - cousin - grandma - grandpa - grandparents", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 26, writingRef: "" },
  { unitNumber: 4, topic: "Food", content: "Vocabulary, writing and communication check", vocabulary: "Banana - beans - bread - breakfast - burger - carrot - chips - coconut - dinner - eat - egg - favourite - food - fruit - grape - kiwi - lemon - lime - lunch - mango - meal - meat - meatball - onion - pear - peas - pie - pineapple - potato - rice - tomato - watermelon - orange - sausage", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 34, writingRef: "Writing p.16" },
  { unitNumber: 5, topic: "I Like Clothes", content: "Vocabulary and communication check", vocabulary: "Bag - baseball cap - boots - clothes - dress - glasses - handbag - hat - jacket - jeans - shirt - shoes - shorts - skirt - socks - trousers - T-shirt - watch - wear", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 19, writingRef: "" },
  { unitNumber: 6, topic: "Look at Us", content: "Vocabulary, writing and communication check", vocabulary: "Arm - body - ear - eye - face - foot - feet - hair - hand - head - leg - mouth - nose - short - ugly - tail - alien - monster - doll - play - toy - kite - robot - spider - teddy bear", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 25, writingRef: "Writing p.26" },
  { unitNumber: 7, topic: "We Love School", content: "Vocabulary and communication check", vocabulary: "Board - book - boy - children - classmates - classroom - crayon - draw - English - girl - good - kids - keyboard - painting - paper - pen - pencil - poster - rubber - ruler - school - show - sit - sleep - some - stand - talk - teacher - word - write - computer - mouse - letter - page", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 34, writingRef: "" },
  { unitNumber: 8, topic: "In the Playground", content: "Vocabulary, writing and communication check", vocabulary: "Badminton - ball - baseball - basketball - bike - bounce - catch - football - here - hit - hockey - kick - playground - ride - run - sport - table tennis - tennis - throw - too - wall - walk", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 22, writingRef: "Writing p.38" },
  { unitNumber: 9, topic: "My Hobbies", content: "Vocabulary and communication check", vocabulary: "Board game - cake - double - draw - enjoy - guitar - hobby - jump - love - listen - music - paint - park - piano - picture - read - sea - sing - song - spell - sport - story - swim - kite", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 24, writingRef: "" },
  { unitNumber: 10, topic: "Your Day", content: "Vocabulary, writing and communication check", vocabulary: "About - afternoon - again - bed - day - English - get - go to bed - go to sleep - goodbye - have - lesson - morning - paint - painting", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 15, writingRef: "Writing p.55" },
  { unitNumber: 11, topic: "In the Street", content: "Vocabulary and communication check", vocabulary: "Angry - bus - car - child - class - clean - closed - dirty - fly - go - helicopter - her - motorbike - new - nice - open - people - sad - ship - shop - street - train - women - lorry - plane - wave", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 23, writingRef: "" },
  { unitNumber: 12, topic: "Happy Birthday", content: "Vocabulary, writing and communication check", vocabulary: "Balloon - bat - camera - chocolates - lemonade - milk - mine - party - present - see you - skateboard - tablet - tennis racket - whose", grammar: "Pattern questions and freestyle follow-up", vocabularyMax: 14, writingRef: "Writing p.84" },
]);

const movers = units("MOVERS", [
  { unitNumber: 1, topic: "At the Park", content: "Vocabulary and communication check", vocabulary: "All right - asleep - careful - orange - pink - yellow - black - green - purple - brown - blue - red - grey - young - big - short - long - bigger - younger - taller - older - smaller - shorter; coat - roller skating - tennis - drawing - basketball; carry - climb - fall - fish - help - hop - skip - walk - laugh - roller skate - dance - cry - hide; a pair of - be good at", grammar: "Pattern and freestyle communication", vocabularyMax: 20, writingRef: "" },
  { unitNumber: 2, topic: "A Busy Week", content: "Vocabulary, writing and communication check", vocabulary: "CD - DVD - e-book - film - homework - idea - Internet - music - thing - website - week - weekend - shopping - Monday - Tuesday - Wednesday - Thursday - Friday - Saturday - Sunday; cook - drive - email - go shopping - practice - ride - sail - swim - text - walk - wash - call; every - sometimes - never - often - always", grammar: "Pattern and freestyle communication", vocabularyMax: 17, writingRef: "Writing p.1&2" },
  { unitNumber: 3, topic: "In the Town", content: "Vocabulary and communication check", vocabulary: "Afraid - busy - cold - hot - huge - last - surprised - tired - wet; app - band - bus station - café - car park - circus - funfair - library - market - pop star - present - roof - shopping centre - sports centre - square - station - supermarket - town centre - playground - hospital - train station; above - below - near - opposite", grammar: "Pattern and freestyle communication", vocabularyMax: 17, writingRef: "" },
  { unitNumber: 4, topic: "At Home", content: "Vocabulary, writing and communication check", vocabulary: "Bat - blanket - cage - comic - ground - helmet - laptop - map of the world - plant - shop - shower - square - thing - toothbrush - toothpaste - towel; dance - drop - get dressed - get up - look for - lose - shout - think - wake; around - downstairs - inside - outside - upstairs", grammar: "Pattern and freestyle communication", vocabularyMax: 12, writingRef: "Writing p.3&4" },
  { unitNumber: 5, topic: "Let's Go on Holiday", content: "Vocabulary and communication check", vocabulary: "Blonde - curly - fair - grown-up - loud; age - aunt - beard - build - circle - daughter - granddaughter - grandparent - grandson - milkshake - pool - seat - stairs - wave - ticket - cinema - lift - sea - balcony - beach - swimming pool - movie - elevator - chair - snake - pear - story - lunch - ice cream - book - cake", grammar: "Pattern and freestyle communication", vocabularyMax: 10, writingRef: "" },
  { unitNumber: 6, topic: "My Favourite", content: "Vocabulary, writing and communication check", vocabulary: "Brilliant - difficult - easy - exciting - famous - hungry - kind - little - terrible - worse - worst; bottle - bowl - cheese - coffee - cook - cup - glass - noodles - machine - mistake - nurse - pirate - place - score - treasure - video - village - camera - doctor - town - clown - island - city - farmer - jungle - train driver - robot", grammar: "Pattern and freestyle communication", vocabularyMax: 16, writingRef: "Writing p.5&6" },
  { unitNumber: 7, topic: "This Is My Family", content: "Vocabulary and communication check", vocabulary: "Bad - good - loud - quiet - slow - quick; mother - father - mum - dad - grandpa - grandma - grandmother - grandfather - brother - sister - parents - son - daughter - children - child - grown-ups - uncle - aunt - cousin", grammar: "Pattern and freestyle communication", vocabularyMax: 19, writingRef: "" },
  { unitNumber: 8, topic: "What's for Lunch?", content: "Vocabulary, writing and communication check", vocabulary: "Cheese - chicken - milk - pasta - coffee - salad - tea - water - soup - sandwiches - vegetables - noodles - floor - plants - fish - alphabet - bag", grammar: "Pattern and freestyle communication", vocabularyMax: 12, writingRef: "Writing p.7&8" },
  { unitNumber: 9, topic: "Do You Like Animals?", content: "Vocabulary and communication check", vocabulary: "Kangaroo - kitten - parrot - puppy - rabbit - giraffe - hippo - shark - penguin - whale - dolphin - crocodile - bear - snail - tiger - panda - lion - bat - fly; up - down - round; into - out of - onto - off", grammar: "Pattern and freestyle communication", vocabularyMax: 19, writingRef: "" },
  { unitNumber: 10, topic: "The Weather", content: "Vocabulary, writing and communication check", vocabulary: "Cold - hot - windy - cloudy - sunny; wind - sun - snow - rain - moon - rainbow - stars - cloud - ice; drive - take off - ask - put on - make - catch - answer - cook", grammar: "Pattern and freestyle communication", vocabularyMax: 14, writingRef: "Writing p.9&10" },
  { unitNumber: 11, topic: "What's the Matter?", content: "Vocabulary and communication check", vocabulary: "Sad - fine - dry - quiet - naughty - fat - strong - short - loud - clever - thin - ugly - tall - weak - wet - pretty; shoulder - stomach - leg - foot - head - teeth - neck - back - hand - temperature - cough - cold - earache - headache - stomachache", grammar: "Pattern and freestyle communication", vocabularyMax: 15, writingRef: "" },
  { unitNumber: 12, topic: "In the Countryside", content: "Vocabulary, writing and communication check", vocabulary: "Grass - river - field - waterfall - mountain - farm - lake - forest - leaf - rock - road - sky", grammar: "Pattern and freestyle communication", vocabularyMax: 12, writingRef: "Writing p.11&12" },
]);

const flyers = units("FLYERS", [
  { unitNumber: 1, topic: "Our Home", content: "Vocabulary and communication check", vocabulary: "Bored - broken - clever - difficult - empty - friendly - full - fun - important - interesting - kind - unkind - late - little - lucky - much - noisy - popular - quiet - tidy - untidy; bin - bit - brush - channel - chess - college - cooker - cushion - cycle - diary - drums - envelope - file - fridge - key - letter - meal - mirror - necklace - news - oven - paper - post - postcard - programme - rucksack - shampoo - soap - stamps - violin - bracelet - anyone - anything - anywhere - everyone - everything - everywhere - no one - comb - telephone - shelf", grammar: "Pattern and freestyle communication", vocabularyMax: 19, writingRef: "" },
  { unitNumber: 2, topic: "Going to Town", content: "Vocabulary, writing and communication check", vocabulary: "Expensive - cheap - unhappy - lovely; airport - ambulance - bank - bicycle - bridge - castle - chemist's - corner - factory - fire engine - fire station - front - hill - hotel - middle - money - motorway - museum - police station - post office - pyjamas - railway station - restaurant - sky - skyscraper - stadium - taxi - traffic - university - wood", grammar: "Pattern and freestyle communication", vocabularyMax: 21, writingRef: "Writing p.1&2" },
  { unitNumber: 3, topic: "Eating Out", content: "Vocabulary and communication check", vocabulary: "Amazing - dangerous - delicious - excited - frightened - hard - noisy - similar - soft - slow; biscuit - bracelet - butter - chopsticks - chocolate - flour - fork - group - honey - jam - knife - lovely - medicine - olives - olive - pepper - piece - pizza - rock - salt - spoon - strawberry - sugar - surprise - tortoise - wool - yoghurt", grammar: "Pattern and freestyle communication", vocabularyMax: 20, writingRef: "" },
  { unitNumber: 4, topic: "At School", content: "Vocabulary, writing and communication check", vocabulary: "Difficult - enormous - excellent - favourite - frightened - lazy - same - sure - tired; art - beetle - card - club - dictionary - geography - half - history - information - invitation - languages - maths - metal - midday - midnight - music - platform - program - quarter - quiz - scarf - science - sport - subject - test - timetable", grammar: "Pattern and freestyle communication", vocabularyMax: 12, writingRef: "Writing p.3&4" },
  { unitNumber: 5, topic: "A Day Out", content: "Vocabulary and communication check", vocabulary: "Brave - cheap - empty - extinct - frightening - high - interesting - pleased - several - special - wild; actor - air - cage - cartoon - cereal - cinema - circus - clown - dinosaurs - gym - hole - hour - million - museum - ocean - project - pyramids - screen - seat - stamp - swing - stage - telephone - theatre - tune - wild animals - zoo", grammar: "Pattern and freestyle communication", vocabularyMax: 20, writingRef: "" },
  { unitNumber: 6, topic: "Dream Job", content: "Vocabulary, writing and communication check", vocabulary: "Early - fast - lazy - poor - rich; artist - astronaut - bandage - businessman/woman - clown - cook - dentist - designer - doctor - engineer - factory - firefighter - job - journalist - manager - mechanic - meeting - nurse - office - photographer - pilot - police officer - singer - teacher - tennis player - theatre - uniform - waiter", grammar: "Pattern and freestyle communication", vocabularyMax: 13, writingRef: "Writing p.5&6" },
  { unitNumber: 7, topic: "At the Castle", content: "Vocabulary and communication check", vocabulary: "Interested - unusual - wild - wonderful; bridge - building - butterfly - century - conversation - costume - creature - crown - date - design - east - entrance - exit - festival - finger - flag - gate - glass - gold - insect - journey - king - north - postcard - playground - queen - ring - river - silver - south - steps - swan - swing - tour - view - west", grammar: "Pattern and freestyle communication", vocabularyMax: 20, writingRef: "" },
  { unitNumber: 8, topic: "Sports Days", content: "Vocabulary, writing and communication check", vocabulary: "Sore; competition - end - goal - golf - knee - match - prize - race - stadium - snack - team - tennis - volleyball - winner; already - just - yet", grammar: "Pattern and freestyle communication", vocabularyMax: 12, writingRef: "Writing p.7&8" },
  { unitNumber: 9, topic: "Our Camping Adventure", content: "Vocabulary and communication check", vocabulary: "Amazing - dangerous - delicious - excited - frightened - hard - ill - lovely - soft; bats - bridge - biscuits - cave - fire - hill - magazine - moon - nest - newspaper - pocket - rock - river - rucksack - stars - swan - tent - torch - umbrella - wing", grammar: "Pattern and freestyle communication", vocabularyMax: 20, writingRef: "" },
  { unitNumber: 10, topic: "A Good Year", content: "Vocabulary, writing and communication check", vocabulary: "Alone - dark - deep - furry - heavy - horrible - large - missing - soft - strange; beach - biscuits - boat trip - camp - cave - clothes - earth - elbow - fire - fur - hill - kilometre - magazine - nest - newspaper - path - pocket - rock - stars - stone - sledge - snowball - tent - torch - tyre - umbrella - vegetables - wing - wood", grammar: "Pattern and freestyle communication", vocabularyMax: 27, writingRef: "Writing p.9&10" },
  { unitNumber: 11, topic: "Our Summer Holidays", content: "Vocabulary and communication check", vocabulary: "Foggy - heavy - striped - sunny; belt - camel - competition - desert - environment - gloves - London - magazine - octopus - pop music - pyjamas - pyramid - rock music - soap - storm - suitcase - spotted shorts - sunglasses - toe - trainers - umbrella", grammar: "Pattern and freestyle communication", vocabularyMax: 11, writingRef: "" },
  { unitNumber: 12, topic: "Past and Future", content: "Vocabulary, writing and communication check", vocabulary: "Enough - ready - worried; air - city - calendar - camel - desert - dinosaur - eagle - environment - forest - future - land - mountain - nest - ocean - octopus - past - planet - pond - pyramid - racing bike - rocket - shell - skyscraper - space - spaceship - stadium - steam - stone - stream - tree", grammar: "Pattern and freestyle communication", vocabularyMax: 23, writingRef: "Writing p.11&12" },
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
