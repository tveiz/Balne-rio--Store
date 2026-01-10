"use client"

import { useState } from "react"
import { ShoppingBag } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/image-upload"
import { createClient } from "@/lib/supabase/client"
import { useUserStore } from "@/lib/stores/user-store"
import { useNotificationStore } from "@/lib/stores/notification-store"
import { generateHWID, getUserLocation } from "@/lib/utils/hwid"
import { sendDiscordWebhook, WEBHOOKS } from "@/lib/utils/webhook"

export function LoginPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [showAdminEmail, setShowAdminEmail] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")

  const { setUser, setIsAdmin } = useUserStore()
  const { addNotification } = useNotificationStore()

  const handleLogin = async (isAdminLogin = false) => {
    if (!isAdminLogin && (!name || !email)) {
      addNotification({
        type: "error",
        message: "Por favor, preencha nome e email",
      })
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const hwid = generateHWID()
      const location = await getUserLocation()

      const finalEmail = isAdminLogin ? "tm9034156@gmail.com" : email
      const finalName = isAdminLogin ? "adm00" : name
      const finalPhoto = isAdminLogin
        ? "https://api.dicebear.com/7.x/avataaars/svg?seed=admin&backgroundColor=b6e3f4"
        : photoUrl

      console.log("[v0] Attempting login:", { finalEmail, finalName, isAdminLogin, hwid })

      const { data: existingUsers, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .or(`email.eq.${finalEmail},hwid.eq.${hwid}`)

      console.log("[v0] Existing users:", existingUsers, "Error:", fetchError)

      let userId: string
      const existingUser = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null

      if (existingUser) {
        userId = existingUser.id
        const { error: updateError } = await supabase
          .from("users")
          .update({
            name: finalName,
            email: finalEmail, // Atualizar email também
            photo_url: finalPhoto || existingUser.photo_url,
            ip_address: location.ip,
            city: location.city,
            country: location.country,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)

        if (updateError) {
          console.error("[v0] Update error:", updateError)
        }

        // Log de login (não enviar se for admin)
        if (!isAdminLogin) {
          await sendDiscordWebhook(WEBHOOKS.GENERAL, {
            title: "🔓 Login Realizado",
            color: 0x0099ff,
            fields: [
              { name: "Nome", value: finalName, inline: true },
              { name: "Email", value: finalEmail, inline: true },
              { name: "ID", value: userId, inline: true },
              { name: "HWID", value: hwid, inline: true },
              { name: "IP", value: location.ip, inline: true },
              { name: "Cidade", value: location.city, inline: true },
              { name: "País", value: location.country, inline: true },
              { name: "Data", value: new Date().toLocaleString("pt-BR"), inline: false },
            ],
          })
        }

        addNotification({
          type: "success",
          message: isAdminLogin ? "Bem-vindo Admin!" : "Login realizado com sucesso!",
        })
      } else {
        const { data: newUser, error } = await supabase
          .from("users")
          .insert({
            email: finalEmail,
            name: finalName,
            photo_url: finalPhoto,
            hwid,
            ip_address: location.ip,
            city: location.city,
            country: location.country,
          })
          .select()
          .single()

        if (error) {
          console.error("[v0] Insert error:", error)
          throw error
        }

        userId = newUser.id
        console.log("[v0] New user created:", newUser)

        // Log de conta criada (não enviar se for admin)
        if (!isAdminLogin) {
          await sendDiscordWebhook(WEBHOOKS.ACCOUNT_CREATED, {
            title: "🎉 Nova Conta Criada",
            color: 0x00ff00,
            fields: [
              { name: "Nome", value: finalName, inline: true },
              { name: "Email", value: finalEmail, inline: true },
              { name: "ID", value: userId, inline: true },
              { name: "HWID", value: hwid, inline: true },
              { name: "IP", value: location.ip, inline: true },
              { name: "Cidade", value: location.city, inline: true },
              { name: "País", value: location.country, inline: true },
              { name: "Foto", value: finalPhoto ? "Sim" : "Não", inline: true },
              { name: "Data", value: new Date().toLocaleString("pt-BR"), inline: false },
            ],
          })

          await sendDiscordWebhook(WEBHOOKS.GENERAL, {
            title: "✨ Nova Conta",
            description: `${finalName} (${finalEmail}) criou uma conta`,
            color: 0x00ff00,
            timestamp: new Date().toISOString(),
          })
        }

        addNotification({
          type: "success",
          message: isAdminLogin ? "Conta Admin criada!" : "Conta criada com sucesso!",
        })
      }

      const user = {
        id: userId,
        email: finalEmail,
        name: finalName,
        photo_url: finalPhoto,
        hwid,
      }

      console.log("[v0] Setting user:", user)
      setUser(user)

      // Verificar se é admin
      if (isAdminLogin || finalEmail === "tm9034156@gmail.com") {
        console.log("[v0] Setting admin status")
        setIsAdmin(true)
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      addNotification({
        type: "error",
        message: "Erro ao fazer login. Tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogoClick = () => {
    const newCount = clickCount + 1
    setClickCount(newCount)
    console.log("[v0] Logo clicked:", newCount, "times")
    if (newCount >= 5) {
      setShowAdminEmail(true)
      setClickCount(0)
    }
  }

  const handleAdminLogin = () => {
    console.log("[v0] Admin email entered:", adminEmail)
    if (adminEmail === "tm9034156@gmail.com") {
      setShowAdminEmail(false)
      setAdminEmail("")
      handleLogin(true)
    } else {
      addNotification({
        type: "error",
        message: "Email incorreto",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div
              onClick={handleLogoClick}
              title="Clique 5 vezes para acesso admin"
              className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <ShoppingBag className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Bem-vindo</h1>
          <p className="text-muted-foreground">Entre ou crie sua conta</p>
        </div>

        {showAdminEmail ? (
          <Card>
            <CardHeader>
              <CardTitle>Acesso Administrativo</CardTitle>
              <CardDescription>Digite o email secreto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email Secreto</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Digite o email secreto"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAdminLogin()
                    }
                  }}
                />
              </div>
              <Button onClick={handleAdminLogin} className="w-full">
                Confirmar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAdminEmail(false)
                  setAdminEmail("")
                }}
                className="w-full"
              >
                Cancelar
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Login / Criar Conta</CardTitle>
              <CardDescription>Entre com seu email e nome</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Digite seu nome"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && name && email) {
                      handleLogin(false)
                    }
                  }}
                />
              </div>
              <ImageUpload value={photoUrl} onChange={setPhotoUrl} label="Foto de Perfil" optional />
              <Button onClick={() => handleLogin(false)} disabled={loading} className="w-full">
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
