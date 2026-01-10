import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  email: string
  name: string
  photo_url?: string
  hwid: string
}

interface UserStore {
  user: User | null
  isAdmin: boolean
  termsAccepted: boolean
  setUser: (user: User | null) => void
  setIsAdmin: (isAdmin: boolean) => void
  setTermsAccepted: (accepted: boolean) => void
  logout: () => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isAdmin: false,
      termsAccepted: false,
      setUser: (user) => set({ user }),
      setIsAdmin: (isAdmin) => set({ isAdmin }),
      setTermsAccepted: (accepted) => set({ termsAccepted: accepted }),
      logout: () => set({ user: null, isAdmin: false }),
    }),
    {
      name: "user-storage",
    },
  ),
)
