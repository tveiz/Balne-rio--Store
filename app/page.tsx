"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useUserStore } from "@/lib/stores/user-store"
import { useNotificationStore } from "@/lib/stores/notification-store"
import { getUserLocation } from "@/lib/utils/hwid"
import { sendDiscordWebhook, WEBHOOKS } from "@/lib/utils/webhook"
import { NotificationToast } from "@/components/notification-toast"
import { TermsModal } from "@/components/terms-modal"
import { StorePage } from "@/components/store-page"
import { AdminPanel } from "@/components/admin-panel"
import { LoginPage } from "@/components/login-page"
import { DatabaseSetup } from "@/components/database-setup"

export default function Page() {
  const { user, isAdmin, termsAccepted, setTermsAccepted } = useUserStore()
  const { addNotification } = useNotificationStore()
  const [showTerms, setShowTerms] = useState(false)
  const [loading, setLoading] = useState(true)
  const [databaseReady, setDatabaseReady] = useState(false)
  const [checkingDatabase, setCheckingDatabase] = useState(true)

  useEffect(() => {
    const checkDatabase = async () => {
      const supabase = createClient()

      try {
        const { data, error } = await supabase.from("users").select("id").limit(1)

        if (error) {
          console.log("[v0] Database not ready:", error.message)
          setDatabaseReady(false)
        } else {
          console.log("[v0] Database is ready")
          setDatabaseReady(true)
        }
      } catch (err) {
        console.error("[v0] Database check error:", err)
        setDatabaseReady(false)
      }

      setCheckingDatabase(false)
    }

    checkDatabase()
  }, [])

  useEffect(() => {
    if (!databaseReady) return

    const checkUser = async () => {
      console.log("[v0] Checking user:", { user, isAdmin, termsAccepted })

      if (user) {
        const supabase = createClient()

        if (!isAdmin && !termsAccepted) {
          const { data: termsData } = await supabase
            .from("terms_accepted")
            .select("*")
            .eq("user_email", user.email)
            .single()

          console.log("[v0] Terms data:", termsData)

          if (!termsData) {
            setShowTerms(true)
          } else {
            setTermsAccepted(true)
          }
        }
      }

      setLoading(false)
    }

    checkUser()
  }, [user, isAdmin, termsAccepted, setTermsAccepted, databaseReady])

  const handleAcceptTerms = async () => {
    if (!user) return

    const supabase = createClient()
    const location = await getUserLocation()

    console.log("[v0] Accepting terms for:", user.email)

    // Salvar no banco
    const { error } = await supabase.from("terms_accepted").insert({
      user_email: user.email,
      user_name: user.name,
      ip_address: location.ip,
    })

    if (error) {
      console.error("[v0] Error saving terms:", error)
    }

    if (!isAdmin) {
      await sendDiscordWebhook(WEBHOOKS.TERMS, {
        title: "✅ Termos Aceitos",
        color: 0x00ff00,
        fields: [
          { name: "Nome", value: user.name, inline: true },
          { name: "Email", value: user.email, inline: true },
          { name: "IP", value: location.ip, inline: true },
          { name: "Cidade", value: location.city, inline: true },
          { name: "País", value: location.country, inline: true },
          { name: "Data", value: new Date().toLocaleString("pt-BR"), inline: false },
        ],
      })

      await sendDiscordWebhook(WEBHOOKS.GENERAL, {
        title: "📋 Termos Aceitos",
        description: `${user.name} (${user.email}) aceitou os termos`,
        color: 0x00ff00,
        timestamp: new Date().toISOString(),
      })
    }

    setTermsAccepted(true)
    setShowTerms(false)
    addNotification({
      type: "success",
      message: "Termos aceitos com sucesso!",
    })
  }

  const handleDatabaseReady = async () => {
    setCheckingDatabase(true)
    const supabase = createClient()

    try {
      const { data, error } = await supabase.from("users").select("id").limit(1)

      if (error) {
        addNotification({
          type: "error",
          message: "Banco de dados ainda não está pronto. Verifique se o script foi executado corretamente.",
        })
        setCheckingDatabase(false)
        return
      }

      setDatabaseReady(true)
      addNotification({
        type: "success",
        message: "Banco de dados configurado com sucesso!",
      })
    } catch (err) {
      addNotification({
        type: "error",
        message: "Erro ao verificar o banco de dados.",
      })
    }

    setCheckingDatabase(false)
  }

  if (checkingDatabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5E6D3]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-gray-700">Verificando banco de dados...</p>
        </div>
      </div>
    )
  }

  if (!databaseReady) {
    return (
      <>
        <DatabaseSetup onComplete={handleDatabaseReady} />
        <NotificationToast />
      </>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5E6D3]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="text-gray-700">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <LoginPage />
        <NotificationToast />
      </>
    )
  }

  return (
    <>
      {isAdmin ? <AdminPanel /> : <StorePage />}
      {!isAdmin && <TermsModal open={showTerms} onAccept={handleAcceptTerms} />}
      <NotificationToast />
    </>
  )
}
