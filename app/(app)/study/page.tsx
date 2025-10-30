import { Stack } from "@/components/ui/spacing"
import { StudyShell } from "./_components/study-shell"

export default function StudyPage() {
    return (
        <Stack gap="loose" as="main" className="max-w-6xl mx-auto px-4 py-8">

            <StudyShell />
        </Stack>
    )
}
