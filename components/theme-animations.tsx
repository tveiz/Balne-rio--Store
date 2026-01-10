"use client"

import { useEffect, useState, type JSX } from "react"

interface ThemeAnimationsProps {
  theme: string
}

export function ThemeAnimations({ theme }: ThemeAnimationsProps) {
  const [particles, setParticles] = useState<JSX.Element[]>([])

  useEffect(() => {
    const newParticles: JSX.Element[] = []

    if (theme === "natal") {
      // Neve caindo + árvores de natal + estrelas brilhantes
      for (let i = 0; i < 50; i++) {
        newParticles.push(
          <div
            key={`snow-${i}`}
            className="fixed w-2 h-2 bg-white rounded-full opacity-80 pointer-events-none animate-snow-fall shadow-glow-white"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${8 + Math.random() * 7}s`,
              filter: "blur(0.5px)",
            }}
          />,
        )
      }

      // Estrelas brilhantes
      for (let i = 0; i < 20; i++) {
        newParticles.push(
          <div
            key={`star-${i}`}
            className="fixed text-2xl pointer-events-none animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            ⭐
          </div>,
        )
      }

      // Flocos de neve grandes
      for (let i = 0; i < 10; i++) {
        newParticles.push(
          <div
            key={`snowflake-${i}`}
            className="fixed text-3xl pointer-events-none animate-snow-rotate"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              opacity: 0.7,
            }}
          >
            ❄️
          </div>,
        )
      }
    } else if (theme === "carnaval") {
      // Confetes coloridos + máscaras + serpentinas
      const colors = ["#FF0080", "#FFFF00", "#00FF00", "#0080FF", "#FF8000", "#FF00FF", "#00FFFF"]

      for (let i = 0; i < 60; i++) {
        newParticles.push(
          <div
            key={`confetti-${i}`}
            className="fixed w-3 h-6 opacity-80 pointer-events-none animate-confetti-spin"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: colors[Math.floor(Math.random() * colors.length)],
              animationDelay: `${Math.random() * 5}s`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />,
        )
      }

      // Máscaras de carnaval
      for (let i = 0; i < 8; i++) {
        newParticles.push(
          <div
            key={`mask-${i}`}
            className="fixed text-4xl pointer-events-none animate-float-slow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          >
            🎭
          </div>,
        )
      }

      // Balões coloridos
      for (let i = 0; i < 15; i++) {
        newParticles.push(
          <div
            key={`balloon-${i}`}
            className="fixed text-3xl pointer-events-none animate-float-up"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
            }}
          >
            🎈
          </div>,
        )
      }
    } else if (theme === "sao-joao") {
      // Fogueiras + bandeirinhas + balões juninos + estrelas
      for (let i = 0; i < 12; i++) {
        newParticles.push(
          <div
            key={`fire-${i}`}
            className="fixed text-4xl pointer-events-none animate-flicker"
            style={{
              bottom: "0%",
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          >
            🔥
          </div>,
        )
      }

      // Bandeirinhas coloridas no topo
      const flagColors = ["🟥", "🟨", "🟩", "🟦", "🟪"]
      for (let i = 0; i < 30; i++) {
        newParticles.push(
          <div
            key={`flag-${i}`}
            className="fixed text-2xl pointer-events-none animate-swing"
            style={{
              top: "5%",
              left: `${(i * 100) / 30}%`,
              animationDelay: `${(i % 5) * 0.1}s`,
            }}
          >
            {flagColors[i % flagColors.length]}
          </div>,
        )
      }

      // Balões subindo
      for (let i = 0; i < 8; i++) {
        newParticles.push(
          <div
            key={`lantern-${i}`}
            className="fixed text-3xl pointer-events-none animate-lantern-rise"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          >
            🏮
          </div>,
        )
      }

      // Estrelas cadentes
      for (let i = 0; i < 5; i++) {
        newParticles.push(
          <div
            key={`shooting-star-${i}`}
            className="fixed w-1 h-1 bg-yellow-300 pointer-events-none animate-shooting-star shadow-glow-yellow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 50}%`,
              animationDelay: `${Math.random() * 15}s`,
            }}
          />,
        )
      }
    } else if (theme === "ano-novo") {
      // Fogos de artifício + contagem + estrelas + brilhos
      const fireworkColors = ["#FFD700", "#FF1493", "#00FF00", "#00BFFF", "#FF4500", "#FF00FF"]

      for (let i = 0; i < 25; i++) {
        const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)]
        newParticles.push(
          <div
            key={`firework-${i}`}
            className="fixed w-20 h-20 rounded-full pointer-events-none animate-firework-burst"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 80}%`,
              border: `4px solid ${color}`,
              boxShadow: `0 0 20px ${color}`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />,
        )
      }

      // Partículas brilhantes
      for (let i = 0; i < 40; i++) {
        newParticles.push(
          <div
            key={`spark-${i}`}
            className="fixed w-1 h-1 bg-yellow-400 rounded-full pointer-events-none animate-sparkle shadow-glow-yellow"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />,
        )
      }

      // Champanhe
      for (let i = 0; i < 6; i++) {
        newParticles.push(
          <div
            key={`champagne-${i}`}
            className="fixed text-5xl pointer-events-none animate-champagne-pop"
            style={{
              left: `${10 + i * 15}%`,
              bottom: "10%",
              animationDelay: `${i * 0.5}s`,
            }}
          >
            🍾
          </div>,
        )
      }
    } else if (theme === "normal") {
      for (let i = 0; i < 30; i++) {
        newParticles.push(
          <div
            key={`particle-${i}`}
            className="fixed w-1.5 h-1.5 bg-primary/20 rounded-full pointer-events-none animate-float-gentle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          />,
        )
      }

      // Brilhos suaves ocasionais
      for (let i = 0; i < 10; i++) {
        newParticles.push(
          <div
            key={`glow-${i}`}
            className="fixed w-3 h-3 bg-accent/10 rounded-full pointer-events-none animate-pulse-slow blur-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />,
        )
      }
    }

    setParticles(newParticles)
  }, [theme])

  return <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">{particles}</div>
}
