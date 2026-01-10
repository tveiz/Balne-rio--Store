"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, MessageCircle, SettingsIcon, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import { useUserStore } from "@/lib/stores/user-store"
import { ProductCard } from "@/components/store/product-card"
import { ProductModal } from "@/components/store/product-modal"
import { MyPurchases } from "@/components/store/my-purchases"
import { UserSettings } from "@/components/store/user-settings"
import { ThemeAnimations } from "@/components/theme-animations"

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
  order_index: number
}

interface SiteSettings {
  site_name: string
  site_description: string
  theme: string
}

interface StorePageProps {
  onBack?: () => void
}

export function StorePage({ onBack }: StorePageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("todos")
  const [showPurchases, setShowPurchases] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { user, logout } = useUserStore()

  const loadData = async () => {
    const supabase = createClient()
    const { data: cats } = await supabase.from("categories").select("*").order("order_index")
    const { data: prods } = await supabase.from("products").select("*").order("created_at")
    const { data: setts } = await supabase.from("site_settings").select("*").single()

    if (cats) setCategories(cats)
    if (prods) setProducts(prods)
    if (setts) setSettings(setts)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredProducts =
    selectedCategory === "todos" ? products : products.filter((p) => p.category_id === selectedCategory)

  const productsByCategory = categories.map((cat) => ({
    category: cat,
    products: products.filter((p) => p.category_id === cat.id),
  }))

  return (
    <div className="min-h-screen bg-background">
      {settings && <ThemeAnimations theme={settings.theme} />}

      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{settings?.site_name || "Minha Loja"}</h1>
                <p className="text-sm text-muted-foreground">{settings?.site_description || "A melhor loja online"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user?.photo_url ? (
                <img src={user.photo_url || "/placeholder.svg"} alt={user.name} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="outline" size="icon" onClick={() => setShowPurchases(true)}>
                <ShoppingCart className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setShowSettings(true)}>
                <SettingsIcon className="w-4 h-4" />
              </Button>
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  Voltar Admin
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={logout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Discord Banner */}
      <div className="bg-gradient-to-r from-[#5865F2] to-[#7289DA] text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6" />
              <div>
                <p className="font-semibold">Junte-se ao nosso Discord!</p>
                <p className="text-sm opacity-90">Suporte, novidades e comunidade</p>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={() => window.open("https://discord.gg/PtAw6gDg8k", "_blank")}
              className="bg-white text-[#5865F2] hover:bg-white/90"
            >
              Entrar no Discord
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            <TabsTrigger value="todos">Todos</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="todos" className="space-y-8">
            {productsByCategory.map(({ category, products: catProducts }) => (
              <div key={category.id}>
                <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {catProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
                  ))}
                </div>
                {catProducts.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhum produto nesta categoria</p>
                )}
              </div>
            ))}
            {productsByCategory.length === 0 && (
              <p className="text-center text-muted-foreground py-12">Nenhuma categoria criada ainda</p>
            )}
          </TabsContent>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {products
                  .filter((p) => p.category_id === category.id)
                  .map((product) => (
                    <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
                  ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Modals */}
      <ProductModal
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />

      <Dialog open={showPurchases} onOpenChange={setShowPurchases}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">📦 Minhas Compras</DialogTitle>
          </DialogHeader>
          <MyPurchases />
        </DialogContent>
      </Dialog>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
          </DialogHeader>
          <UserSettings />
        </DialogContent>
      </Dialog>
    </div>
  )
}
