"use client"

import { useState } from "react"
import { ShoppingCart, Tag } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/lib/supabase/client"
import { useUserStore } from "@/lib/stores/user-store"
import { useNotificationStore } from "@/lib/stores/notification-store"
import { CheckoutModal } from "@/components/store/checkout-modal"

interface Product {
  id: string
  category_id: string
  name: string
  description: string
  price: number
  photo_url: string
  stock: number
}

interface ProductModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductModal({ product, open, onOpenChange }: ProductModalProps) {
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const { user } = useUserStore()
  const { addNotification } = useNotificationStore()

  if (!product) return null

  const finalPrice = appliedCoupon ? product.price * (1 - appliedCoupon.discount / 100) : product.price

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      addNotification({ type: "error", message: "Digite um cupom" })
      return
    }

    const supabase = createClient()
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode.toUpperCase())
      .eq("is_active", true)
      .single()

    if (coupon) {
      setAppliedCoupon({ code: coupon.code, discount: coupon.discount_percent })
      addNotification({ type: "success", message: `Cupom de ${coupon.discount_percent}% aplicado!` })
    } else {
      addNotification({ type: "error", message: "Cupom inválido" })
    }
  }

  const handleBuy = () => {
    if (product.stock === 0) {
      addNotification({ type: "error", message: "Produto sem estoque" })
      return
    }
    setShowCheckout(true)
  }

  return (
    <>
      <Dialog open={open && !showCheckout} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Detalhes do Produto</DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4">
              <img
                src={product.photo_url || "/placeholder.svg"}
                alt={product.name}
                className="w-full aspect-square max-h-[250px] sm:max-h-[350px] md:max-h-none object-cover rounded-lg"
              />
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">{product.name}</h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">{product.description}</p>
              </div>

              <Separator />

              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Estoque disponível</p>
                <p className="text-base sm:text-lg font-semibold">{product.stock} unidades</p>
              </div>

              <Separator />

              <div className="space-y-2 sm:space-y-3">
                <Label htmlFor="coupon" className="text-sm">
                  Cupom de Desconto (Opcional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="CUPOM"
                    className="text-sm"
                    disabled={!!appliedCoupon}
                  />
                  <Button
                    onClick={handleApplyCoupon}
                    disabled={!!appliedCoupon}
                    size="sm"
                    className="text-xs sm:text-sm"
                  >
                    <Tag className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Aplicar</span>
                    <span className="sm:hidden">OK</span>
                  </Button>
                </div>
                {appliedCoupon && (
                  <div className="flex items-center justify-between p-2 sm:p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <span className="text-xs sm:text-sm text-green-700 font-medium">
                      Cupom {appliedCoupon.code} ({appliedCoupon.discount}% OFF)
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => {
                        setAppliedCoupon(null)
                        setCouponCode("")
                      }}
                    >
                      Remover
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                {appliedCoupon && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Preço original:</span>
                    <span className="line-through">R$ {product.price.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-semibold">Total:</span>
                  <span className="text-2xl sm:text-3xl font-bold text-primary">R$ {finalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleBuy}
                size="lg"
                className="w-full text-sm sm:text-base"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                {product.stock === 0 ? "Sem Estoque" : "Comprar Agora"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CheckoutModal
        open={showCheckout}
        onOpenChange={setShowCheckout}
        product={product}
        finalPrice={finalPrice}
        couponCode={appliedCoupon?.code}
      />
    </>
  )
}
