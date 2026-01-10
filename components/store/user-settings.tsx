"use client"

import { useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useNotificationStore } from "@/lib/stores/notification-store"

export function UserSettings() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const { addNotification } = useNotificationStore()

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
    addNotification({ type: "success", message: `Tema ${newTheme === "dark" ? "escuro" : "claro"} ativado!` })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Aparência</CardTitle>
          <CardDescription>Personalize a aparência do site</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tema</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => handleThemeChange("light")}
                className="w-full"
              >
                <Sun className="w-4 h-4 mr-2" />
                Claro
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => handleThemeChange("dark")}
                className="w-full"
              >
                <Moon className="w-4 h-4 mr-2" />
                Escuro
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sobre</CardTitle>
          <CardDescription>Informações do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Versão</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Suporte</span>
              <span className="font-medium">Discord</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
