"use client"

import { useRef, useState } from "react"
import { Stack, Inline } from "@/components/ui/spacing"
import { Heading, Body, Muted } from "@/components/ui/typography"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Mode = "bubble" | "panel"
type Persona = "kind" | "direct" | "calm"
type Gender = "feminine" | "masculine" | "androgynous"

export function AskAssistant({ mode = "panel", persona, gender }: { mode?: Mode; persona: Persona; gender: Gender }) {
    const [text, setText] = useState("Welcome! What do you want to study today?")
    const [loading, setLoading] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const speak = async (t: string) => {
        setLoading(true)
        try {
            const res = await fetch("/api/tts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: t, persona, gender }),
            })
            const data = await res.json()
            if (data?.audio) {
                const src = `data:${data.format || "audio/mpeg"};base64,${data.audio}`
                if (audioRef.current) {
                    audioRef.current.src = src
                    await audioRef.current.play()
                }
            }
        } finally {
            setLoading(false)
        }
    }

    if (mode === "bubble") {
        return (
            <div className="relative inline-block max-w-full">
                <div className="rounded-[18px] border border-border bg-accent px-5 py-4 shadow-sm">
                    <Inline gap="default" align="start">
                        <Body className="flex-1">{text}</Body>
                        <Button size="sm" onClick={() => speak(text)} disabled={loading}>{loading ? "..." : "Play"}</Button>
                    </Inline>
                </div>
                <div className="absolute -left-2 top-6 h-3 w-3 rotate-45 border-l border-t bg-accent border-border" />
                <audio ref={audioRef} />
            </div>
        )
    }

    return (
        <Card className="p-4">
            <Stack gap="tight">
                <Heading level={4}>Ask your mentor</Heading>
                <Muted variant="small">Type a question on a coding topic — your mentor will answer and speak it aloud.</Muted>
                <textarea
                    className="w-full rounded-md border border-border bg-background p-3"
                    rows={3}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <Inline gap="default" align="center">
                    <Button onClick={() => speak(text)} disabled={loading}>{loading ? "Generating..." : "Ask + Speak"}</Button>
                    <Button variant="outline" onClick={() => audioRef.current?.pause()}>Pause</Button>
                </Inline>
                <audio ref={audioRef} />
            </Stack>
        </Card>
    )
}
