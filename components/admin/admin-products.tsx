"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { useNotificationStore } from "@/lib/stores/notification-store"
import { ImageUpload } from "@/components/image-upload"
import { ConfirmationDialog } from "@/components/confirmation-dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Product {
  id: string
  category_id: string
  name: string
  description: string
  price: number
  photo_url: string
  stock: number
}

interface Category {
  id: string
  name: string
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryId, setCategoryId] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [stockKeys, setStockKeys] = useState<string[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { addNotification } = useNotificationStore()

  const loadData = async () => {
    const supabase = createClient()
    const { data: cats } = await supabase.from("categories").select("*").order("order_index")
    const { data: prods } = await supabase.from("products").select("*").order("created_at")
    if (cats) setCategories(cats)
    if (prods) setProducts(prods)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSubmit = async () => {
    if (!categoryId || !name || !description || !price || !photoUrl) {
      addNotification({ type: "error", message: "Preencha todos os campos" })
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      if (editingId) {
        await supabase
          .from("products")
          .update({
            category_id: categoryId,
            name,
            description,
            price: Number.parseFloat(price),
            photo_url: photoUrl,
            stock: stockKeys.length,
          })
          .eq("id", editingId)

        // Deletar chaves antigas e adicionar novas
        await supabase.from("product_keys").delete().eq("product_id", editingId)
        if (stockKeys.length > 0) {
          await supabase.from("product_keys").insert(
            stockKeys.map((key) => ({
              product_id: editingId,
              key_value: key,
            })),
          )
        }

        addNotification({ type: "success", message: "Produto atualizado!" })
      } else {
        const { data: newProduct } = await supabase
          .from("products")
          .insert({
            category_id: categoryId,
            name,
            description,
            price: Number.parseFloat(price),
            photo_url: photoUrl,
            stock: stockKeys.length,
          })
          .select()
          .single()

        if (newProduct && stockKeys.length > 0) {
          await supabase.from("product_keys").insert(
            stockKeys.map((key) => ({
              product_id: newProduct.id,
              key_value: key,
            })),
          )
        }

        addNotification({ type: "success", message: "Produto criado!" })
      }

      resetForm()
      await loadData()
    } catch (error) {
      addNotification({ type: "error", message: "Erro ao salvar produto" })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setCategoryId("")
    setName("")
    setDescription("")
    setPrice("")
    setPhotoUrl("")
    setStockKeys([])
    setEditingId(null)
  }

  const handleEdit = async (product: Product) => {
    setEditingId(product.id)
    setCategoryId(product.category_id)
    setName(product.name)
    setDescription(product.description)
    setPrice(product.price.toString())
    setPhotoUrl(product.photo_url)

    // Carregar chaves
    const supabase = createClient()
    const { data: keys } = await supabase
      .from("product_keys")
      .select("key_value")
      .eq("product_id", product.id)
      .eq("is_used", false)

    if (keys) {
      setStockKeys(keys.map((k) => k.key_value))
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    const supabase = createClient()
    try {
      await supabase.from("products").delete().eq("id", deleteId)
      addNotification({ type: "success", message: "Produto deletado!" })
      await loadData()
    } catch (error) {
      addNotification({ type: "error", message: "Erro ao deletar produto" })
    }
    setDeleteId(null)
  }

  const handleAddKey = () => {
    if (stockKeys.length >= 1000) {
      addNotification({ type: "error", message: "Máximo de 1000 chaves" })
      return
    }
    setStockKeys([...stockKeys, ""])
  }

  const handleUpdateKey = (index: number, value: string) => {
    const newKeys = [...stockKeys]
    newKeys[index] = value
    setStockKeys(newKeys)
  }

  const handleRemoveKey = (index: number) => {
    setStockKeys(stockKeys.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Editar Produto" : "Criar Novo Produto"}</CardTitle>
          <CardDescription>Adicione produtos para vender em sua loja</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Nome do Produto</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Minecraft Premium" />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva seu produto"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Preço (R$)</Label>
            <Input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="29.90"
            />
          </div>

          <ImageUpload value={photoUrl} onChange={setPhotoUrl} label="Foto do Produto" />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Estoque ({stockKeys.length}/1000)</Label>
              <Button type="button" size="sm" onClick={handleAddKey} disabled={stockKeys.length >= 1000}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Chave
              </Button>
            </div>

            <ScrollArea className="h-64 border rounded-lg p-4">
              <div className="space-y-2">
                {stockKeys.map((key, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={key}
                      onChange={(e) => handleUpdateKey(index, e.target.value)}
                      placeholder={`Chave ${index + 1}`}
                    />
                    <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveKey(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {stockKeys.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhuma chave adicionada</p>
                )}
              </div>
            </ScrollArea>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={loading}>
              {editingId ? "Atualizar" : "Criar"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Produtos Criados</CardTitle>
          <CardDescription>Total: {products.length} produtos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {products.length === 0 ? (
              <p className="col-span-full text-center text-muted-foreground py-8">Nenhum produto criado ainda</p>
            ) : (
              products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4 space-y-3">
                    <img
                      src={product.photo_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                      <p className="text-lg font-bold text-primary mt-2">R$ {product.price.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Estoque: {product.stock}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)} className="flex-1">
                        <Edit2 className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setDeleteId(product.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Deletar Produto"
        description="Tem certeza que deseja deletar este produto?"
        onConfirm={handleDelete}
      />
    </div>
  )
}
