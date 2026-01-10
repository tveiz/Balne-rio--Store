"use client"

import { ShoppingCart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Product {
  id: string
  name: string
  description: string
  price: number
  photo_url: string
  stock: number | string
}

interface ProductCardProps {
  product: Product
  onSelect: (product: Product) => void
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
  const isOutOfStock = typeof product.stock === "number" && product.stock === 0
  const isInfinite = product.stock === "inf" || product.stock === "INF"

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => !isOutOfStock && onSelect(product)}
    >
      <div className="aspect-square max-h-[120px] sm:max-h-[140px] overflow-hidden relative">
        <img
          src={product.photo_url || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-contain hover:scale-105 transition-transform"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="text-white font-bold text-lg sm:text-xl">ESGOTADO</span>
          </div>
        )}
      </div>
      <CardContent className="p-2 sm:p-3 space-y-1">
        <h3 className="font-semibold text-xs sm:text-sm line-clamp-1">{product.name}</h3>
        <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1 min-h-[1rem]">{product.description}</p>
        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-sm sm:text-base font-bold text-primary">R$ {product.price.toFixed(2)}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Est: {isInfinite ? "∞" : product.stock}</p>
          </div>
          <Button
            size="sm"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation()
              if (!isOutOfStock) onSelect(product)
            }}
          >
            <ShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
