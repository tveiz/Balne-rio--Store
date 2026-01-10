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

interface Category {
  id: string
  name: string
  order_index: number
}

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { addNotification } = useNotificationStore()

  const loadCategories = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("categories").select("*").order("order_index", { ascending: true })
    if (data) setCategories(data)
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleSubmit = async () => {
    if (!name.trim()) {
      addNotification({ type: "error", message: "Digite um nome para a categoria" })
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      if (editingId) {
        await supabase.from("categories").update({ name }).eq("id", editingId)
        addNotification({ type: "success", message: "Categoria atualizada!" })
      } else {
        const orderIndex = categories.length
        await supabase.from("categories").insert({ name, order_index: orderIndex })
        addNotification({ type: "success", message: "Categoria criada!" })
      }

      setName("")
      setEditingId(null)
      await loadCategories()
    } catch (error) {
      addNotification({ type: "error", message: "Erro ao salvar categoria" })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setName(category.name)
  }

  const handleDelete = async () => {
    if (!deleteId) return

    const supabase = createClient()
    try {
      await supabase.from("categories").delete().eq("id", deleteId)
      addNotification({ type: "success", message: "Categoria deletada!" })
      await loadCategories()
    } catch (error) {
      addNotification({ type: "error", message: "Erro ao deletar categoria" })
    }
    setDeleteId(null)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Editar Categoria" : "Criar Nova Categoria"}</CardTitle>
          <CardDescription>Adicione categorias para organizar seus produtos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Nome da Categoria</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Jogos, Contas, Gift Cards"
            />
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
                  setName("")
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
          <CardTitle>Categorias Criadas</CardTitle>
          <CardDescription>Total: {categories.length} categorias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Nenhuma categoria criada ainda</p>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    <p className="text-sm text-muted-foreground">Ordem: {category.order_index + 1}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteId(category.id)}>
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
        title="Deletar Categoria"
        description="Tem certeza? Todos os produtos desta categoria também serão deletados."
        onConfirm={handleDelete}
      />
    </div>
  )
}
