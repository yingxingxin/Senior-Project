"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Stack, Inline } from "@/components/ui/spacing"
import { Heading, Muted } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Timer } from "lucide-react"

type Phase = "idle" | "focus" | "break"

const PRESETS = {
    short: { focusMin: 25, breakMin: 5 },
    long:  { focusMin: 50, breakMin: 12 },
} as const

export function FocusPanel({ hideToggle = false }: { hideToggle?: boolean }) {
    // Clock (displayed when idle)
    const [now, setNow] = useState<string>(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    useEffect(() => {
        const id = setInterval(() => {
            setNow(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
        }, 15_000)
        return () => clearInterval(id)
    }, [])

    // Pomodoro state
    const [presetKey, setPresetKey] = useState<keyof typeof PRESETS>("short")
    const preset = PRESETS[presetKey]
    const [phase, setPhase] = useState<Phase>("idle")
    const [remaining, setRemaining] = useState<number>(preset.focusMin * 60)
    const [showPomodoro, setShowPomodoro] = useState(false)
    const [running, setRunning] = useState(false) // running vs paused
    const timerRef = useRef<number | null>(null)

    // Reset when preset changes and idle
    useEffect(() => {
        if (phase === "idle") setRemaining(preset.focusMin * 60)
    }, [presetKey, phase, preset.focusMin])

    const tickStart = () => {
        if (timerRef.current) return
        timerRef.current = window.setInterval(() => setRemaining((s) => s - 1), 1000)
        setRunning(true)
    }
    const tickStop = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        setRunning(false)
    }

    const start = useCallback(() => {
        // begin a fresh focus cycle with current preset
        setPhase("focus")
        setRemaining(preset.focusMin * 60)
        tickStart()
        // auto-collapse panel
        setShowPomodoro(false)
    }, [preset.focusMin])

    const pause = useCallback(() => {
        tickStop()
    }, [])

    const resume = useCallback(() => {
        if (phase !== "idle") tickStart()
    }, [phase])

    const reset = useCallback(() => {
        tickStop()
        setPhase("idle")
        setRemaining(preset.focusMin * 60)
    }, [preset.focusMin])

    // Phase transitions (only when running)
    useEffect(() => {
        if (!running) return
        if (remaining > 0) return

        if (phase === "focus") {
            setPhase("break")
            setRemaining(preset.breakMin * 60)
            return
        }
        if (phase === "break") {
            setPhase("focus")
            setRemaining(preset.focusMin * 60)
        }
    }, [remaining, running, phase, preset.breakMin, preset.focusMin])

    // Cleanup
    useEffect(() => () => tickStop(), [])

    const mmss = useMemo(() => {
        const m = Math.floor(remaining / 60).toString().padStart(2, "0")
        const s = Math.floor(remaining % 60).toString().padStart(2, "0")
        return `${m}:${s}`
    }, [remaining])

    // --- Press logic on the big time: click = pause/resume, long press = reset
    const pressTimer = useRef<number | null>(null)
    const longPressed = useRef(false)
    const LONG_MS = 600

    const onPointerDown = () => {
        longPressed.current = false
        pressTimer.current = window.setTimeout(() => {
            longPressed.current = true
            reset()
        }, LONG_MS)
    }

    const onPointerUp = () => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current)
            pressTimer.current = null
        }
        if (!longPressed.current) {
            if (phase !== "idle") {
                running ? pause() : resume()
            }
        }
    }

    const onPointerCancel = () => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current)
            pressTimer.current = null
        }
        longPressed.current = false
    }

    // ===== NEW: listen for side-dock events =====
    useEffect(() => {
        const onShort = () => {
            setPresetKey("short")
            setPhase("focus")
            setRemaining(PRESETS.short.focusMin * 60)
            tickStart()
            setShowPomodoro(false)
        }
        const onLong  = () => {
            setPresetKey("long")
            setPhase("focus")
            setRemaining(PRESETS.long.focusMin * 60)
            tickStart()
            setShowPomodoro(false)
        }
        const onPause = () => pause()
        const onResume= () => resume()
        const onReset = () => reset()

        document.addEventListener("pomodoro:start-short", onShort)
        document.addEventListener("pomodoro:start-long",  onLong)
        document.addEventListener("pomodoro:pause",       onPause)
        document.addEventListener("pomodoro:resume",      onResume)
        document.addEventListener("pomodoro:reset",       onReset)

        return () => {
            document.removeEventListener("pomodoro:start-short", onShort)
            document.removeEventListener("pomodoro:start-long",  onLong)
            document.removeEventListener("pomodoro:pause",       onPause)
            document.removeEventListener("pomodoro:resume",      onResume)
            document.removeEventListener("pomodoro:reset",       onReset)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    // ============================================

    return (
        <div className="relative">
            {/* Toggle button for Pomodoro controls (can be hidden when using the side dock) */}
            {!hideToggle && (
                <button
                    aria-expanded={showPomodoro}
                    aria-controls="pomodoro-section"
                    onClick={() => setShowPomodoro(v => !v)}
                    className="
            absolute right-4 top-4 z-10 rounded-xl p-2
            border border-border bg-background/60 backdrop-blur
            text-muted-foreground hover:text-foreground hover:bg-accent transition shadow-sm
          "
                    title="Toggle Pomodoro"
                >
                    <Timer className="h-5 w-5" />
                </button>
            )}

            {/* Center clock */}
            <div className="grid place-items-center py-20">
                <button
                    aria-label="Pause/Resume (hold to reset)"
                    className="
            relative rounded-2xl px-8 py-6
            text-6xl font-extrabold tracking-wide
            text-white/90 shadow-[0_0_40px_rgba(255,255,255,0.25)]
            backdrop-blur-xl bg-white/10 border border-white/20
            hover:bg-white/14 transition
            select-none
          "
                    onPointerDown={onPointerDown}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerCancel}
                    onTouchStart={onPointerDown}
                    onTouchEnd={onPointerUp}
                    title="Tap to pause/resume • Hold to reset"
                >
                    {phase === "idle" ? now : mmss}
                </button>
                <Muted variant="small" className="mt-3">
                    {phase === "idle"
                        ? ""
                        : running
                            ? (phase === "focus" ? "Focus time — tap to pause • hold to reset" : "Break time — tap to pause • hold to reset")
                            : "Paused — tap to resume • hold to reset"}
                </Muted>
            </div>

            {/* Collapsible Pomodoro section */}
            <div
                id="pomodoro-section"
                className={`
          max-w-xl mx-auto overflow-hidden transition-all duration-300
          ${showPomodoro ? "max-h-[520px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-2"}
        `}
            >
                <Card className="p-4 animate-fade-in-up">
                    <Stack gap="default">
                        <Heading level={4}>Pomodoro</Heading>
                        <Muted variant="small">
                            The Pomodoro Technique uses short, focused work intervals (like 25 minutes) separated by brief breaks.
                            It improves focus, reduces fatigue, and makes progress feel achievable.
                        </Muted>

                        <Inline gap="tight">
                            <Button
                                variant={presetKey === "short" ? "default" : "outline"}
                                onClick={() => {
                                    setPresetKey("short")
                                    if (phase === "idle") setRemaining(PRESETS.short.focusMin * 60)
                                }}
                            >
                                25 / 5
                            </Button>
                            <Button
                                variant={presetKey === "long" ? "default" : "outline"}
                                onClick={() => {
                                    setPresetKey("long")
                                    if (phase === "idle") setRemaining(PRESETS.long.focusMin * 60)
                                }}
                            >
                                50 / 12
                            </Button>
                        </Inline>

                        <Inline gap="tight">
                            {phase === "idle" ? (
                                <Button
                                    onClick={start}
                                    title="Start focus (auto-closes this panel)"
                                >
                                    Start
                                </Button>
                            ) : running ? (
                                <Button variant="outline" onClick={pause}>Pause</Button>
                            ) : (
                                <Button onClick={resume}>Resume</Button>
                            )}
                            <Button variant="ghost" onClick={reset} title="Reset to start of focus">
                                Reset
                            </Button>
                        </Inline>
                    </Stack>
                </Card>
            </div>
        </div>
    )
}
