"use client"

import Image from "next/image"
import { Stack, Grid, Inline } from "@/components/ui/spacing"
import { Heading, Muted, Body } from "@/components/ui/typography"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PRESET_GRADIENTS, WALLPAPERS } from "../_lib/wallpapers"

type Props = {
    value: { gradientClass: string; wallpaper: { src?: string } | null }
    onChangeGradient: (cls: string) => void
    onChangeWallpaper: (w: { id: string; label: string; thumb: string; src?: string }) => void
}

export function RoomEditor({ value, onChangeGradient, onChangeWallpaper }: Props) {
    return (
        <Stack gap="default">
            <Heading level={3}>Room Editor</Heading>
            <Muted variant="small">Pick a palette and (optionally) an animated wallpaper.</Muted>

            <Card className="p-4">
                <Stack gap="default">
                    <Body className="font-medium">Gradients</Body>
                    <Inline gap="default">
                        {PRESET_GRADIENTS.map((g) => (
                            <button
                                key={g.id}
                                aria-label={g.label}
                                onClick={() => onChangeGradient(g.className)}
                                className={`h-10 w-16 rounded-lg border border-border ${g.className} ${value.gradientClass===g.className ? "ring-2 ring-primary" : ""}`}
                            />
                        ))}
                    </Inline>

                    <Body className="font-medium">Wallpapers</Body>
                    <Grid gap="tight" cols={3}>
                        {WALLPAPERS.map((w) => (
                            <button
                                key={w.id}
                                onClick={() => onChangeWallpaper(w)}
                                className={`rounded-lg border border-border overflow-hidden ${value.wallpaper?.src===w.src ? "ring-2 ring-primary" : ""}`}
                            >
                                <Image src={w.thumb} alt={w.label} width={300} height={180} className="w-full h-auto" />
                            </button>
                        ))}
                    </Grid>

                    <Inline gap="default" align="center">
                        <Muted variant="small">Selections apply immediately across tabs.</Muted>
                        <Button
                            variant="outline"
                            onClick={() => onChangeWallpaper({ id: "none", label: "None", thumb: "", src: undefined })}
                        >
                            Remove Wallpaper
                        </Button>
                    </Inline>
                </Stack>
            </Card>
        </Stack>
    )
}
