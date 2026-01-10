"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Store, Settings, Package, ShoppingCart, Users, Tag, FileText } from "lucide-react"
import { AdminCategories } from "@/components/admin/admin-categories"
import { AdminProducts } from "@/components/admin/admin-products"
import { AdminCoupons } from "@/components/admin/admin-coupons"
import { AdminSupport } from "@/components/admin/admin-support"
import { AdminPurchases } from "@/components/admin/admin-purchases"
import { AdminSettings } from "@/components/admin/admin-settings"
import { AdminTerms } from "@/components/admin/admin-terms"
import { useUserStore } from "@/lib/stores/user-store"

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState("categories")
  const [showStore, setShowStore] = useState(false)
  const { logout } = useUserStore()

  if (showStore) {
    const { StorePage } = require("@/components/store-page")
    return <StorePage onBack={() => setShowStore(false)} />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Painel Administrativo</h1>
              <p className="text-sm text-muted-foreground">Gerencie sua loja</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowStore(true)}>
              Ver Loja
            </Button>
            <Button variant="outline" onClick={logout}>
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="categories">
              <Tag className="w-4 h-4 mr-2" />
              Categorias
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="w-4 h-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="coupons">
              <Tag className="w-4 h-4 mr-2" />
              Cupons
            </TabsTrigger>
            <TabsTrigger value="support">
              <Users className="w-4 h-4 mr-2" />
              Atendentes
            </TabsTrigger>
            <TabsTrigger value="purchases">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Compras
            </TabsTrigger>
            <TabsTrigger value="terms">
              <FileText className="w-4 h-4 mr-2" />
              Termos
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories">
            <AdminCategories />
          </TabsContent>
          <TabsContent value="products">
            <AdminProducts />
          </TabsContent>
          <TabsContent value="coupons">
            <AdminCoupons />
          </TabsContent>
          <TabsContent value="support">
            <AdminSupport />
          </TabsContent>
          <TabsContent value="purchases">
            <AdminPurchases />
          </TabsContent>
          <TabsContent value="terms">
            <AdminTerms />
          </TabsContent>
          <TabsContent value="settings">
            <AdminSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
