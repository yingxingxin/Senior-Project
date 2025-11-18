
'use client';

import React, { useEffect, useState } from 'react';
// Adjust these imports to match where you keep exercise + lang data:
import { EXERCISES } from '@/components/codeplayground/exercises';
import { formatMs } from "@/lib/utils"

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
        <main className="max-w-4xl mx-auto py-10 px-4 space-y-8">
            <header className="space-y-2">
                <h1 className="text-2xl font-bold">Timed Run Leaderboard</h1>
                <p className="text-sm text-slate-600">
                    Fastest times per user. Filter by exercise and language.
                </p>
            </header>

            {/* Filters */}
            <section className="flex flex-wrap gap-4">
                <label className="flex flex-col text-sm gap-1">
                    Exercise
                    <select
                        className="border rounded px-2 py-1"
                        value={exerciseId}
                        onChange={(e) => setExerciseId(e.target.value)}
                    >
                        {EXERCISES.map((ex) => (
                            <option key={ex.id} value={ex.id}>
                                {ex.title}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col text-sm gap-1">
                    Language
                    <select
                        className="border rounded px-2 py-1"
                        value={lang}
                        onChange={(e) => setLang(e.target.value)}
                    >
                        {LANG_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </label>
            </section>

            {/* Table */}
            <section className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-slate-100">
                    <tr>
                        <th className="px-3 py-2 text-left">Rank</th>
                        <th className="px-3 py-2 text-left">User</th>
                        <th className="px-3 py-2 text-left">Email</th>
                        <th className="px-3 py-2 text-left">Language</th>
                        <th className="px-3 py-2 text-right">Best time (mm:ss.ms)</th>
                    </tr>
                    </thead>
                    <tbody>
                    {loading && (
                        <tr>
                            <td colSpan={5} className="px-3 py-4 text-center">
                                Loading…
                            </td>
                        </tr>
                    )}

                    {!loading && error && (
                        <tr>
                            <td colSpan={5} className="px-3 py-4 text-center text-red-600">
                                {error}
                            </td>
                        </tr>
                    )}

                    {!loading && !error && entries.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-3 py-4 text-center">
                                No runs yet for this filter.
                            </td>
                        </tr>
                    )}

                    {!loading &&
                        !error &&
                        entries.map((entry, idx) => (
                            <tr
                                key={`${entry.userId}-${entry.exerciseId}-${entry.lang}`}
                                className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}
                            >
                                <td className="px-3 py-2">{idx + 1}</td>
                                <td className="px-3 py-2">{entry.name ?? '(no name)'}</td>
                                <td className="px-3 py-2">{entry.email}</td>
                                <td className="px-3 py-2">{entry.lang}</td>
                                <td className="px-3 py-2 text-right">{formatMs(entry.bestMs)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </main>
    );
}