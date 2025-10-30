"use client"

import { useRef, useState } from "react"
import { Stack, Grid, Inline } from "@/components/ui/spacing"
import { Heading, Body, Muted } from "@/components/ui/typography"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Music } from "lucide-react"
import { useMusic } from "@/components/music"
import { SFX_SOUNDS } from "../_lib/audio"

type AudioRefs = Record<string, HTMLAudioElement | null>

export function SfxPanel() {
    const { state, togglePlayerVisibility } = useMusic()

    const refs = useRef<AudioRefs>({})
    const [volumes, setVolumes] = useState<Record<string, number>>(
        Object.fromEntries(SFX_SOUNDS.map(s => [s.id, 0.5]))
    )
    const [enabled, setEnabled] = useState<Record<string, boolean>>(
        Object.fromEntries(SFX_SOUNDS.map(s => [s.id, false]))
    )

    const setAudioRef = (id: string) => (el: HTMLAudioElement | null) => {
        refs.current[id] = el
        if (el) {
            el.volume = volumes[id] ?? 0.5
            el.loop = true
        }
    }

    // quick linear fade helper (HTMLAudioElement-based)
    const fadeTo = (el: HTMLAudioElement, to: number, ms = 180) =>
        new Promise<void>((resolve) => {
            const from = el.volume
            const start = performance.now()
            const step = (t: number) => {
                const k = Math.min(1, (t - start) / ms)
                el.volume = from + (to - from) * k
                if (k < 1) requestAnimationFrame(step)
                else resolve()
            }
            requestAnimationFrame(step)
        })

    return (
        <Stack gap="default">
            <Inline align="center" justify="between">
                <Heading level={3}>Ambient SFX</Heading>
                <Inline gap="tight" align="center">
                    <Muted variant="tiny" className="hidden sm:block">
                        Use the global player for music.
                    </Muted>
                    <Button
                        size="sm"
                        variant={state.showPlayer ? "default" : "outline"}
                        onClick={togglePlayerVisibility}
                        className="gap-2"
                        title={state.showPlayer ? "Hide Music Player" : "Open Music Player"}
                    >
                        <Music className="h-4 w-4" />
                        {state.showPlayer ? "Hide Player" : "Open Player"}
                    </Button>
                </Inline>
            </Inline>

            <Grid gap="default" cols={3}>
                {SFX_SOUNDS.map((s) => (
                    <Card key={s.id} className="p-4">
                        <Stack gap="tight">
                            <Body className="font-medium">{s.label}</Body>

                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={enabled[s.id]}
                                    onCheckedChange={async (on) => {
                                        setEnabled(prev => ({ ...prev, [s.id]: on }))
                                        const el = refs.current[s.id]
                                        if (!el) return
                                        if (on) {
                                            try {
                                                // ensure fresh start and loop
                                                el.currentTime = 0
                                                // start muted, then fade up
                                                const target = volumes[s.id] ?? 0.5
                                                el.volume = 0
                                                await el.play().catch(() => {})
                                                await fadeTo(el, target, 180)
                                                // restore in case UI had changed during fade
                                                if (el.volume !== target) el.volume = target
                                            } catch {}
                                        } else {
                                            // fade down, then pause
                                            const v = el.volume
                                            await fadeTo(el, 0, 140)
                                            el.pause()
                                            el.volume = v // restore UI notion of volume; slider remains consistent
                                        }
                                    }}
                                />
                            </div>

                            <div>
                                <Slider
                                    value={[volumes[s.id] ?? 0.5]}
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    onValueChange={([v]) => {
                                        setVolumes(prev => ({ ...prev, [s.id]: v }))
                                        const el = refs.current[s.id]
                                        if (el) el.volume = v
                                    }}
                                />
                            </div>

                            {/* Multi-source, lazy preload */}
                            <audio ref={setAudioRef(s.id)} preload="none">
                                {s.srcs.map((src) => {
                                    const type = src.endsWith(".ogg") ? "audio/ogg" : "audio/mpeg"
                                    return <source key={src} src={src} type={type} />
                                })}
                            </audio>
                        </Stack>
                    </Card>
                ))}
            </Grid>
        </Stack>
    )
}
