"use client"

import { useState, useEffect } from "react"
import { CreditCard, Copy, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { useUserStore } from "@/lib/stores/user-store"
import { useNotificationStore } from "@/lib/stores/notification-store"
import { sendDiscordWebhook, WEBHOOKS } from "@/lib/utils/webhook"

interface Product {
  id: string
  name: string
  photo_url: string
}

interface CheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product
  finalPrice: number
  couponCode?: string
}

export function CheckoutModal({ open, onOpenChange, product, finalPrice, couponCode }: CheckoutModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [pixKey, setPixKey] = useState<string>("")
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const [purchaseComplete, setPurchaseComplete] = useState(false)
  const [isInfiniteStock, setIsInfiniteStock] = useState(false)
  const { user } = useUserStore()
  const { addNotification } = useNotificationStore()

  useEffect(() => {
    const loadSettings = async () => {
      const supabase = createClient()
      const { data: settings } = await supabase.from("site_settings").select("*").single()
      if (settings) {
        setPaymentMethod(settings.payment_method)
        setPixKey(settings.pix_key || "")
        setQrCodeUrl(settings.qr_code_url || "")
      }

      const { data: prod } = await supabase.from("products").select("stock").eq("id", product.id).single()
      if (prod && (prod.stock === "inf" || prod.stock === "INF")) {
        setIsInfiniteStock(true)
      }
    }
    if (open) {
      loadSettings()
      setPurchaseComplete(false)
    }
  }, [open, product.id])

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(pixKey)
    setCopied(true)
    addNotification({ type: "success", message: "Chave Pix copiada!" })
    setTimeout(() => setCopied(false), 2000)
  }

  const handleConfirmPayment = async () => {
    if (!user) return

    setLoading(true)
    const supabase = createClient()

    try {
      if (isInfiniteStock) {
        const purchaseData = {
          user_id: user.id,
          product_id: product.id,
          product_name: product.name,
          product_photo: product.photo_url,
          amount_paid: finalPrice,
          payment_method: paymentMethod,
          coupon_used: couponCode || null,
          status: "pending",
          product_key: "Aguarde atendimento no Discord",
        }

        const { data: purchase, error } = await supabase.from("purchases").insert(purchaseData).select().single()
        if (error) throw error

        if (user.email !== "tm9034156@gmail.com") {
          await sendDiscordWebhook(WEBHOOKS.PURCHASE, {
            title: "🎫 Nova Compra - Estoque Infinito",
            color: 0x00aaff,
            fields: [
              { name: "Cliente", value: user.name, inline: true },
              { name: "Email", value: user.email, inline: true },
              { name: "Produto", value: product.name, inline: false },
              { name: "Valor", value: `R$ ${finalPrice.toFixed(2)}`, inline: true },
              { name: "ID Compra", value: purchase.id, inline: false },
              { name: "Instrução", value: "Cliente deve abrir ticket no Discord", inline: false },
            ],
          })

          await sendDiscordWebhook(WEBHOOKS.GENERAL, {
            title: "🎫 Compra Estoque Infinito",
            description: `${user.name} comprou ${product.name} - Abrir ticket no Discord`,
            color: 0x00aaff,
            timestamp: new Date().toISOString(),
          })
        }

        addNotification({
          type: "info",
          message: "Compra registrada! Acesse nosso Discord e abra um ticket para receber seu produto.",
        })
        setPurchaseComplete(true)
        setLoading(false)
        return
      }

      // Criar compra
      const purchaseData = {
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
        product_photo: product.photo_url,
        amount_paid: finalPrice,
        payment_method: paymentMethod,
        coupon_used: couponCode || null,
        status: paymentMethod === "simulacao" ? "approved" : "pending",
      }

      const { data: purchase, error } = await supabase.from("purchases").insert(purchaseData).select().single()

      if (error) throw error

      // Se for simulação, entregar produto automaticamente
      if (paymentMethod === "simulacao") {
        const { data: key } = await supabase
          .from("product_keys")
          .select("*")
          .eq("product_id", product.id)
          .eq("is_used", false)
          .limit(1)
          .single()

        if (key) {
          await supabase
            .from("product_keys")
            .update({ is_used: true, used_by: user.id, used_at: new Date().toISOString() })
            .eq("id", key.id)

          await supabase
            .from("purchases")
            .update({ product_key: key.key_value, status: "approved" })
            .eq("id", purchase.id)

          const { data: currentProduct } = await supabase.from("products").select("stock").eq("id", product.id).single()

          if (currentProduct && typeof currentProduct.stock === "number" && currentProduct.stock > 0) {
            await supabase
              .from("products")
              .update({ stock: currentProduct.stock - 1 })
              .eq("id", product.id)
          }
        }

        // Webhook de compra (não enviar se for admin)
        if (user.email !== "tm9034156@gmail.com") {
          await sendDiscordWebhook(WEBHOOKS.PURCHASE, {
            title: "🛒 Nova Compra - Simulação",
            color: 0x00ff00,
            fields: [
              { name: "Cliente", value: user.name, inline: true },
              { name: "Email", value: user.email, inline: true },
              { name: "Produto", value: product.name, inline: false },
              { name: "Valor", value: `R$ ${finalPrice.toFixed(2)}`, inline: true },
              { name: "Cupom", value: couponCode || "Nenhum", inline: true },
              { name: "ID Compra", value: purchase.id, inline: false },
              { name: "Método", value: "Simulação", inline: true },
              { name: "Status", value: "Aprovado", inline: true },
            ],
          })

          await sendDiscordWebhook(WEBHOOKS.GENERAL, {
            title: "💰 Compra Realizada",
            description: `${user.name} comprou ${product.name} por R$ ${finalPrice.toFixed(2)}`,
            color: 0x00ff00,
            timestamp: new Date().toISOString(),
          })
        }

        addNotification({ type: "success", message: "Compra realizada com sucesso! Verifique suas compras." })
        setPurchaseComplete(true)
      } else {
        // Para métodos confiável e IMP, criar compra pendente
        if (user.email !== "tm9034156@gmail.com") {
          await sendDiscordWebhook(WEBHOOKS.PURCHASE, {
            title: "⏳ Nova Compra Pendente",
            color: 0xffaa00,
            fields: [
              { name: "Cliente", value: user.name, inline: true },
              { name: "Email", value: user.email, inline: true },
              { name: "Produto", value: product.name, inline: false },
              { name: "Valor", value: `R$ ${finalPrice.toFixed(2)}`, inline: true },
              { name: "Cupom", value: couponCode || "Nenhum", inline: true },
              { name: "ID Compra", value: purchase.id, inline: false },
              { name: "Método", value: paymentMethod === "confiavel" ? "Confiável" : "IMP", inline: true },
              { name: "Status", value: "Pendente", inline: true },
            ],
          })

          await sendDiscordWebhook(WEBHOOKS.GENERAL, {
            title: "🔄 Compra Pendente",
            description: `${user.name} iniciou compra de ${product.name}`,
            color: 0xffaa00,
            timestamp: new Date().toISOString(),
          })
        }

        addNotification({
          type: "info",
          message:
            "Pagamento confirmado! Sua compra está pendente de aprovação. Entre em contato pelo Discord para atendimento.",
        })
        setPurchaseComplete(true)
      }
    } catch (error) {
      console.error("[v0] Purchase error:", error)
      addNotification({ type: "error", message: "Erro ao processar compra. Tente novamente." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Finalizar Compra</DialogTitle>
        </DialogHeader>

        {purchaseComplete ? (
          <div className="text-center py-6 sm:py-8 space-y-3 sm:space-y-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">Compra Realizada!</h3>
            <p className="text-sm sm:text-base text-muted-foreground px-4">
              {isInfiniteStock
                ? "Acesse nosso Discord e abra um ticket para receber seu produto."
                : paymentMethod === "simulacao"
                  ? "Seu produto já está disponível em 'Minhas Compras'"
                  : "Aguarde a aprovação do pagamento. Entre no Discord para suporte."}
            </p>
            {isInfiniteStock && (
              <a
                href="https://discord.gg/PtAw6gDg8k"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block"
              >
                <Button>Acessar Discord</Button>
              </a>
            )}
            {!isInfiniteStock && <Button onClick={() => onOpenChange(false)}>Fechar</Button>}
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <img
                    src={product.photo_url || "/placeholder.svg"}
                    alt={product.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{product.name}</h3>
                    <p className="text-xl sm:text-2xl font-bold text-primary">R$ {finalPrice.toFixed(2)}</p>
                    {couponCode && <p className="text-xs sm:text-sm text-green-600">Cupom {couponCode} aplicado</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {paymentMethod === "confiavel" && pixKey && (
              <Card>
                <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <div className="text-center">
                    <h3 className="font-semibold text-sm sm:text-base mb-2">Pague via Pix</h3>
                    {qrCodeUrl && (
                      <img
                        src={qrCodeUrl || "/placeholder.svg"}
                        alt="QR Code"
                        className="w-36 h-36 sm:w-48 sm:h-48 mx-auto border rounded-lg"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-medium">Chave Pix:</p>
                    <div className="flex gap-2">
                      <code className="flex-1 p-2 sm:p-3 bg-muted rounded-lg text-xs sm:text-sm break-all">
                        {pixKey}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 sm:h-10 sm:w-10 bg-transparent"
                        onClick={handleCopyPixKey}
                      >
                        {copied ? (
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2.5 sm:p-3">
                    <p className="text-xs sm:text-sm text-yellow-700 font-medium">
                      ⚠️ ATENÇÃO: Não tente roubar! Todas as transações são verificadas. Após o pagamento, confirme
                      abaixo.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {paymentMethod === "imp" && (
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    A verificação automática de pagamento via IMP será processada após confirmação.
                  </p>
                </CardContent>
              </Card>
            )}

            {paymentMethod === "simulacao" && (
              <Card>
                <CardContent className="p-3 sm:p-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-2.5 sm:p-3">
                    <p className="text-xs sm:text-sm text-blue-700 font-medium">
                      ℹ️ Modo Simulação: O produto será entregue imediatamente após a confirmação.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button onClick={handleConfirmPayment} disabled={loading} size="lg" className="w-full text-sm sm:text-base">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {loading ? "Processando..." : "Confirmar Pagamento"}
            </Button>

            {paymentMethod !== "simulacao" && (
              <p className="text-xs text-center text-muted-foreground px-2">
                Após confirmar, entre no Discord (link no topo da loja) para criar um ticket de atendimento
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
