import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { headers } from "next/headers";
import { getAllQuizzes, getUserWithAssistant, getUserQuizStatus } from "@/src/db/queries";
import { Grid } from "@/components/ui/spacing";
import { Card } from "@/components/ui/card";
import { Heading, Body, Muted, Caption } from "@/components/ui/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { Stack, Inline } from "@/components/ui/spacing";

export default async function QuizzesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const userId = Number(session.user.id);

  // Get user's assistant info
  const [userData] = await getUserWithAssistant.execute({ userId });

  // Get all quizzes
  const allQuizzes = await getAllQuizzes.execute({});

  // Filter out quizzes without slugs (they can't be accessed)
  const validQuizzes = allQuizzes.filter((quiz) => quiz.slug != null && quiz.slug.trim() !== "");

  // Get completion status and best scores for all quizzes
  const quizStatuses = await Promise.all(
    validQuizzes.map(async (quiz) => {
      const [status] = await getUserQuizStatus.execute({
        userId,
        quizId: quiz.id,
      });
      return {
        quizId: quiz.id,
        bestPercentage: status?.bestPercentage ?? null,
        hasCompleted: status?.hasCompleted ?? false,
      };
    })
  );

  const statusMap = new Map(quizStatuses.map((s) => [s.quizId, s]));

  // Group quizzes by topic and skill level
  const quizzesByTopic = new Map<string, Map<string, typeof validQuizzes>>();

  for (const quiz of validQuizzes) {
    // Handle null/undefined topic slugs
    const topicKey = quiz.topicSlug || "uncategorized";
    const skillKey = quiz.skillLevel || "beginner";
    
    if (!quizzesByTopic.has(topicKey)) {
      quizzesByTopic.set(topicKey, new Map());
    }
    const topicMap = quizzesByTopic.get(topicKey)!;
    if (!topicMap.has(skillKey)) {
      topicMap.set(skillKey, []);
    }
    topicMap.get(skillKey)!.push(quiz);
  }

  // Format topic slugs for display
  const formatTopicName = (slug: string | null | undefined): string => {
    if (!slug) return "Uncategorized";
    return slug
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const skillLevelColors = {
    beginner: "bg-success/20 text-success border-success/30",
    intermediate: "bg-warning/20 text-warning border-warning/30",
    advanced: "bg-destructive/20 text-destructive border-destructive/30",
  };

  return (
    <div className="min-h-dvh bg-background container mx-auto px-4 py-8 max-w-7xl">
      <Stack gap="loose">
        {/* Header */}
        <Stack gap="tight">
          <Heading level={1}>Quizzes</Heading>
          <Muted>
            Practice and test your knowledge with topic-based quizzes. Each quiz is hosted by your assistant.
          </Muted>
        </Stack>

        {/* Assistant Host Info */}
        {userData?.assistantName && (
          <Card className="p-6">
            <Inline gap="default" align="center">
              {userData.assistantAvatar && (
                <Avatar className="h-12 w-12">
                  <AvatarImage src={userData.assistantAvatar} alt={userData.assistantName} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white font-semibold">
                    {userData.assistantName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <Stack gap="tight">
                <Body className="font-medium">Hosted by {userData.assistantName}</Body>
                <Muted variant="small">
                  {userData.assistantTagline || "Your learning companion"}
                </Muted>
              </Stack>
            </Inline>
          </Card>
        )}

        {/* Quizzes by Topic */}
        {Array.from(quizzesByTopic.entries()).map(([topicSlug, quizzesByLevel]) => (
          <Stack key={topicSlug} gap="default">
            <Heading level={2}>{formatTopicName(topicSlug)}</Heading>

            {/* Quizzes by Skill Level */}
            {Array.from(quizzesByLevel.entries()).map(([skillLevel, quizzes]) => (
              <Stack key={skillLevel} gap="default">
                <div className="flex items-center gap-3">
                  <Heading level={3} className="capitalize">
                    {skillLevel}
                  </Heading>
                  <Badge
                    className={skillLevelColors[skillLevel as keyof typeof skillLevelColors]}
                  >
                    {quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"}
                  </Badge>
                </div>

                <Grid cols={3} gap="default">
                  {quizzes.map((quiz) => {
                    const status = statusMap.get(quiz.id);
                    const hasCompleted = status?.hasCompleted ?? false;
                    const bestPercentage = status?.bestPercentage ?? null;

                    return (
                      <Card key={quiz.id} className="p-6 hover:shadow-lg transition-shadow">
                        <Stack gap="default">
                          <Stack gap="tight">
                            <div className="flex items-start justify-between gap-2">
                              <Heading level={4}>{quiz.title}</Heading>
                              {hasCompleted && (
                                <Badge className="bg-success/20 text-success border-success/30">
                                  ✓ Completed
                                </Badge>
                              )}
                            </div>
                            {quiz.description && (
                              <Muted variant="small" className="line-clamp-2">
                                {quiz.description}
                              </Muted>
                            )}
                            {hasCompleted && bestPercentage !== null && (
                              <Body variant="small" className="text-muted-foreground">
                                Best score: {bestPercentage}%
                              </Body>
                            )}
                          </Stack>

                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {quiz.defaultLength} {quiz.defaultLength === 1 ? "question" : "questions"}
                            </Badge>
                            <Badge
                              className={skillLevelColors[skillLevel as keyof typeof skillLevelColors]}
                            >
                              {skillLevel}
                            </Badge>
                          </div>

                          <Button asChild className="w-full mt-auto">
                            <Link href={`/quizzes/${quiz.slug}`}>
                              {hasCompleted ? "Retake Quiz" : "Start Quiz"}
                            </Link>
                          </Button>
                        </Stack>
                      </Card>
                    );
                  })}
                </Grid>
              </Stack>
            ))}
          </Stack>
        ))}

        {validQuizzes.length === 0 && (
          <Card className="p-12 text-center">
            <Stack gap="tight">
              <Heading level={3}>No quizzes available</Heading>
              <Muted>Check back later for new quizzes!</Muted>
            </Stack>
          </Card>
        )}
      </Stack>
    </div>
  );
}

