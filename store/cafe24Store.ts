import { create } from 'zustand'

interface Cafe24State {
  cafe24ShopName: string
  expiresAt: string
  remainingTime: string
  isLoading: boolean
  isRefreshing: boolean
  initialized: boolean
  setShopName: (name: string) => void
  setExpiresAt: (time: string) => void
  setRemainingTime: (time: string) => void
  setIsLoading: (loading: boolean) => void
  setIsRefreshing: (refreshing: boolean) => void
  setInitialized: (init: boolean) => void
}

export const useCafe24Store = create<Cafe24State>((set) => ({
  cafe24ShopName: '',
  expiresAt: '',
  remainingTime: '',
  isLoading: true,
  isRefreshing: false,
  initialized: false,
  setShopName: (name) => set({ cafe24ShopName: name }),
  setExpiresAt: (time) => set({ expiresAt: time }),
  setRemainingTime: (time) => set({ remainingTime: time }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setIsRefreshing: (refreshing) => set({ isRefreshing: refreshing }),
  setInitialized: (init) => set({ initialized: init }),
}))
