"use client"

import { useState } from "react"
import { Stack, Inline } from "@/components/ui/spacing"
import { Heading, Muted } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"
import { RoomEditor } from "./room-editor"
import { SfxPanel } from "./sfx-panel"
import { AskAssistant } from "./ask-assistant"
import {Bot, Brush, Waves, Timer as TimerIcon, LucideIcon} from "lucide-react"


type Persona = "kind" | "direct" | "calm"
type Gender  = "feminine" | "masculine" | "androgynous"

type Props = {
    gradientClass: string
    wallpaper: { src?: string } | null
    onChangeGradient: (cls: string) => void
    onChangeWallpaper: (w: { id: string; label: string; thumb: string; src?: string }) => void
    persona: Persona
    gender: Gender
}

export default function SideDock({
                                     gradientClass,
                                     wallpaper,
                                     onChangeGradient,
                                     onChangeWallpaper,
                                     persona,
                                     gender,
                                 }: Props) {
    const [tab, setTab] = useState<"room" | "sfx" | "ask" | "timer">("room")

    return (
        <div
            className="
        group fixed right-3 top-1/2 -translate-y-1/2 z-40
        w-11 hover:w-[360px] focus-within:w-[360px]
        transition-[width] duration-300
      "
        >
            {/* Handle */}
            <button
                className="
          h-28 w-11 rounded-l-xl bg-background/70 border border-border backdrop-blur
          flex items-center justify-center shadow-sm
          transition-opacity duration-200
          group-hover:opacity-0 group-hover:pointer-events-none
          focus-within:opacity-0
        "
                title="Tools"
                aria-label="Open study tools"
            >
                <div className="rotate-90 text-xs font-semibold tracking-wide text-muted-foreground">
                    TOOLS
                </div>
            </button>

            {/* Panel */}
            <div
                className="
          mt-2 overflow-hidden rounded-xl border border-border bg-background/85 backdrop-blur
          shadow-lg
          w-[360px] opacity-0 translate-x-2 pointer-events-none
          group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto
          focus-within:opacity-100 focus-within:translate-x-0 focus-within:pointer-events-auto
          transition-all duration-300
        "
            >
                {/* Tab strip */}
                <div className="flex items-center gap-1 p-2 border-b border-border">
                    <DockTab icon={Brush}     label="Room"      active={tab==="room"}  onClick={()=>setTab("room")} />
                    <DockTab icon={Waves}     label="SFX"       active={tab==="sfx"}   onClick={()=>setTab("sfx")} />
                    <DockTab icon={Bot}       label="Assistant" active={tab==="ask"}   onClick={()=>setTab("ask")} />
                    <DockTab icon={TimerIcon} label="Timer"     active={tab==="timer"} onClick={()=>setTab("timer")} />
                </div>

                {/* Content */}
                <div className="max-h-[70vh] overflow-auto p-3">
                    {tab === "room" && (
                        <RoomEditor
                            value={{ gradientClass, wallpaper }}
                            onChangeGradient={onChangeGradient}
                            onChangeWallpaper={onChangeWallpaper}
                        />
                    )}

                    {tab === "sfx" && <SfxPanel />}

                    {tab === "ask" && (
                        <Stack gap="tight">
                            <Heading level={4}>Ask Assistant</Heading>
                            <Muted variant="small">Type a question — your mentor will answer and speak it aloud.</Muted>
                            <AskAssistant mode="panel" persona={persona} gender={gender} />
                        </Stack>
                    )}

                    {tab === "timer" && <TimerControls />}
                </div>
            </div>
        </div>
    )
}

function DockTab({
                     icon: Icon,
                     label,
                     active,
                     onClick
                 }: { icon: LucideIcon; label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`
        inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
        ${active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"}
        transition-colors
      `}
            type="button"
        >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
        </button>
    )
}

function TimerControls() {
    const send = (type: string) => document.dispatchEvent(new CustomEvent(type))
    return (
        <Stack gap="default">
            <Heading level={4}>Pomodoro</Heading>
            <Muted variant="small">
                The Pomodoro Technique uses short, focused work intervals (like 25 minutes) separated by brief breaks.
                It improves focus, reduces fatigue, and makes progress feel achievable..!
            </Muted>
            <Inline gap="tight">
                <Button onClick={() => send("pomodoro:start-short")}>Start 25 / 5</Button>
                <Button onClick={() => send("pomodoro:start-long")} variant="outline">Start 50 / 12</Button>
            </Inline>
            <Inline gap="tight">
                <Button onClick={() => send("pomodoro:pause")} variant="outline">Pause</Button>
                <Button onClick={() => send("pomodoro:resume")}>Resume</Button>
                <Button onClick={() => send("pomodoro:reset")} variant="ghost">Reset</Button>
            </Inline>
        </Stack>
    )
}
