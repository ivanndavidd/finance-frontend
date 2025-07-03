"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown} from "lucide-react"
import { api } from "@/lib/api"
import { format } from "date-fns"

interface QuickStatsProps {
  refreshTrigger: number
}

export function QuickStats({ refreshTrigger }: QuickStatsProps) {
  const [stats, setStats] = useState({
    incomeCount: 0,
    expenseCount: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadStats()
  }, [refreshTrigger])

  const loadStats = async () => {
    setIsLoading(true)
    try {
      const currentDay = format(new Date(), "yyyy-MM-dd")
      const recap = await api.getDailyReport(currentDay)
      const incomeTransactions = recap.transactions.filter((t) => t.type === "income")
      const expenseTransactions = recap.transactions.filter((t) => t.type === "expense")
      setStats({
        incomeCount: incomeTransactions.length,
        expenseCount: expenseTransactions.length
      })
      console.log("Quick stats loaded:", recap)
    } catch (error) {
      console.error("Error loading quick stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3 mb-6">
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="space-y-3 mb-6">
      {/* Total Income Transactions Count */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Total Transaksi Pemasukan</span>
        </div>
        <span className="text-sm font-bold text-green-600">{stats.incomeCount}</span>
      </div>

      {/* Total Expense Transactions Count */}
      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg">
        <div className="flex items-center space-x-2">
          <TrendingDown className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium text-red-800">Total Transaksi Pengeluaran</span>
        </div>
        <span className="text-sm font-bold text-red-600">{stats.expenseCount}</span>
      </div>
    </div>
  )
}
