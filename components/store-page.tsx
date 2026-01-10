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
  stock: number | string
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

      <div className="relative z-10 border-b bg-card shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          {/* Título e descrição centralizados e fixos */}
          <div className="text-center mb-3 sm:mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary">
              {settings?.site_name || "Minha Loja"}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
              {settings?.site_description || "A melhor loja online"}
            </p>
          </div>

          {/* Barra de ações do usuário */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {user?.photo_url ? (
                <img
                  src={user.photo_url || "/placeholder.svg"}
                  alt={user.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-xs sm:text-sm font-medium leading-tight">{user?.name}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 sm:h-9 bg-transparent"
                onClick={() => setShowPurchases(true)}
              >
                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline ml-1 text-xs">Compras</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 sm:h-9 bg-transparent"
                onClick={() => setShowSettings(true)}
              >
                <SettingsIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
              {onBack && (
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:flex h-8 sm:h-9 text-xs bg-transparent"
                  onClick={onBack}
                >
                  Admin
                </Button>
              )}
              <Button variant="outline" size="sm" className="h-8 sm:h-9 bg-transparent" onClick={logout}>
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Discord Banner */}
      <div className="relative z-10 bg-gradient-to-r from-[#5865F2] to-[#7289DA] text-white">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              <div className="text-center sm:text-left">
                <p className="font-semibold text-sm sm:text-base">Junte-se ao nosso Discord!</p>
                <p className="text-xs opacity-90 hidden sm:block">Suporte, novidades e comunidade</p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => window.open("https://discord.gg/PtAw6gDg8k", "_blank")}
              className="bg-white text-[#5865F2] hover:bg-white/90 text-xs sm:text-sm h-8"
            >
              Entrar no Discord
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-[5] container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-4 sm:space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-9 sm:h-10">
            <TabsTrigger value="todos" className="text-xs sm:text-sm">
              Todos
            </TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className="text-xs sm:text-sm whitespace-nowrap">
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="todos" className="space-y-6 sm:space-y-8">
            {productsByCategory.map(({ category, products: catProducts }) => (
              <div key={category.id}>
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{category.name}</h2>
                <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                  {catProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
                  ))}
                </div>
                {catProducts.length === 0 && (
                  <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm">
                    Nenhum produto nesta categoria
                  </p>
                )}
              </div>
            ))}
            {productsByCategory.length === 0 && (
              <p className="text-center text-muted-foreground py-8 sm:py-12">Nenhuma categoria criada ainda</p>
            )}
          </TabsContent>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
        <DialogContent className="max-w-[95vw] sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">📦 Minhas Compras</DialogTitle>
          </DialogHeader>
          <MyPurchases />
        </DialogContent>
      </Dialog>

      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurações</DialogTitle>
          </DialogHeader>
          <UserSettings />
        </DialogContent>
      </Dialog>
    </div>
  )
}
