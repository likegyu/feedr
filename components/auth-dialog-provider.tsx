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
    } catch (error) {
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카페24 로그인</DialogTitle>
            <DialogDescription>
              카페24 계정으로 로그인해 주세요.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              ref={inputRef}
              type="text"
              value={mallId}
              onChange={(e) => setMallId(e.target.value)}
              placeholder="카페24 ID를 입력해주세요"
              required
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)} type="button">
                취소
              </Button>
              <Button type="submit">
                로그인
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showError} onOpenChange={setShowError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>로그인 실패</DialogTitle>
            <DialogDescription>
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowError(false)}>확인</Button>
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