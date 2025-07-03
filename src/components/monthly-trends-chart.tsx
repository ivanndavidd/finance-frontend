"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, parseISO } from "date-fns"
import { id } from "date-fns/locale"
import { api } from "@/lib/api"
import { formatCurrency, formatCurrencyCompactMini } from "@/lib/currency"
import type { MonthlyTrend } from "@/types"

interface MonthlyTrendsChartProps {
  refreshTrigger: number
  showBalance: boolean
}

export function MonthlyTrendsChart({ refreshTrigger, showBalance }: MonthlyTrendsChartProps) {
  const [trendsData, setTrendsData] = useState<MonthlyTrend[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentTotals, setCurrentTotals] = useState({
    totalIncome: 0,
    totalExpense: 0,
    totalBalance: 0,
  })
  const [selectedPeriod, setSelectedPeriod] = useState("6")

  useEffect(() => {
    loadTrendsData()
  }, [refreshTrigger, selectedPeriod])

  const loadTrendsData = async () => {
    setIsLoading(true)
    try {
      const months = selectedPeriod === "all" ? undefined : Number.parseInt(selectedPeriod)
      const data = await api.getMonthlyTrends(months)
      setTrendsData(data)

      // Calculate current totals (sum of all months)
      const totals = data.reduce(
        (acc, month) => ({
          totalIncome: acc.totalIncome + month.totalIncome,
          totalExpense: acc.totalExpense + month.totalExpense,
          totalBalance: acc.totalBalance + month.balance,
        }),
        { totalIncome: 0, totalExpense: 0, totalBalance: 0 },
      )
      setCurrentTotals(totals)
    } catch (error) {
      console.error("Error loading trends data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return showBalance ? formatCurrency(amount) : "Rp.••••••"
  }

  const formatChartData = () => {
    return trendsData.map((item) => ({
      month: format(parseISO(item.month + "-01"), "MMM yyyy", { locale: id }),
      monthKey: item.month,
      pemasukan: item.totalIncome,
      pengeluaran: item.totalExpense,
      balance: item.balance,
    }))
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-sm">
                {entry.name}: {formatAmount(entry.value)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trend Keuangan Bulanan</CardTitle>
          <div className="flex gap-2 mt-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                <SelectValue />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">Semua Periode</SelectItem>
                <SelectItem value="3">3 Bulan Terakhir</SelectItem>
                <SelectItem value="6">6 Bulan Terakhir</SelectItem>
                <SelectItem value="12">12 Bulan Terakhir</SelectItem>
                <SelectItem value="24">24 Bulan Terakhir</SelectItem>
                </SelectContent>
            </Select>
        </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Memuat...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trend Keuangan Bulanan</CardTitle>
         <div className="flex gap-2 mt-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-48">
                <SelectValue />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="all">Semua Periode</SelectItem>
                <SelectItem value="3">3 Bulan Terakhir</SelectItem>
                <SelectItem value="6">6 Bulan Terakhir</SelectItem>
                <SelectItem value="12">12 Bulan Terakhir</SelectItem>
                <SelectItem value="24">24 Bulan Terakhir</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Totals */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Income</p>
            <p className="text-lg font-bold text-green-600">{formatAmount(currentTotals.totalIncome)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Expenditure</p>
            <p className="text-lg font-bold text-red-600">{formatAmount(currentTotals.totalExpense)}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Total Balance</p>
            <p className={`text-lg font-bold ${currentTotals.totalBalance >= 0 ? "text-blue-600" : "text-red-600"}`}>
              {formatAmount(currentTotals.totalBalance)}
            </p>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="h-48 border border-gray-200 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formatChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => formatCurrencyCompactMini(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="pemasukan"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Pemasukan"
              />
              <Line
                type="monotone"
                dataKey="pengeluaran"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Pengeluaran"
              />
              <Line type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} name="Balance" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
