export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the author's primary concern about \"technological sovereignty\"?",
    options: [
      "The EU lacks the technical capacity to build its own infrastructure",
      "The concept can serve liberation or oppression depending on its implementation",
      "American companies are fundamentally opposed to EU regulation",
      "Data localization inevitably leads to government surveillance",
    ],
    correctIndex: 1,
  },
  {
    id: 2,
    question: "The fiber optic infrastructure example is used to argue that:",
    options: [
      "The private sector always fails to deliver adequate broadband",
      "Government involvement in infrastructure is inherently corrupt",
      "Physical infrastructure requires government involvement regardless of political ideology",
      "Fiber optic cable is superior to copper in every conceivable context",
    ],
    correctIndex: 2,
  },
  {
    id: 3,
    question: "According to the article, what is the \"worst model\" for fiber deployment?",
    options: [
      "A government-operated monopoly ISP",
      "Government clearing rights-of-way for a single private monopolist",
      "Essential facilities sharing among multiple providers",
      "A municipal government operating its own ISP",
    ],
    correctIndex: 1,
  },
  {
    id: 4,
    question: "The Utah UTOPIA network is cited as evidence that:",
    options: [
      "Conservatives are fundamentally opposed to public internet infrastructure",
      "Rural areas are chronically underserved by private ISPs",
      "Even politically conservative regions can succeed with public broadband infrastructure",
      "Small cities are inherently better suited to municipal broadband than large ones",
    ],
    correctIndex: 2,
  },
  {
    id: 5,
    question: "What does \"essential facilities sharing\" mean in the context of this article?",
    options: [
      "The government owns and operates all ISPs as a public utility",
      "Requiring large telecoms to rent their infrastructure to competing providers at regulated rates",
      "Limiting public fiber networks to educational institutions only",
      "Establishing international treaties for shared data infrastructure",
    ],
    correctIndex: 1,
  },
  {
    id: 6,
    question: "The references to Sarah Palin and Rob Ford serve to illustrate that:",
    options: [
      "Conservative politicians are inherently unfit to manage public services",
      "Government-operated monopoly ISPs are vulnerable to political capture by erratic officials",
      "Municipal broadband is more common in politically extreme regions",
      "Technical infrastructure management is beyond the scope of local government competence",
    ],
    correctIndex: 1,
  },
  {
    id: 7,
    question: "What problem does the author identify with EU lowest-bid procurement rules?",
    options: [
      "They prevent small companies from competing for government contracts",
      "They allow anticompetitive vendors to keep winning by underbidding then extracting revenue through lock-in",
      "They prioritize cost savings over technical quality in all cases",
      "They are incompatible with GDPR data protection requirements",
    ],
    correctIndex: 1,
  },
  {
    id: 8,
    question: "The Newag train manufacturer example demonstrates that:",
    options: [
      "Polish train infrastructure is poorly maintained compared to Western Europe",
      "Procurement rules designed for fair competition can reward vendors who sabotage their own products",
      "Polish regulators are less effective than their EU counterparts",
      "Hardware infrastructure is inherently harder to regulate than software",
    ],
    correctIndex: 1,
  },
  {
    id: 9,
    question: "The author's preferred model for a \"truly public internet\" involves:",
    options: [
      "A single government-operated ISP with no private providers allowed",
      "Full privatization of infrastructure with light regulatory oversight",
      "Public infrastructure with essential facilities sharing enabling multiple competing providers",
      "EU-wide standardization of a single ISP model across all member states",
    ],
    correctIndex: 2,
  },
  {
    id: 10,
    question: "What is the article's central argument about government involvement in internet infrastructure?",
    options: [
      "The EU should build all of its own technology from scratch to achieve sovereignty",
      "Technological sovereignty is meaningless without comprehensive political reform",
      "The form of government involvement — not its presence or absence — determines whether the result is liberation or oppression",
      "Private ISPs should be nationalized across all EU member states",
    ],
    correctIndex: 2,
  },
];
