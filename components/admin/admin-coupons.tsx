"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useNotificationStore } from "@/lib/stores/notification-store"
import { ConfirmationDialog } from "@/components/confirmation-dialog"

interface Coupon {
  id: string
  code: string
  discount_percent: number
  is_active: boolean
}

export function AdminCoupons() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [code, setCode] = useState("")
  const [discount, setDiscount] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { addNotification } = useNotificationStore()

  const loadCoupons = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false })
    if (data) setCoupons(data)
  }

  useEffect(() => {
    loadCoupons()
  }, [])

  const handleSubmit = async () => {
    if (!code.trim() || !discount) {
      addNotification({ type: "error", message: "Preencha todos os campos" })
      return
    }

    const discountNum = Number.parseInt(discount)
    if (discountNum < 1 || discountNum > 100) {
      addNotification({ type: "error", message: "Desconto deve ser entre 1% e 100%" })
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      if (editingId) {
        await supabase
          .from("coupons")
          .update({ code: code.toUpperCase(), discount_percent: discountNum })
          .eq("id", editingId)
        addNotification({ type: "success", message: "Cupom atualizado!" })
      } else {
        await supabase.from("coupons").insert({ code: code.toUpperCase(), discount_percent: discountNum })
        addNotification({ type: "success", message: "Cupom criado!" })
      }

      setCode("")
      setDiscount("")
      setEditingId(null)
      await loadCoupons()
    } catch (error) {
      addNotification({ type: "error", message: "Erro ao salvar cupom" })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingId(coupon.id)
    setCode(coupon.code)
    setDiscount(coupon.discount_percent.toString())
  }

  const handleDelete = async () => {
    if (!deleteId) return

    const supabase = createClient()
    try {
      await supabase.from("coupons").delete().eq("id", deleteId)
      addNotification({ type: "success", message: "Cupom deletado!" })
      await loadCoupons()
    } catch (error) {
      addNotification({ type: "error", message: "Erro ao deletar cupom" })
    }
    setDeleteId(null)
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const supabase = createClient()
    await supabase.from("coupons").update({ is_active: !currentStatus }).eq("id", id)
    await loadCoupons()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Editar Cupom" : "Criar Novo Cupom"}</CardTitle>
          <CardDescription>Crie cupons de desconto para seus clientes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código do Cupom</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="DESCONTO50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Desconto (%)</Label>
              <Input
                id="discount"
                type="number"
                min="1"
                max="100"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                placeholder="50"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              {editingId ? "Atualizar" : "Criar"}
            </Button>
            {editingId && (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null)
                  setCode("")
                  setDiscount("")
                }}
              >
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cupons Criados</CardTitle>
          <CardDescription>Total: {coupons.length} cupons</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {coupons.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhum cupom criado ainda</p>
            ) : (
              coupons.map((coupon) => (
                <div key={coupon.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold text-lg">{coupon.code}</h3>
                      <p className="text-sm text-muted-foreground">{coupon.discount_percent}% de desconto</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        coupon.is_active ? "bg-green-500/20 text-green-700" : "bg-gray-500/20 text-gray-700"
                      }`}
                    >
                      {coupon.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleActive(coupon.id, coupon.is_active)}>
                      {coupon.is_active ? "Desativar" : "Ativar"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(coupon)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteId(coupon.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Deletar Cupom"
        description="Tem certeza que deseja deletar este cupom?"
        onConfirm={handleDelete}
      />
    </div>
  )
}
