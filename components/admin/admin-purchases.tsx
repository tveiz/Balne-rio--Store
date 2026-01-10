"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createClient } from "@/lib/supabase/client"
import { useNotificationStore } from "@/lib/stores/notification-store"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { sendDiscordWebhook, WEBHOOKS } from "@/lib/utils/webhook"

interface Purchase {
  id: string
  user_id: string
  product_name: string
  product_photo: string
  amount_paid: number
  payment_method: string
  coupon_used?: string
  status: string
  created_at: string
  users: {
    name: string
    email: string
  }
}

export function AdminPurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [pendingPurchases, setPendingPurchases] = useState<Purchase[]>([])
  const [actionPurchase, setActionPurchase] = useState<{ id: string; action: "approve" | "reject" } | null>(null)
  const { addNotification } = useNotificationStore()

  const loadPurchases = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("purchases")
      .select("*, users(name, email)")
      .order("created_at", { ascending: false })

    if (data) {
      setPurchases(data as any)
      setPendingPurchases(data.filter((p) => p.status === "pending") as any)
    }
  }

  useEffect(() => {
    loadPurchases()
  }, [])

  const handleAction = async () => {
    if (!actionPurchase) return

    const supabase = createClient()
    const { id, action } = actionPurchase

    try {
      const purchase = purchases.find((p) => p.id === id)
      if (!purchase) return

      if (action === "approve") {
        // Buscar uma chave disponível
        const { data: key } = await supabase
          .from("product_keys")
          .select("*")
          .eq("product_id", purchase.product_name) // Note: Precisaria do product_id real
          .eq("is_used", false)
          .limit(1)
          .single()

        if (key) {
          // Marcar chave como usada
          await supabase
            .from("product_keys")
            .update({ is_used: true, used_by: purchase.user_id, used_at: new Date().toISOString() })
            .eq("id", key.id)

          // Atualizar compra
          await supabase.from("purchases").update({ status: "approved", product_key: key.key_value }).eq("id", id)

          // Enviar webhook
          await sendDiscordWebhook(WEBHOOKS.PURCHASE, {
            title: "✅ Compra Aprovada",
            color: 0x00ff00,
            fields: [
              { name: "Cliente", value: purchase.users.name, inline: true },
              { name: "Email", value: purchase.users.email, inline: true },
              { name: "Produto", value: purchase.product_name, inline: true },
              { name: "Valor", value: `R$ ${purchase.amount_paid.toFixed(2)}`, inline: true },
              { name: "ID Compra", value: id, inline: true },
              { name: "Chave Entregue", value: "✓ (Oculta)", inline: true },
            ],
          })

          addNotification({ type: "success", message: "Compra aprovada!" })
        } else {
          addNotification({ type: "error", message: "Sem estoque disponível" })
        }
      } else {
        await supabase.from("purchases").update({ status: "rejected" }).eq("id", id)
        addNotification({ type: "success", message: "Compra rejeitada" })
      }

      await loadPurchases()
    } catch (error) {
      addNotification({ type: "error", message: "Erro ao processar compra" })
    }

    setActionPurchase(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compras Pendentes</CardTitle>
          <CardDescription>Total: {pendingPurchases.length} compras aguardando aprovação</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-4">
              {pendingPurchases.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma compra pendente</p>
              ) : (
                pendingPurchases.map((purchase) => (
                  <Card key={purchase.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={purchase.product_photo || "/placeholder.svg"}
                          alt={purchase.product_name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="font-semibold">{purchase.product_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Cliente: {purchase.users.name} ({purchase.users.email})
                            </p>
                            <p className="text-sm text-muted-foreground">ID: {purchase.id.slice(0, 8)}...</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-lg font-bold text-primary">R$ {purchase.amount_paid.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(purchase.created_at).toLocaleString("pt-BR")}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => setActionPurchase({ id: purchase.id, action: "approve" })}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Aprovar
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setActionPurchase({ id: purchase.id, action: "reject" })}
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Rejeitar
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Compras</CardTitle>
          <CardDescription>Total: {purchases.length} compras</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {purchases.map((purchase) => (
                <div key={purchase.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <img
                      src={purchase.product_photo || "/placeholder.svg"}
                      alt={purchase.product_name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold text-sm">{purchase.product_name}</h3>
                      <p className="text-xs text-muted-foreground">{purchase.users.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">R$ {purchase.amount_paid.toFixed(2)}</p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        purchase.status === "approved"
                          ? "bg-green-500/20 text-green-700"
                          : purchase.status === "rejected"
                            ? "bg-red-500/20 text-red-700"
                            : "bg-yellow-500/20 text-yellow-700"
                      }`}
                    >
                      {purchase.status === "approved"
                        ? "Aprovada"
                        : purchase.status === "rejected"
                          ? "Rejeitada"
                          : "Pendente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={!!actionPurchase}
        onOpenChange={(open) => !open && setActionPurchase(null)}
        title={actionPurchase?.action === "approve" ? "Aprovar Compra" : "Rejeitar Compra"}
        description={
          actionPurchase?.action === "approve"
            ? "Confirma a aprovação desta compra? A chave será entregue ao cliente."
            : "Confirma a rejeição desta compra?"
        }
        onConfirm={handleAction}
      />
    </div>
  )
}
