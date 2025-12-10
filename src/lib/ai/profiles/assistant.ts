/**
 * Profile Assistant Prompt Builder
 *
 * Helper functions for building prompts for the profile assistant feature.
 * This assistant provides read-only, public-safe information about users on their public profiles.
 *
 * PRIVACY RULES:
 * - Only include data that is already visible on the public profile
 * - Never include private activity, private courses, email, or internal IDs
 * - Only reference public achievements, public projects, and public learning stats
 */

export type ProfileQuestionType =
  | "learning_overview"
  | "project_summary"
  | "next_steps"
  | "style_persona";

export interface PublicProfileData {
  displayName: string;
  handle: string;
  tagline?: string | null;
  bio?: string | null;
  projects: Array<{
    title: string;
    description?: string | null;
    techStack?: string | null;
  }>;
  experiences: Array<{
    role: string;
    organization: string;
    startDate?: string | null;
    endDate?: string | null;
    isCurrent?: boolean;
    description?: string | null;
  }>;
}

export interface PublicLearningData {
  totalPoints: number;
  level: number;
  currentStreak: number;
  lessonsCompleted: number;
  quizzesSubmitted: number;
  lastActiveDate?: Date | null;
  recentActivity?: Array<{
    eventType: string;
    lessonTitle?: string | null;
    quizTopic?: string | null;
  }>;
}

export interface PublicAchievementsData {
  achievements: Array<{
    name: string;
    description?: string | null;
    rarity?: string | null;
    unlockedAt?: Date | null;
  }>;
}

export interface AssistantPersona {
  name: string;
  tagline?: string | null;
  description?: string | null;
  persona?: "calm" | "kind" | "direct" | null;
}

export interface ProfileAssistantPrompt {
  systemPrompt: string;
  userPrompt: string;
}

/**
 * Build prompts for profile assistant
 *
 * @param profileData - Public profile data
 * @param learningData - Public learning statistics
 * @param achievementsData - Public achievements
 * @param assistantPersona - Assistant persona information
 * @param questionType - Type of question being asked
 * @returns System and user prompts for LLM
 */
export function buildProfileAssistantPrompt(
  profileData: PublicProfileData,
  learningData: PublicLearningData,
  achievementsData: PublicAchievementsData,
  assistantPersona: AssistantPersona | null,
  questionType: ProfileQuestionType
): ProfileAssistantPrompt {
  // Build assistant introduction
  const assistantIntro = assistantPersona
    ? `You are ${assistantPersona.name}, ${assistantPersona.tagline || "a helpful learning assistant"}. ${assistantPersona.description || ""}`
    : "You are a helpful learning assistant.";

  const personaTone = assistantPersona?.persona
    ? {
        calm: "Use a calm, measured tone. Be thoughtful and reflective.",
        kind: "Use a warm, encouraging tone. Be supportive and positive.",
        direct: "Use a straightforward, concise tone. Be clear and efficient.",
      }[assistantPersona.persona]
    : "Use a friendly, professional tone.";

  // Build user summary
  const userSummary = buildUserSummary(profileData);

  // Build learning summary
  const learningSummary = buildLearningSummary(learningData);

  // Build achievements summary
  const achievementsSummary = buildAchievementsSummary(achievementsData);

  // Build project summary
  const projectsSummary = buildProjectsSummary(profileData.projects);

  // Get question-specific instructions
  const questionInstructions = getQuestionInstructions(questionType);

  // System prompt
  const systemPrompt = `${assistantIntro}

${personaTone}

You are helping visitors learn about ${profileData.displayName} (${profileData.handle}) on their public profile.

IMPORTANT RULES:
- Only use the information provided below. Do not make assumptions or reference data not provided.
- Keep responses short (2-5 sentences maximum).
- Write in third person about the user (e.g., "${profileData.displayName} has been...").
- Do not provide personal contact details, email addresses, or private information.
- Do not speculate on sensitive topics or make guarantees about future outcomes.
- Focus on descriptive, factual information that is already visible on the profile.
- Be friendly, concise, and professional.

${questionInstructions.purpose}`;

  // User prompt with context
  const userPrompt = `${questionInstructions.question}

USER PROFILE:
${userSummary}

LEARNING ACTIVITY:
${learningSummary}

${achievementsData.achievements.length > 0 ? `ACHIEVEMENTS:\n${achievementsSummary}\n` : ""}${profileData.projects.length > 0 ? `PROJECTS:\n${projectsSummary}\n` : ""}Please provide a brief, helpful answer based on the information above.`;

  return {
    systemPrompt,
    userPrompt,
  };
}

function buildUserSummary(profile: PublicProfileData): string {
  let summary = `Name: ${profile.displayName} (@${profile.handle})\n`;
  if (profile.tagline) {
    summary += `Tagline: ${profile.tagline}\n`;
  }
  if (profile.bio) {
    summary += `Bio: ${profile.bio}\n`;
  }
  if (profile.experiences.length > 0) {
    summary += `\nExperience:\n`;
    profile.experiences.forEach((exp) => {
      summary += `- ${exp.role} at ${exp.organization}`;
      if (exp.startDate) {
        const start = new Date(exp.startDate).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
        summary += ` (${start}`;
        if (exp.isCurrent) {
          summary += " - Present)";
        } else if (exp.endDate) {
          const end = new Date(exp.endDate).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          });
          summary += ` - ${end})`;
        } else {
          summary += ")";
        }
      }
      summary += "\n";
    });
  }
  return summary;
}

function buildLearningSummary(learning: PublicLearningData): string {
  let summary = `Total XP: ${learning.totalPoints}\n`;
  summary += `Level: ${learning.level}\n`;
  summary += `Current Streak: ${learning.currentStreak} days\n`;
  summary += `Lessons Completed: ${learning.lessonsCompleted}\n`;
  summary += `Quizzes Submitted: ${learning.quizzesSubmitted}\n`;
  if (learning.lastActiveDate) {
    const lastActive = new Date(learning.lastActiveDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    summary += `Last Active: ${lastActive}\n`;
  }
  if (learning.recentActivity && learning.recentActivity.length > 0) {
    summary += `\nRecent Activity:\n`;
    learning.recentActivity.slice(0, 5).forEach((activity) => {
      if (activity.lessonTitle) {
        summary += `- Completed lesson: ${activity.lessonTitle}\n`;
      } else if (activity.quizTopic) {
        summary += `- Submitted quiz: ${activity.quizTopic}\n`;
      }
    });
  }
  return summary;
}

function buildAchievementsSummary(achievements: PublicAchievementsData): string {
  if (achievements.achievements.length === 0) {
    return "No achievements yet.";
  }
  return achievements.achievements
    .map((ach) => {
      let line = `- ${ach.name}`;
      if (ach.description) {
        line += `: ${ach.description}`;
      }
      if (ach.rarity) {
        line += ` (${ach.rarity})`;
      }
      return line;
    })
    .join("\n");
}

function buildProjectsSummary(projects: PublicProfileData["projects"]): string {
  if (projects.length === 0) {
    return "No projects listed.";
  }
  return projects
    .map((project) => {
      let line = `- ${project.title}`;
      if (project.description) {
        line += `: ${project.description}`;
      }
      if (project.techStack) {
        line += ` (Tech: ${project.techStack})`;
      }
      return line;
    })
    .join("\n");
}

function getQuestionInstructions(
  questionType: ProfileQuestionType
): { question: string; purpose: string } {
  const instructions = {
    learning_overview: {
      question: "What has this user been learning lately?",
      purpose:
        "Focus on their recent learning activity, course progress, current streak, and any patterns in their learning journey. Highlight their dedication and progress.",
    },
    project_summary: {
      question: "What kind of projects does this user build?",
      purpose:
        "Focus on the themes, technologies, and types of projects they work on. Identify patterns and interests across their project portfolio.",
    },
    next_steps: {
      question: "What might this user be planning to work on next?",
      purpose:
        "Based on their current learning progress, completed projects, and recent activity, suggest plausible next steps. Do not fabricate specific plans, but infer reasonable directions based on their trajectory.",
    },
    style_persona: {
      question: "What stands out about how this user learns or works?",
      purpose:
        "Focus on their learning style, work patterns, and approach based on their activity patterns, project types, and achievements. Highlight what makes their approach unique.",
    },
  };

  return instructions[questionType];
}

/**
 * Question type labels for UI
 */
export const QUESTION_LABELS: Record<ProfileQuestionType, string> = {
  learning_overview: "What are they learning?",
  project_summary: "Tell me about their projects",
  next_steps: "What's next for them?",
  style_persona: "How do they learn?",
};

/**
 * Allowed question types
 */
export const ALLOWED_QUESTION_TYPES: ProfileQuestionType[] = [
  "learning_overview",
  "project_summary",
  "next_steps",
  "style_persona",
];

