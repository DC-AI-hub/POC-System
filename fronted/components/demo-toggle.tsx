"use client"

import { Button } from "@/components/ui/button"

interface DemoToggleProps {
  isAuthenticated: boolean
  onToggle: () => void
}

export function DemoToggle({ isAuthenticated, onToggle }: DemoToggleProps) {
  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={onToggle}
        variant="outline"
        size="sm"
        className="bg-white/90 backdrop-blur-sm border-slate-300 text-slate-700 hover:bg-white"
      >
        {isAuthenticated ? "Show Login" : "Show Dashboard"}
      </Button>
    </div>
  )
} 