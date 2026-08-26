"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  id: string; // unique key e.g. productId-variantId
  productId: string;
  variantId?: string;
  productName: string;
  variantName?: string;
  price: number;
  imageUrl: string;
  quantity: number;
  sku?: string;
}

export interface AppliedCoupon {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  discountAmount: number;
}

interface CartContextType {
  items: CartItem[];
  appliedCoupon: AppliedCoupon | null;
  addItem: (item: Omit<CartItem, "id">, openDrawerOnAdd?: boolean) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setCoupon: (coupon: AppliedCoupon | null) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  freeShippingThreshold: number;
  deliveryAreas: string[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "fatekit_cart_items";
const COUPON_STORAGE_KEY = "fatekit_cart_coupon";
const FREE_SHIPPING_MIN = 350;
const STANDARD_SHIPPING_FEE = 30;
const DEFAULT_CITIES = [
  "القدس",
  "رام الله والبيرة",
  "نابلس",
  "الخليل",
  "بيت لحم",
  "جنين",
  "طولكرم",
  "قلقيلية",
  "أريحا والأغوار",
  "سلفيت",
  "طوباس",
];

export function CartProvider({
  children,
  deliveryFee = STANDARD_SHIPPING_FEE,
  freeShippingMinimum = FREE_SHIPPING_MIN,
  deliveryAreas = DEFAULT_CITIES,
}: {
  children: React.ReactNode;
  deliveryFee?: number;
  freeShippingMinimum?: number;
  deliveryAreas?: string[];
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(CART_STORAGE_KEY);
      const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (savedItems) setItems(JSON.parse(savedItems));
      if (savedCoupon) setAppliedCoupon(JSON.parse(savedCoupon));
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      if (appliedCoupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items, appliedCoupon, isLoaded]);

  const addItem = (newItem: Omit<CartItem, "id">, openDrawerOnAdd: boolean = true) => {
    const id = `${newItem.productId}-${newItem.variantId || "base"}`;
    setItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += newItem.quantity;
        return updated;
      }
      return [...prev, { ...newItem, id }];
    });

    if (openDrawerOnAdd) {
      setIsDrawerOpen(true);
    }
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const setCoupon = (coupon: AppliedCoupon | null) => {
    setAppliedCoupon(coupon);
  };

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal === 0 ? 0 : subtotal >= freeShippingMinimum ? 0 : deliveryFee;

  let discount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.type === "PERCENTAGE") {
      discount = (subtotal * appliedCoupon.value) / 100;
    } else {
      discount = appliedCoupon.value;
    }
    discount = Math.min(discount, subtotal);
  }

  const total = Math.max(0, subtotal + shippingFee - discount);

  return (
    <CartContext.Provider
      value={{
        items,
        appliedCoupon,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        setCoupon,
        isDrawerOpen,
        setIsDrawerOpen,
        openDrawer,
        closeDrawer,
        subtotal,
        shippingFee,
        discount,
        total,
        freeShippingThreshold: freeShippingMinimum,
        deliveryAreas,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
