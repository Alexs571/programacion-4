import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ProductoRead } from '@/features/productos/types/producto'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  imagen_url: string | null
  stock: number // stock que había cuando se agregó (para no pasarse en las cantidades)
}

interface CartState {
  items: ItemCarrito[]
  agregar: (producto: ProductoRead, cantidad?: number) => void
  quitar: (productoId: number) => void
  cambiarCantidad: (productoId: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
  cantidadItems: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) => {
        const existente = get().items.find((i) => i.producto_id === producto.id)
        if (existente) {
          // si ya estaba, actualizo el stock conocido y sumo la cantidad (sin pasar el stock)
          set({ items: get().items.map((i) => (i.producto_id === producto.id ? { ...i, stock: producto.stock } : i)) })
          get().cambiarCantidad(producto.id, existente.cantidad + cantidad)
          return
        }
        const nuevo: ItemCarrito = {
          producto_id: producto.id,
          nombre: producto.nombre,
          precio_unitario: producto.precio_base,
          cantidad: Math.min(cantidad, producto.stock),
          imagen_url: producto.imagen_url,
          stock: producto.stock,
        }
        set({ items: [...get().items, nuevo] })
      },

      quitar: (productoId) => set({ items: get().items.filter((i) => i.producto_id !== productoId) }),

      cambiarCantidad: (productoId, cantidad) => {
        if (cantidad < 1) {
          get().quitar(productoId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.producto_id === productoId ? { ...i, cantidad: Math.min(cantidad, i.stock) } : i,
          ),
        })
      },

      vaciar: () => set({ items: [] }),

      total: () => get().items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0),

      cantidadItems: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    {
      name: 'foodstore-carrito',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
