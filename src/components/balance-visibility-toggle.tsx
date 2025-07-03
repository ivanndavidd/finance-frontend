"use client"

import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BalanceVisibilityToggleProps {
  isVisible: boolean
  onToggle: () => void
}

export function BalanceVisibilityToggle({ isVisible, onToggle }: BalanceVisibilityToggleProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700">Statistik Harian</h3>
        <p className="text-xs text-gray-500">Data transaksi hari ini</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="h-8 w-8 p-0 hover:bg-gray-100"
        title={isVisible ? "Sembunyikan saldo" : "Tampilkan saldo"}
      >
        {isVisible ? <Eye className="h-4 w-4 text-gray-600" /> : <EyeOff className="h-4 w-4 text-gray-600" />}
      </Button>
    </div>
  )
}
