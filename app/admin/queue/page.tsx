"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stack, Grid, Inline } from "@/components/ui/spacing";
import { Heading, Muted, Body } from "@/components/ui/typography";
import { RefreshCw, Clock, CheckCircle, XCircle, Loader2, AlertCircle, Activity } from "lucide-react";

interface JobSummary {
  id: string | undefined;
  name: string;
  state: string;
  progress: number | object | string | boolean;
  timestamp: number | undefined;
  processedOn: number | undefined;
  finishedOn: number | undefined;
  attemptsMade: number;
  failedReason?: string;
  data: {
    userId?: number;
    topic?: string;
    triggerSource?: string;
  };
}

interface QueueStats {
  queue: string;
  counts: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    total: number;
  };
  successRate: number;
  avgProcessingTimeMs: number;
  activeJobs: JobSummary[];
  completedJobs: JobSummary[];
  failedJobs: JobSummary[];
  waitingJobs: JobSummary[];
  error?: string;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function formatTimestamp(ts: number | undefined): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

function getProgressValue(progress: number | object | string | boolean): number {
  if (typeof progress === "number") return progress;
  if (typeof progress === "boolean") return progress ? 100 : 0;
  if (typeof progress === "string") {
    const parsed = parseInt(progress, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof progress === "object" && progress !== null && "percent" in progress) {
    return (progress as { percent: number }).percent;
  }
  return 0;
}

export default function QueuePage() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/admin/api/queue/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch queue stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleRefresh = () => {
    setIsLoading(true);
    fetchStats();
  };

  if (isLoading && !stats) {
    return (
      <Stack gap="loose">
        <Stack gap="tight">
          <Heading level={1}>Queue Dashboard</Heading>
          <Muted variant="small">Monitor background job processing</Muted>
        </Stack>
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Stack>
    );
  }

  return (
    <Stack gap="loose">
      <Inline justify="between" align="center">
        <Stack gap="tight">
          <Heading level={1}>Queue Dashboard</Heading>
          <Muted variant="small">
            Monitor background job processing
            {lastUpdated && (
              <span className="ml-2">
                • Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </Muted>
        </Stack>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </Inline>

      {stats?.error && (
        <Card className="border-yellow-500">
          <CardContent className="pt-4">
            <Inline gap="tight" align="center">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <Body variant="small">{stats.error}</Body>
            </Inline>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <Grid gap="default" cols={4}>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Waiting</CardDescription>
            <CardTitle className="text-2xl">{stats?.counts.waiting ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <Inline gap="tight" align="center">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Muted variant="tiny">Jobs in queue</Muted>
            </Inline>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-2xl">{stats?.counts.active ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <Inline gap="tight" align="center">
              <Activity className="h-4 w-4 text-blue-500" />
              <Muted variant="tiny">Currently processing</Muted>
            </Inline>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-2xl text-destructive">{stats?.counts.failed ?? 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <Inline gap="tight" align="center">
              <XCircle className="h-4 w-4 text-destructive" />
              <Muted variant="tiny">Jobs with errors</Muted>
            </Inline>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Success Rate</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats?.successRate ?? 100}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Inline gap="tight" align="center">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <Muted variant="tiny">
                Avg: {formatDuration(stats?.avgProcessingTimeMs ?? 0)}
              </Muted>
            </Inline>
          </CardContent>
        </Card>
      </Grid>

      <Grid gap="default" className="xl:grid-cols-2">
        {/* Active Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Active Jobs
            </CardTitle>
            <CardDescription>Currently processing</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.activeJobs.length === 0 ? (
              <Muted variant="small">No jobs currently processing</Muted>
            ) : (
              <Stack gap="tight">
                {stats?.activeJobs.map((job) => (
                  <div key={job.id} className="rounded-md border p-3">
                    <Inline justify="between" align="start">
                      <div>
                        <Body variant="small" className="font-medium">
                          {job.data.topic || "Unknown Topic"}
                        </Body>
                        <Muted variant="tiny">
                          User #{job.data.userId} • {job.data.triggerSource}
                        </Muted>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          {getProgressValue(job.progress)}%
                        </Badge>
                        <Muted variant="tiny" className="block mt-1">
                          Started: {formatTimestamp(job.processedOn)}
                        </Muted>
                      </div>
                    </Inline>
                    <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${getProgressValue(job.progress)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Waiting Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Waiting Jobs
            </CardTitle>
            <CardDescription>Queued for processing</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.waitingJobs.length === 0 ? (
              <Muted variant="small">No jobs waiting</Muted>
            ) : (
              <Stack gap="tight">
                {stats?.waitingJobs.slice(0, 5).map((job) => (
                  <div key={job.id} className="rounded-md border p-3">
                    <Inline justify="between" align="center">
                      <div>
                        <Body variant="small" className="font-medium">
                          {job.data.topic || "Unknown Topic"}
                        </Body>
                        <Muted variant="tiny">
                          User #{job.data.userId} • {job.data.triggerSource}
                        </Muted>
                      </div>
                      <Muted variant="tiny">{formatTimestamp(job.timestamp)}</Muted>
                    </Inline>
                  </div>
                ))}
                {(stats?.waitingJobs.length ?? 0) > 5 && (
                  <Muted variant="tiny" className="text-center">
                    +{(stats?.waitingJobs.length ?? 0) - 5} more waiting
                  </Muted>
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid gap="default" className="xl:grid-cols-2">
        {/* Recent Completions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Recent Completions
            </CardTitle>
            <CardDescription>Successfully processed jobs</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.completedJobs.length === 0 ? (
              <Muted variant="small">No recent completions</Muted>
            ) : (
              <Stack gap="tight">
                {stats?.completedJobs.slice(0, 5).map((job) => {
                  const duration = job.finishedOn && job.processedOn
                    ? job.finishedOn - job.processedOn
                    : 0;
                  return (
                    <div key={job.id} className="rounded-md border p-3">
                      <Inline justify="between" align="center">
                        <div>
                          <Body variant="small" className="font-medium">
                            {job.data.topic || "Unknown Topic"}
                          </Body>
                          <Muted variant="tiny">
                            User #{job.data.userId} • {job.data.triggerSource}
                          </Muted>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {formatDuration(duration)}
                          </Badge>
                          <Muted variant="tiny" className="block mt-1">
                            {formatTimestamp(job.finishedOn)}
                          </Muted>
                        </div>
                      </Inline>
                    </div>
                  );
                })}
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* Failed Jobs */}
        <Card className={stats?.failedJobs.length ? "border-destructive" : ""}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Failed Jobs
            </CardTitle>
            <CardDescription>Jobs that encountered errors</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.failedJobs.length === 0 ? (
              <Muted variant="small">No failed jobs</Muted>
            ) : (
              <Stack gap="tight">
                {stats?.failedJobs.map((job) => (
                  <div key={job.id} className="rounded-md border border-destructive/50 p-3">
                    <Inline justify="between" align="start">
                      <div className="flex-1 min-w-0">
                        <Body variant="small" className="font-medium">
                          {job.data.topic || "Unknown Topic"}
                        </Body>
                        <Muted variant="tiny">
                          User #{job.data.userId} • Attempts: {job.attemptsMade}
                        </Muted>
                        {job.failedReason && (
                          <Muted variant="tiny" className="text-destructive mt-1 truncate">
                            Error: {job.failedReason}
                          </Muted>
                        )}
                      </div>
                      <Muted variant="tiny">{formatTimestamp(job.finishedOn)}</Muted>
                    </Inline>
                  </div>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Stack>
  );
}
