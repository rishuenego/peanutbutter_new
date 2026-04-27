"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { CartItem, Product, AppliedCoupon } from "./types"

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product, quantity: number, weight: string, texture: string) => void
  removeFromCart: (productId: number, weight: string, texture: string) => void
  updateQuantity: (productId: number, weight: string, texture: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
  appliedCoupon: AppliedCoupon | null
  applyCoupon: (coupon: AppliedCoupon) => void
  removeCoupon: () => void
  shippingConfig: {
    freeShippingThreshold: number
    shippingCharge: number
  }
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)
  const [shippingConfig, setShippingConfig] = useState({
    freeShippingThreshold: 499,
    shippingCharge: 49,
  })
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cart")
      if (saved) {
        try {
          setItems(JSON.parse(saved))
        } catch {
          // Invalid JSON
        }
      }
      const savedCoupon = localStorage.getItem("appliedCoupon")
      if (savedCoupon) {
        try {
          setAppliedCoupon(JSON.parse(savedCoupon))
        } catch {
          // Invalid JSON
        }
      }
      setIsInitialized(true)
    }
  }, [])

  // Fetch settings once on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings")
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.settings) {
            setShippingConfig({
              freeShippingThreshold: data.settings.freeShippingThreshold,
              shippingCharge: data.settings.shippingCharge,
            })
          }
        }
      } catch (error) {
        console.error("Failed to fetch shipping settings:", error)
      }
    }
    fetchSettings()
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(items))

      // Auto-remove coupon if subtotal falls below minimum
      if (appliedCoupon && appliedCoupon.minOrderAmount) {
        const currentSubtotal = items.reduce((total, item) => {
          const weightOptions = item.product.weightOptions as { size: string; salePrice: number }[]
          const selectedOption = Array.isArray(weightOptions)
            ? weightOptions.find((opt) => opt.size === item.selectedWeight)
            : null
          const price = selectedOption ? Number(selectedOption.salePrice) : Number(item.product.salePrice)
          return total + price * item.quantity
        }, 0)

        if (currentSubtotal < appliedCoupon.minOrderAmount) {
          setAppliedCoupon(null)
        }
      }
    }
  }, [items, appliedCoupon, isInitialized])

  // Save coupon to localStorage
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      if (appliedCoupon) {
        localStorage.setItem("appliedCoupon", JSON.stringify(appliedCoupon))
      } else {
        localStorage.removeItem("appliedCoupon")
      }
    }
  }, [appliedCoupon, isInitialized])

  const addToCart = (product: Product, quantity: number, weight: string, texture: string) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedWeight === weight &&
          item.selectedTexture === texture
      )

      if (existingIndex >= 0) {
        const newItems = [...prevItems]
        newItems[existingIndex].quantity += quantity
        return newItems
      }

      return [...prevItems, { product, quantity, selectedWeight: weight, selectedTexture: texture }]
    })
  }

  const removeFromCart = (productId: number, weight: string, texture: string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedWeight === weight &&
            item.selectedTexture === texture
          )
      )
    )
  }

  const updateQuantity = (productId: number, weight: string, texture: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, weight, texture)
      return
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId &&
        item.selectedWeight === weight &&
        item.selectedTexture === texture
          ? { ...item, quantity }
          : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
    setAppliedCoupon(null)
  }

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const weightOptions = item.product.weightOptions as { size: string; salePrice: number }[]
      const selectedOption = Array.isArray(weightOptions)
        ? weightOptions.find((opt) => opt.size === item.selectedWeight)
        : null

      const price = selectedOption ? Number(selectedOption.salePrice) : Number(item.product.salePrice)
      return total + price * item.quantity
    }, 0)
  }

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  const applyCoupon = (coupon: AppliedCoupon) => {
    setAppliedCoupon(coupon)
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        shippingConfig,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
