"use client"

import { useEffect, useState, type JSX } from "react"

interface ThemeAnimationsProps {
  theme: string
}

export function ThemeAnimations({ theme }: ThemeAnimationsProps) {
  const [particles, setParticles] = useState<JSX.Element[]>([])

  useEffect(() => {
    if (theme === "normal") {
      setParticles([])
      return
    }

    const newParticles: JSX.Element[] = []

    if (theme === "natal") {
      for (let i = 0; i < 20; i++) {
        newParticles.push(
          <div
            key={`snow-${i}`}
            className="fixed w-2 h-2 bg-white rounded-full opacity-70 pointer-events-none animate-snow"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 5}s`,
            }}
          />,
        )
      }
    } else if (theme === "carnaval") {
      const colors = ["#FF0080", "#FFFF00", "#00FF00", "#0080FF", "#FF8000"]
      for (let i = 0; i < 30; i++) {
        newParticles.push(
          <div
            key={`confetti-${i}`}
            className="fixed w-3 h-6 opacity-70 pointer-events-none animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: colors[Math.floor(Math.random() * colors.length)],
              animationDelay: `${Math.random() * 5}s`,
            }}
          />,
        )
      }
    } else if (theme === "ano-novo") {
      for (let i = 0; i < 15; i++) {
        newParticles.push(
          <div
            key={`firework-${i}`}
            className="fixed w-16 h-16 border-4 border-yellow-400 rounded-full opacity-50 pointer-events-none animate-firework"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />,
        )
      }
    }

    setParticles(newParticles)
  }, [theme])

  return <div className="fixed inset-0 pointer-events-none z-0">{particles}</div>
}
