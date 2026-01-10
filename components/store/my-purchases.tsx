"use client"

import { useEffect, useState } from "react"
import { Package, Copy, Check, ExternalLink } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useUserStore } from "@/lib/stores/user-store"
import { useNotificationStore } from "@/lib/stores/notification-store"

interface Purchase {
  id: string
  product_name: string
  product_photo: string
  amount_paid: number
  payment_method: string
  coupon_used?: string
  product_key?: string
  status: string
  created_at: string
}

export function MyPurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const { user } = useUserStore()
  const { addNotification } = useNotificationStore()

  const loadPurchases = async () => {
    if (!user) return

    const supabase = createClient()
    const { data } = await supabase
      .from("purchases")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (data) setPurchases(data)
  }

  useEffect(() => {
    loadPurchases()
  }, [user])

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    addNotification({ type: "success", message: "Chave copiada!" })
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      {purchases.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Você ainda não fez nenhuma compra</p>
        </div>
      ) : (
        purchases.map((purchase) => (
          <Card key={purchase.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <img
                  src={purchase.product_photo || "/placeholder.svg"}
                  alt={purchase.product_name}
                  className="w-full sm:w-32 h-32 object-cover rounded-lg"
                />
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-lg">{purchase.product_name}</h3>
                      <p className="text-sm text-muted-foreground font-mono">ID: {purchase.id}</p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${
                        purchase.status === "approved"
                          ? "bg-green-500/20 text-green-700"
                          : purchase.status === "rejected"
                            ? "bg-red-500/20 text-red-700"
                            : "bg-yellow-500/20 text-yellow-700"
                      }`}
                    >
                      {purchase.status === "approved"
                        ? "✓ Aprovada"
                        : purchase.status === "rejected"
                          ? "✗ Rejeitada"
                          : "⏳ Pendente"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm bg-muted/50 p-3 rounded-lg">
                    <div>
                      <p className="text-muted-foreground text-xs">Valor Pago</p>
                      <p className="font-bold text-primary text-base">R$ {purchase.amount_paid.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Data da Compra</p>
                      <p className="font-semibold">
                        {new Date(purchase.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(purchase.created_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Método de Pagamento</p>
                      <p className="font-semibold capitalize">{purchase.payment_method}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Status</p>
                      <p className="font-semibold capitalize">{purchase.status}</p>
                    </div>
                    {purchase.coupon_used && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground text-xs">Cupom Utilizado</p>
                        <p className="font-bold text-green-600 text-base">{purchase.coupon_used}</p>
                      </div>
                    )}
                  </div>

                  {purchase.status === "approved" && purchase.product_key && (
                    <div className="space-y-2 pt-2 border-t">
                      {purchase.product_key.includes("ESTOQUE INFINITO") || purchase.product_key.includes("🎫") ? (
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
                          <p className="text-sm font-bold text-purple-900 flex items-center gap-2 mb-2">
                            <Package className="w-5 h-5" />
                            Produto de Estoque Infinito
                          </p>
                          <p className="text-sm text-purple-800 mb-3">
                            Para receber este produto, você precisa abrir um ticket no nosso Discord informando esta
                            compra.
                          </p>
                          <Button
                            className="w-full bg-[#5865F2] hover:bg-[#4752C4]"
                            onClick={() => window.open("https://discord.gg/PtAw6gDg8k", "_blank")}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Abrir Ticket no Discord
                          </Button>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm font-bold text-green-700 flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Sua Chave do Produto:
                          </p>
                          <div className="flex gap-2">
                            <code className="flex-1 p-3 bg-green-50 border-2 border-green-200 rounded-lg text-sm font-mono font-bold break-all">
                              {purchase.product_key}
                            </code>
                            <Button
                              variant="outline"
                              size="sm"
                              className="shrink-0 bg-transparent"
                              onClick={() => handleCopyKey(purchase.product_key!)}
                            >
                              {copiedKey === purchase.product_key ? (
                                <>
                                  <Check className="w-4 h-4 mr-1" />
                                  Copiado!
                                </>
                              ) : (
                                <>
                                  <Copy className="w-4 h-4 mr-1" />
                                  Copiar
                                </>
                              )}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {purchase.status === "pending" && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                      <p className="text-sm text-yellow-800 font-semibold flex items-center gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Aguardando aprovação do administrador
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Entre no Discord para falar com o suporte e agilizar sua compra.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full bg-transparent"
                        onClick={() => window.open("https://discord.gg/PtAw6gDg8k", "_blank")}
                      >
                        Abrir Discord
                      </Button>
                    </div>
                  )}

                  {purchase.status === "rejected" && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                      <p className="text-sm text-red-800 font-semibold">Compra rejeitada pelo administrador</p>
                      <p className="text-xs text-red-700 mt-1">Entre em contato no Discord para mais informações.</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
