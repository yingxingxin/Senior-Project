'use client';

import React, { useEffect, useState } from 'react';
import { EXERCISES } from '@/components/codeplayground/exercises';
import { formatMs } from "@/lib/utils"
import { Stack, Inline } from "@/components/ui/spacing";
import { Heading, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

type LeaderboardEntry = {
    userId: number;
    name: string | null;
    email: string;
    exerciseId: string;
    lang: string;
    bestMs: number;
};

const LANG_OPTIONS = [
    { value: 'all', label: 'All languages' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'html', label: 'HTML' },
    { value: 'sql', label: 'SQL' },
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
    { value: 'java', label: 'Java' }
];

export default function LeaderboardPage() {
    const [exerciseId, setExerciseId] = useState<string>(EXERCISES[0].id);
    const [lang, setLang] = useState<string>('all');
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams({ limit: '20' });

                if (exerciseId) params.set('exerciseId', exerciseId);
                if (lang && lang !== 'all') params.set('lang', lang);

                const res = await fetch(`/api/leaderboard?${params.toString()}`);
                if (!res.ok) throw new Error('Failed to load leaderboard');

                const data = await res.json();
                setEntries(data.entries ?? []);
            } catch (e) {
                console.error(e);
                setError('Could not load leaderboard.');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [exerciseId, lang]);

    return (
        <Stack gap="loose" as="main" className="min-h-dvh bg-background max-w-4xl mx-auto py-10 px-4">
            {/* Header */}
            <Stack gap="tight" as="header">
                <Heading level={1}>Timed Run Leaderboard</Heading>
                <Muted variant="small">
                    Fastest times per user. Filter by exercise and language.
                </Muted>
            </Stack>

            {/* Filters */}
            <Inline gap="default">
                <Stack gap="tight" className="w-48">
                    <Muted variant="small">Exercise</Muted>
                    <Select value={exerciseId} onValueChange={setExerciseId}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {EXERCISES.map((ex) => (
                                <SelectItem key={ex.id} value={ex.id}>
                                    {ex.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Stack>

                <Stack gap="tight" className="w-48">
                    <Muted variant="small">Language</Muted>
                    <Select value={lang} onValueChange={setLang}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {LANG_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </Stack>
            </Inline>

            {/* Table */}
            <Card className="overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted">
                            <TableHead>Rank</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Language</TableHead>
                            <TableHead className="text-right">Best time (mm:ss.ms)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">
                                    <Muted>Loading…</Muted>
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && error && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4 text-destructive">
                                    {error}
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && !error && entries.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-4">
                                    <Muted>No runs yet for this filter.</Muted>
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading &&
                            !error &&
                            entries.map((entry, idx) => (
                                <TableRow
                                    key={`${entry.userId}-${entry.exerciseId}-${entry.lang}`}
                                    className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/50'}
                                >
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell>{entry.name ?? '(no name)'}</TableCell>
                                    <TableCell>{entry.email}</TableCell>
                                    <TableCell>{entry.lang}</TableCell>
                                    <TableCell className="text-right">{formatMs(entry.bestMs)}</TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </Card>
        </Stack>
    );
}
