"use client"

import { createContext, useContext, useState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// 상수 추가


type AuthDialogContextType = {
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
}

const AuthDialogContext = createContext<AuthDialogContextType | undefined>(undefined)

export function AuthDialogProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mallId, setMallId] = useState("")
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState("인증에 실패했습니다. 다시 시도해주세요.");
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mallId) {
      setShowError(true)
      return
    }

    try {
      const response = await fetch(`/api/auth/cafe24/get-auth-url?mallId=${mallId}`);
      const data = await response.json();
      
      if (!response.ok) {
        setErrorMessage(data.error);
        setShowError(true);
        return;
      }
      
      window.location.assign(data.url);
    } catch (err: unknown) {
      console.error('Auth dialog error:', err);
      setErrorMessage("서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
      setShowError(true);
    }
  }

  return (
    <AuthDialogContext.Provider 
      value={{
        isOpen,
        onOpen: () => setIsOpen(true),
        onClose: () => setIsOpen(false)
      }}
    >
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] w-[95%] p-4 sm:p-6">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-lg sm:text-xl">카페24 로그인</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              카페24 계정으로 로그인해 주세요.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2 sm:mt-4">
            <Input
              ref={inputRef}
              type="text"
              value={mallId}
              onChange={(e) => setMallId(e.target.value)}
              placeholder="카페24 ID를 입력해주세요"
              className="h-9 sm:h-10 text-sm sm:text-base"
              required
            />
            <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-4 mt-2 sm:mt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)} 
                type="button"
                className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base"
              >
                취소
              </Button>
              <Button 
                type="submit"
                className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base"
              >
                로그인
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showError} onOpenChange={setShowError}>
        <DialogContent className="sm:max-w-[425px] w-[95%] p-4 sm:p-6">
          <DialogHeader className="space-y-2 sm:space-y-3">
            <DialogTitle className="text-lg sm:text-xl">로그인 실패</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2 sm:mt-4">
            <Button 
              onClick={() => setShowError(false)}
              className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {children}
    </AuthDialogContext.Provider>
  )
}

export const useAuthDialog = () => {
  const context = useContext(AuthDialogContext)
  if (!context) throw new Error("AuthDialog Provider가 필요합니다")
  return context
}