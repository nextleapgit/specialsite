export type Copy = { ar: string; en: string };
export const copy = (ar: string, en: string): Copy => ({ ar, en });
export const categories = [
  'Digital Transformation',
  'Software Architecture',
  '.NET',
  'Business & Operations',
] as const;
export type Article = {
  id: string;
  title: Copy;
  summary: Copy;
  category: string;
  minutes: number;
  art: string;
  date: string;
  body: Copy[];
  status: 'published' | 'draft';
};
export const articles: Article[] = [
  {
    id: 'systems-that-scale',
    title: copy('أنظمة تنمو مع العمل، لا مع التعقيد.', 'Build systems that scale. Not complexity.'),
    summary: copy(
      'كيف تختار حدودًا واضحة لنظامك، وتترك مساحة للنمو دون أن تدفع ثمنه مبكرًا.',
      'A practical approach to clear boundaries, thoughtful trade-offs, and software built to evolve.',
    ),
    category: 'Software Architecture',
    minutes: 8,
    art: 'architecture',
    date: '2026-09-24',
    status: 'published',
    body: [
      copy('ابدأ من حدود العمل', 'Start with business boundaries'),
      copy(
        'الحد الجيد يجمع القرارات التي تتغير معًا. في نظام الطلبات، يمكن لوحدة الطلب أن تملك قواعد التسعير المحلية، بينما تبقى المدفوعات خلف عقد واضح. لا يحتاج هذا القرار إلى خدمات منفصلة من اليوم الأول.',
        'A good boundary groups decisions that change together. An order module can own its local pricing rules while payments remain behind an explicit contract. This does not require separate services on day one.',
      ),
      copy('اختر البساطة القابلة للتغيير', 'Choose changeable simplicity'),
      copy(
        'ابدأ بتطبيق موحد مقسم إلى وحدات. امنع الكتابة المباشرة في بيانات وحدة أخرى، واختبر العقود بين الوحدات. افصل النشر فقط حين تظهر حاجة تشغيلية مقاسة: حمل مستقل، عزل أعطال، أو فريق يملك دورة إصدار منفصلة.',
        'Start with a modular monolith. Prevent direct writes to another module’s data and test the contracts between modules. Separate deployment only when an observed operational need justifies it: independent load, fault isolation, or separate release ownership.',
      ),
      copy('قِس قبل أن تقسّم', 'Measure before you split'),
      copy(
        'راقب زمن الاستجابة، وتكلفة التغيير، وعدد الحوادث العابرة للحدود. وثّق القرار وبدائله وموعد مراجعته. البنية ليست رسمًا نهائيًا؛ إنها مجموعة قرارات يمكن فحصها وتطويرها.',
        'Track latency, change cost, and incidents spanning boundaries. Record the decision, its alternatives, and a review date. Architecture is a set of decisions you can inspect and improve.',
      ),
    ],
  },
  {
    id: 'transformation-starts-with-people',
    title: copy(
      'التحول الرقمي يبدأ بسؤال أفضل.',
      'Digital transformation starts with a better question.',
    ),
    summary: copy(
      'قبل اختيار التقنية، حدّد المشكلة التي تستحق الحل.',
      'Before choosing a platform, understand the problem worth solving.',
    ),
    category: categories[0],
    minutes: 6,
    art: 'transformation',
    date: '2026-09-21',
    status: 'published',
    body: [
      copy('افهم رحلة العمل', 'Understand the workflow'),
      copy(
        'ارسم رحلة طلب واحد، من البداية إلى التسليم. سجّل الانتظار وإعادة الإدخال والقرارات اليدوية. ابدأ باختناق واحد بدل استبدال كل الأدوات دفعة واحدة.',
        'Map one request from intake to delivery. Record waiting time, repeated entry, and manual decisions. Start with one bottleneck rather than replacing every tool at once.',
      ),
      copy('عرّف النجاح قبل الحل', 'Define success before the solution'),
      copy(
        'اختر مقياسًا مفهومًا: وقت إنجاز الطلب أو نسبة الأخطاء. قارن فترة أساس بتجربة صغيرة، وناقش النتائج مع الفريق الذي ينفذ العمل.',
        'Choose a meaningful measure: turnaround time or error rate. Compare a baseline against a small pilot and review results with the people doing the work.',
      ),
    ],
  },
  {
    id: 'csharp-small-habits',
    title: copy('كود C# أوضح، قرار صغير في كل مرة.', 'Better C#, one small decision at a time.'),
    summary: copy(
      'أسماء واضحة، دوال صغيرة، وعقود يمكن الاعتماد عليها.',
      'Clear names, small functions, and contracts you can trust.',
    ),
    category: categories[2],
    minutes: 5,
    art: 'code',
    date: '2026-09-18',
    status: 'published',
    body: [
      copy('اجعل النية واضحة', 'Make intent visible'),
      copy(
        'اكتب اسمًا يشرح النتيجة، وتحقق من المدخلات عند حدود النظام. اختر decimal للمبالغ المالية، ولا تجعل الاستثناءات مسار التحكم العادي.',
        'Name a function after its result and validate input at system boundaries. Use decimal for monetary values and avoid exceptions as ordinary control flow.',
      ),
      copy('اختبر السلوك', 'Test behavior'),
      copy(
        'اختبر النتيجة التي يحتاجها المستخدم: ماذا يحدث عند المدخل الفارغ، والقيمة الحدية، والتكرار؟ اسم الاختبار يجب أن يشرح قاعدة العمل.',
        'Test what the user needs: empty input, boundary values, and retries. A test name should explain the business rule.',
      ),
    ],
  },
  {
    id: 'operational-clarity',
    title: copy('وضوح العمليات ميزة تنافسية.', 'Operational clarity is a competitive advantage.'),
    summary: copy(
      'حوّل القرارات المتكررة إلى عمليات بسيطة قابلة للقياس.',
      'Turn recurring decisions into simple, measurable operations.',
    ),
    category: categories[3],
    minutes: 7,
    art: 'operations',
    date: '2026-09-14',
    status: 'published',
    body: [
      copy('ابدأ بمالك واضح', 'Start with clear ownership'),
      copy(
        'عيّن مالكًا لكل قرار متكرر. اكتب معايير النجاح ومسار التصعيد، واجعل بيانات القرار متاحة لمن ينفذه.',
        'Assign an owner to each recurring decision. Write success criteria and escalation paths, and make the relevant data available to the person doing the work.',
      ),
      copy('حلقة تحسين قصيرة', 'A short improvement loop'),
      copy(
        'راجع عينة أسبوعية من الحالات، وابحث عن سبب التأخير الأكثر تكرارًا. عدّل خطوة واحدة ثم قِس أثرها قبل التوسع.',
        'Review a weekly sample and identify the most frequent cause of delay. Change one step and measure its effect before expanding.',
      ),
    ],
  },
];
export type Lesson = {
  id: string;
  section: number;
  title: Copy;
  minutes: number;
  explanation: Copy;
  task: Copy;
  starter: string;
  solution: string;
  expected: string;
  tokens: string[];
};
export const sections = [
  copy('الأساسيات والبداية', 'Getting started'),
  copy('البيانات واتخاذ القرار', 'Data & decisions'),
  copy('تنظيم الكود', 'Organizing your code'),
  copy('من الكود إلى التطبيق', 'From code to application'),
];
export const lessons: Lesson[] = [
  {
    id: 'hello',
    section: 0,
    title: copy('برنامجك الأول في C#', 'Your first C# program'),
    minutes: 12,
    explanation: copy(
      'تكتب Console.WriteLine قيمة إلى المخرجات، ثم تنتقل إلى سطر جديد. يوضع النص بين علامتي تنصيص، وتنتهي التعليمة بفاصلة منقوطة. يمكن لبرنامج C# استخدام تعليمات المستوى الأعلى دون كتابة Main صراحة.',
      'Console.WriteLine writes a value followed by a new line. Strings use double quotes and statements end with a semicolon. A C# program can use top-level statements without an explicit Main method.',
    ),
    task: copy(
      'اطبع Hello, World! في سطر واحد. حافظ على الأحرف وعلامات الترقيم.',
      'Print Hello, World! on one line, preserving capitalization and punctuation.',
    ),
    starter: '// Your first line of C#\n// Write your solution below\n',
    solution: 'Console.WriteLine("Hello, World!");',
    expected: 'Hello, World!',
    tokens: ['Console', 'WriteLine', '"Hello, World!"', ';'],
  },
  {
    id: 'variables',
    section: 0,
    title: copy('المتغيرات والأنواع', 'Variables & types'),
    minutes: 18,
    explanation: copy(
      'المتغير اسم لقيمة ذات نوع محدد. استخدم int للأعداد الصحيحة وstring للنصوص. يساعد النوع المترجم على اكتشاف الأخطاء قبل التنفيذ.',
      'A variable names a value with a specific type. Use int for whole numbers and string for text. Types help the compiler catch mistakes before execution.',
    ),
    task: copy(
      'أنشئ متغيرًا صحيحًا باسم age بقيمة 25، ثم اطبع قيمته.',
      'Declare an integer named age with the value 25, then print it.',
    ),
    starter: '// Declare age and print it\n',
    solution: 'int age = 25;\nConsole.WriteLine(age);',
    expected: '25',
    tokens: ['int age', '25', 'Console.WriteLine(age)', ';'],
  },
  {
    id: 'strings',
    section: 0,
    title: copy('النصوص والتنسيق', 'Strings & interpolation'),
    minutes: 16,
    explanation: copy(
      'تسمح السلسلة المسبوقة بعلامة الدولار بإدراج قيم المتغيرات بين أقواس معقوفة داخل النص.',
      'A dollar-prefixed string can embed variable values inside braces.',
    ),
    task: copy(
      'عرّف name بقيمة Naser واطبع Hello, Naser باستخدام الاستيفاء النصي.',
      'Declare name as Naser and print Hello, Naser using string interpolation.',
    ),
    starter: '// Use string interpolation\n',
    solution: 'string name = "Naser";\nConsole.WriteLine($"Hello, {name}");',
    expected: 'Hello, Naser',
    tokens: ['string name', '"Naser"', '$"Hello, {name}"', 'Console.WriteLine'],
  },
  {
    id: 'conditions',
    section: 1,
    title: copy('الشروط والقرارات', 'Conditions & decisions'),
    minutes: 20,
    explanation: copy(
      'تنفذ if كتلة من التعليمات عندما يكون الشرط صحيحًا. استخدم معاملات المقارنة لصياغة الشرط بوضوح.',
      'An if statement executes a block when its condition is true. Comparison operators make the condition explicit.',
    ),
    task: copy(
      'عرّف score بقيمة 90 واطبع Passed عندما تكون الدرجة 80 أو أكثر.',
      'Set score to 90 and print Passed if the score is at least 80.',
    ),
    starter: 'int score = 90;\n// Check the score\n',
    solution: 'int score = 90;\nif (score >= 80) { Console.WriteLine("Passed"); }',
    expected: 'Passed',
    tokens: ['score = 90', 'score >= 80', 'if', '"Passed"'],
  },
  {
    id: 'loops',
    section: 1,
    title: copy('التكرار باستخدام الحلقات', 'Working with loops'),
    minutes: 22,
    explanation: copy(
      'تجمع حلقة for التهيئة والشرط وخطوة التحديث. تأكد أن خطوة التحديث تقرب المتغير من نهاية الحلقة.',
      'A for loop groups initialization, a condition, and an update. Make sure the update moves the variable toward termination.',
    ),
    task: copy(
      'اطبع الأعداد من 1 إلى 3، كل عدد في سطر، باستخدام for.',
      'Print the numbers 1 through 3, each on its own line, using for.',
    ),
    starter: '// Print 1, 2, 3 with a loop\n',
    solution: 'for (int i = 1; i <= 3; i++) { Console.WriteLine(i); }',
    expected: '1\n2\n3',
    tokens: ['for', 'i = 1', 'i <= 3', 'Console.WriteLine(i)'],
  },
  {
    id: 'arrays',
    section: 1,
    title: copy('المصفوفات والمجموعات', 'Arrays & collections'),
    minutes: 20,
    explanation: copy(
      'المصفوفة مجموعة مرتبة من قيم من النوع نفسه. يبدأ الفهرس من صفر، وتعبّر Length عن عدد العناصر.',
      'An array is an ordered collection of values of the same type. Indexing begins at zero; Length gives the number of elements.',
    ),
    task: copy(
      'عرّف مصفوفة values بالأعداد 2 و4 و6، واطبع عدد عناصرها.',
      'Declare an array named values containing 2, 4, and 6. Print its length.',
    ),
    starter: '// Create an array\n',
    solution: 'int[] values = { 2, 4, 6 };\nConsole.WriteLine(values.Length);',
    expected: '3',
    tokens: ['int[] values', '2, 4, 6', 'values.Length', 'Console.WriteLine'],
  },
  {
    id: 'methods',
    section: 2,
    title: copy('الدوال وإعادة الاستخدام', 'Methods & reuse'),
    minutes: 24,
    explanation: copy(
      'تحدد الدالة اسم العملية ومدخلاتها ونوع النتيجة. اجعل كل دالة تؤدي مهمة واحدة واضحة.',
      'A method defines an operation, its inputs, and a return type. Give each method one clear responsibility.',
    ),
    task: copy(
      'اكتب دالة Add لجمع عددين صحيحين، واطبع نتيجة Add(2, 3).',
      'Write an Add method for two integers and print Add(2, 3).',
    ),
    starter: '// Define Add, then call it\n',
    solution: 'int Add(int a, int b) => a + b;\nConsole.WriteLine(Add(2, 3));',
    expected: '5',
    tokens: ['int Add(int a, int b)', 'a + b', 'Add(2, 3)', 'Console.WriteLine'],
  },
  {
    id: 'classes',
    section: 2,
    title: copy('الكائنات والفئات', 'Objects & classes'),
    minutes: 28,
    explanation: copy(
      'تجمع الفئة الحالة والسلوك المتعلقين بمفهوم واحد. استخدم الخصائص للتعبير عن البيانات التي يتيحها الكائن.',
      'A class groups state and behavior around one concept. Properties describe the data exposed by an object.',
    ),
    task: copy(
      'أنشئ Person بخاصية Name، ثم اطبع اسم Naser من كائن جديد.',
      'Create Person with a Name property, then print Naser from a new instance.',
    ),
    starter: '// Statements before the class declaration\n',
    solution:
      'var person = new Person { Name = "Naser" };\nConsole.WriteLine(person.Name);\nclass Person { public string Name { get; set; } = ""; }',
    expected: 'Naser',
    tokens: ['class Person', 'public string Name', 'new Person', 'Console.WriteLine(person.Name)'],
  },
  {
    id: 'errors',
    section: 2,
    title: copy('معالجة الأخطاء', 'Handling errors'),
    minutes: 20,
    explanation: copy(
      'استخدم TryParse عند توقع إدخال غير صالح، لتفصل نجاح التحويل عن القيمة الناتجة دون الاعتماد على الاستثناءات.',
      'Use TryParse for potentially invalid input. It separates conversion success from the resulting value without relying on exceptions.',
    ),
    task: copy(
      'حوّل النص 42 باستخدام TryParse واطبع النتيجة عند النجاح.',
      'Parse the string 42 with TryParse and print the result on success.',
    ),
    starter: '// Parse safely\n',
    solution: 'if (int.TryParse("42", out int value)) { Console.WriteLine(value); }',
    expected: '42',
    tokens: ['int.TryParse', '"42"', 'out int value', 'Console.WriteLine(value)'],
  },
  {
    id: 'linq',
    section: 3,
    title: copy('الاستعلام باستخدام LINQ', 'Querying with LINQ'),
    minutes: 26,
    explanation: copy(
      'تصف LINQ تحويلات على المجموعات. Where ترشح العناصر وفق شرط، وCount تحسب العناصر الناتجة.',
      'LINQ describes transformations over collections. Where filters by a predicate, and Count counts the resulting elements.',
    ),
    task: copy(
      'رشّح الأعداد الأكبر من 2 في المصفوفة 1، 2، 3، 4 واطبع عددها.',
      'Filter numbers greater than 2 from 1, 2, 3, 4 and print the count.',
    ),
    starter: 'using System.Linq;\n// Filter and count\n',
    solution:
      'using System.Linq;\nint[] numbers = { 1, 2, 3, 4 };\nConsole.WriteLine(numbers.Where(n => n > 2).Count());',
    expected: '2',
    tokens: ['using System.Linq', '1, 2, 3, 4', 'n > 2', '.Count()'],
  },
  {
    id: 'async',
    section: 3,
    title: copy('البرمجة غير المتزامنة', 'Asynchronous programming'),
    minutes: 25,
    explanation: copy(
      'تسمح await بانتظار مهمة دون حجب الخيط أثناء الانتظار. تجنّب استخدام Result لحجب التنفيذ في تدفق غير متزامن.',
      'await waits for a task without blocking the thread while waiting. Avoid using Result to block an asynchronous flow.',
    ),
    task: copy(
      'انتظر Task.Delay لمدة 10 مللي ثانية ثم اطبع Done.',
      'Await Task.Delay for 10 milliseconds, then print Done.',
    ),
    starter: '// Await a task\n',
    solution: 'await Task.Delay(10);\nConsole.WriteLine("Done");',
    expected: 'Done',
    tokens: ['await', 'Task.Delay(10)', 'Console.WriteLine', '"Done"'],
  },
  {
    id: 'project',
    section: 3,
    title: copy('تحدّي المسار: حاسبة الإجمالي', 'Course challenge: total calculator'),
    minutes: 35,
    explanation: copy(
      'اجمع ما تعلمته في دالة صغيرة قابلة للاختبار. استخدم decimal للحساب المالي، واجعل نتيجة الحساب منفصلة عن العرض.',
      'Combine what you learned in a small testable function. Use decimal for monetary arithmetic and separate calculation from display.',
    ),
    task: copy(
      'اجمع السعرين 10 و20 من نوع decimal واطبع الإجمالي 30.',
      'Add decimal prices 10 and 20 and print the total 30.',
    ),
    starter: '// Calculate the total\n',
    solution: 'decimal Total(decimal a, decimal b) => a + b;\nConsole.WriteLine(Total(10m, 20m));',
    expected: '30',
    tokens: ['decimal Total', 'a + b', '10m, 20m', 'Console.WriteLine'],
  },
];
export const projects = [
  {
    id: 'operations',
    name: copy('نظام تشغيل الأعمال', 'The operations workspace'),
    category: 'Business systems',
    description: copy(
      'من طلب العميل إلى متابعة التنفيذ: تجربة موحدة للعمليات اليومية.',
      'From customer request to delivery: one considered workspace for everyday operations.',
    ),
    art: 'operations',
    tags: ['Operations', 'Workflow', 'Dashboard'],
  },
  {
    id: 'architecture',
    name: copy('مخطط منصة قابلة للنمو', 'A blueprint for growth'),
    category: 'Software architecture',
    description: copy(
      'وحدات مستقلة وعقود واضحة، مع توثيق للقرارات المعمارية.',
      'Independent modules, clear contracts, and documented architectural decisions.',
    ),
    art: 'architecture',
    tags: ['.NET', 'PostgreSQL', 'Modularity'],
  },
];
