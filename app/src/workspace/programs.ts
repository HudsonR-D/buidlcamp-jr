export interface Program {
  id: string;
  issuer: string;
  title: string;
  type: "Certificate" | "Digital credential" | "Completion badge" | "Project";
  price: string;
  minAge: number;
  ageNote: string;
  description: string;
  url: string;
  source: string;
  checked: string;
  steps: string[];
}
export const PROGRAMS: Program[] = [
  {
    id: "code-org",
    issuer: "CodeAI / Code.org",
    title: "Computer Science Fundamentals: Express Course",
    type: "Certificate",
    price: "Free",
    minAge: 10,
    ageNote:
      "The Express Course is designed for grades 3–8. Set up account and classroom choices with a parent or educator.",
    description:
      "Practice programming with a self-paced course. The platform provides a printable course certificate; this is a completion record, not a professional certification or proof of independently assessed mastery.",
    url: "https://code.org/en-US/curriculum/computer-science-fundamentals",
    source:
      "https://support.code.org/hc/en-us/articles/204090698-Where-can-I-print-certificates-for-my-students",
    checked: "2026-09-16",
    steps: [
      "Choose the Express Course with a parent or educator",
      "Complete the assigned lessons and projects",
      "Discuss the work with your educator",
      "Print the course certificate through the provider",
    ],
  },
  {
    id: "ibm-skillsbuild",
    issuer: "IBM SkillsBuild",
    title: "AI Foundations",
    type: "Digital credential",
    price: "Free",
    minAge: 13,
    ageNote:
      "The high-school program is for ages 13–18. Regional consent requirements apply.",
    description:
      "Explore AI concepts, complete an AI Design Challenge, and pass the final assessment at 80% or higher. IBM issues the digital credential; BuidlCamp records your progress.",
    url: "https://www.credly.com/org/ibm-skillsbuild-students/badge/ai-foundations",
    source:
      "https://www.credly.com/org/ibm-skillsbuild-students/badge/ai-foundations",
    checked: "2026-09-16",
    steps: [
      "Check IBM eligibility and consent requirements",
      "Enroll in the credential pathway",
      "Complete AI Foundations, the AI Design Challenge, and the final assessment (80%+)",
      "Claim the credential through the issuer",
    ],
  },
  {
    id: "cs50x",
    issuer: "Harvard’s CS50",
    title: "CS50x: Introduction to Computer Science",
    type: "Certificate",
    price: "Free CS50 certificate; paid edX verification optional",
    minAge: 13,
    ageNote:
      "CS50 describes the material as best suited to 12+. Account providers have separate age rules; BuidlCamp recommends 13+ with adult guidance.",
    description:
      "A substantial introduction to computer science. Earn at least 70% on every required assignment and the final project for the free CS50 certificate. This is not a Harvard degree or automatic academic credit.",
    url: "https://cs50.harvard.edu/x/",
    source: "https://cs50.harvard.edu/x/certificate/",
    checked: "2026-09-16",
    steps: [
      "Check CS50 and account-provider requirements",
      "Complete all required problem sets and labs",
      "Submit the final project and meet the required scores",
      "Claim the CS50 certificate from CS50",
    ],
  },
  {
    id: "google-ai-essentials",
    issuer: "Google",
    title: "Google AI Essentials",
    type: "Certificate",
    price: "Paid course; price varies by platform and region",
    minAge: 13,
    ageNote:
      "Check the enrollment platform’s age and consent rules. Designed around work tasks; teens should review it with an educator.",
    description:
      "A self-paced introduction to using generative AI, prompting, and responsible use. Google awards a certificate after completion. Check the enrollment price before starting.",
    url: "https://grow.google/ai-essentials/",
    source: "https://grow.google/ai-essentials/",
    checked: "2026-09-16",
    steps: [
      "Review eligibility, platform terms, and total cost",
      "Enroll through Google’s course page",
      "Complete all five modules and required work",
      "Claim the Google AI Essentials certificate",
    ],
  },
  {
    id: "anthropic-academy",
    issuer: "Anthropic / Claude Academy",
    title: "AI Fluency: Framework & Foundations",
    type: "Completion badge",
    price: "Free",
    minAge: 18,
    ageNote:
      "Listed here for adults and educators. Claude accounts require 18+; public learning materials and Academy enrollment have their own rules.",
    description:
      "Explore the four dimensions of AI fluency and complete the final assessment. The current course page offers a completion badge, not a professional certification.",
    url: "https://academy.claude.com/courses/ai-fluency-framework-foundations",
    source:
      "https://academy.claude.com/courses/ai-fluency-framework-foundations",
    checked: "2026-09-16",
    steps: [
      "Review Academy enrollment and tool requirements",
      "Complete the course lessons",
      "Take the final assessment",
      "Claim the completion badge",
    ],
  },
  {
    id: "scratch",
    issuer: "Scratch Foundation",
    title: "Create a Scratch project",
    type: "Project",
    price: "Free",
    minAge: 10,
    ageNote:
      "A creative coding option for younger learners. Review account and sharing choices with a parent or teacher.",
    description:
      "Make a game, story, or animation with blocks. This pathway builds a project portfolio; it does not promise an MIT certificate.",
    url: "https://scratch.mit.edu/ideas",
    source: "https://www.scratchfoundation.org/home",
    checked: "2026-09-16",
    steps: [
      "Choose a tutorial with a parent or educator",
      "Build and test a project",
      "Explain the scripts you used",
      "Save the project and record what you learned",
    ],
  },
];
