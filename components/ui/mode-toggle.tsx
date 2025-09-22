"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Prevent hydration mismatch by only rendering after mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = () => {
    if (theme === "light") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("system")
    } else {
      setTheme("light")
    }
  }

  const getIcon = () => {
    // Show sun icon as default during SSR and before mount
    if (!mounted) {
      return <Sun className="h-[1.2rem] w-[1.2rem]" />
    }

    switch (theme) {
      case "light":
        return <Sun className="h-[1.2rem] w-[1.2rem]" />
      case "dark":
        return <Moon className="h-[1.2rem] w-[1.2rem]" />
      default:
        return <Sun className="h-[1.2rem] w-[1.2rem]" />
    }
  }

  // During SSR and before mount, show a consistent state
  const currentTheme = mounted ? (theme || 'system') : 'system'

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleToggle}
      title={`Current theme: ${currentTheme}. Click to cycle through themes.`}
      disabled={!mounted}
    >
      {getIcon()}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}