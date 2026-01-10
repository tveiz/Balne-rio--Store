"use client"

import { useEffect, useState } from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useNotificationStore } from "@/lib/stores/notification-store"
import { ImageUpload } from "@/components/image-upload"

interface SiteSettings {
  id: string
  site_name: string
  site_description: string
  theme: string
  payment_method: string
  pix_key?: string
  qr_code_url?: string
  bank_type?: string
}

export function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [siteName, setSiteName] = useState("")
  const [siteDescription, setSiteDescription] = useState("")
  const [theme, setTheme] = useState("normal")
  const [paymentMethod, setPaymentMethod] = useState("simulacao")
  const [pixKey, setPixKey] = useState("")
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [bankType, setBankType] = useState("")
  const [loading, setLoading] = useState(false)
  const { addNotification } = useNotificationStore()

  const loadSettings = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("site_settings").select("*").single()

    if (data) {
      setSettings(data)
      setSiteName(data.site_name)
      setSiteDescription(data.site_description)
      setTheme(data.theme)
      setPaymentMethod(data.payment_method)
      setPixKey(data.pix_key || "")
      setQrCodeUrl(data.qr_code_url || "")
      setBankType(data.bank_type || "")
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleSave = async () => {
    if (!siteName || !siteDescription) {
      addNotification({ type: "error", message: "Preencha todos os campos obrigatórios" })
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const updateData: any = {
        site_name: siteName,
        site_description: siteDescription,
        theme,
        payment_method: paymentMethod,
        updated_at: new Date().toISOString(),
      }

      if (paymentMethod === "confiavel") {
        if (!pixKey || !qrCodeUrl) {
          addNotification({ type: "error", message: "Preencha a chave Pix e QR Code para método confiável" })
          setLoading(false)
          return
        }
        updateData.pix_key = pixKey
        updateData.qr_code_url = qrCodeUrl
      } else if (paymentMethod === "imp") {
        if (!bankType) {
          addNotification({ type: "error", message: "Selecione o banco para método IMP" })
          setLoading(false)
          return
        }
        updateData.bank_type = bankType
      }

      if (settings) {
        await supabase.from("site_settings").update(updateData).eq("id", settings.id)
      } else {
        await supabase.from("site_settings").insert(updateData)
      }

      addNotification({ type: "success", message: "Configurações salvas!" })
      await loadSettings()
    } catch (error) {
      addNotification({ type: "error", message: "Erro ao salvar configurações" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações do Site</CardTitle>
          <CardDescription>Configure o nome e descrição da sua loja</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site-name">Nome do Site</Label>
            <Input
              id="site-name"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Minha Loja"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site-desc">Descrição do Site</Label>
            <Textarea
              id="site-desc"
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              placeholder="A melhor loja online"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tema do Site</CardTitle>
          <CardDescription>Escolha um tema com animações especiais</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tema</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="natal">Natal (Neve)</SelectItem>
                <SelectItem value="carnaval">Carnaval (Confetes)</SelectItem>
                <SelectItem value="sao-joao">São João</SelectItem>
                <SelectItem value="ano-novo">Ano Novo (Fogos)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Método de Pagamento</CardTitle>
          <CardDescription>Configure como os clientes irão pagar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Método</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simulacao">Simulação (Apenas simula pagamento)</SelectItem>
                <SelectItem value="imp">IMP (Verificação automática)</SelectItem>
                <SelectItem value="confiavel">Confiável (Aprovação manual)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "imp" && (
            <div className="space-y-2">
              <Label>Banco</Label>
              <Select value={bankType} onValueChange={setBankType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o banco" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sicoob">Sicoob</SelectItem>
                  <SelectItem value="nubank">Nubank</SelectItem>
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="mercadopago">Mercado Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {paymentMethod === "confiavel" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="pix-key">Chave Pix</Label>
                <Input
                  id="pix-key"
                  value={pixKey}
                  onChange={(e) => setPixKey(e.target.value)}
                  placeholder="sua-chave@pix.com"
                />
              </div>
              <ImageUpload value={qrCodeUrl} onChange={setQrCodeUrl} label="QR Code Pix" />
            </>
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={loading} size="lg" className="w-full">
        <Save className="w-4 h-4 mr-2" />
        Salvar Configurações
      </Button>
    </div>
  )
}
