"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Stack } from "@/components/ui/spacing"
import { FocusPanel } from "./focus-panel"
import SideDock from "./side-dock"

import { WALLPAPERS, DEFAULT_WALLPAPER_ID } from "../_lib/wallpapers"

type Wallpaper = {
    id: string
    label: string
    thumb: string
    src?: string
}


export function StudyShell() {
    // --- gradient persistence ---
    const [gradientClass, setGradientClass] = useState<string>(() => {
        if (typeof window === "undefined") return "bg-gradient-to-r from-[#a1c4fd] to-[#c2e9fb]"
        return localStorage.getItem("study.gradient") ||
            "bg-gradient-to-r from-[#a1c4fd] to-[#c2e9fb]"
    })

    useEffect(() => {
        localStorage.setItem("study.gradient", gradientClass)
    }, [gradientClass])

    // --- wallpaper persistence + default ---
    const [wallpaper, setWallpaper] = useState<Wallpaper | null>(() => {
        if (typeof window === "undefined") return null
        const raw = localStorage.getItem("study.wallpaper")
        if (raw) {
            try {
                const parsed = JSON.parse(raw) as Wallpaper
                return parsed
            } catch {}
        }
        // default to lofi-desk on first load
        const def = WALLPAPERS.find(w => w.id === DEFAULT_WALLPAPER_ID) || null
        return def
    })

    useEffect(() => {
        if (wallpaper) localStorage.setItem("study.wallpaper", JSON.stringify(wallpaper))
        else localStorage.removeItem("study.wallpaper")
    }, [wallpaper])

    // Assistant prefs
    const [persona] = useState<"kind" | "direct" | "calm">("kind")
    const [gender] = useState<"feminine" | "masculine" | "androgynous">("feminine")

    return (
        <>
            {/* Full-bleed background */}
            <div className={`fixed inset-0 -z-10 ${gradientClass}`}>
                {wallpaper?.src && (
                    <video
                        className="absolute inset-0 w-full h-full object-cover object-center opacity-40 pointer-events-none"
                        src={wallpaper.src}
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                )}
            </div>

            {/* Foreground (keep simple) */}
            <Card className="overflow-hidden bg-transparent border-0 shadow-none">
                <div className="relative">
                    <CardContent className="px-4 pb-4">
                        <Stack gap="default">
                            <FocusPanel hideToggle />

                        </Stack>
                    </CardContent>
                </div>
            </Card>

            {/* If you’re using the sliding dock: pass setters directly */}
            {/* Otherwise, keep Room/SFX/Ask in tabs like before and pass the same props to RoomEditor */}
            <SideDock
                gradientClass={gradientClass}
                wallpaper={wallpaper}
                onChangeGradient={setGradientClass}
                onChangeWallpaper={setWallpaper}
                persona={persona}
                gender={gender}
            />
        </>
    )
}
