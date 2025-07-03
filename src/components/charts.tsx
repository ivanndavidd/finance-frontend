"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { format } from "date-fns"
import { api } from "@/lib/api"
import { formatCurrency } from "@/lib/currency"
import type { CategoryStats } from "@/types"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7C7C"]

interface ExpenseChartProps {
  refreshTrigger: number
  showBalance: boolean
}

export function ExpenseChart({ refreshTrigger, showBalance }: ExpenseChartProps) {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"))
  const [expenseChartType, setExpenseChartType] = useState<"pie" | "bar">("pie")
  const [incomeChartType, setIncomeChartType] = useState<"pie" | "bar">("pie")
  const [incomeSelectedMonth, setIncomeSelectedMonth] = useState(format(new Date(), "yyyy-MM"))
  const [stats, setStats] = useState<CategoryStats[]>([])
  const [incomeStats, setIncomeStats] = useState<CategoryStats[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isIncomeLoading, setIsIncomeLoading] = useState(false)

  useEffect(() => {
    loadExpenseStats()
  }, [selectedMonth, refreshTrigger])

  useEffect(() => {
    loadIncomeStats()
  }, [incomeSelectedMonth, refreshTrigger])

  const loadExpenseStats = async () => {
    setIsLoading(true)
    try {
      const data = await api.getCategoryStats(selectedMonth)
      setStats(data)
    } catch (error) {
      console.error("Error loading expense stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadIncomeStats = async () => {
    setIsIncomeLoading(true)
    try {
      const data = await api.getCategoryStats(incomeSelectedMonth)
      setIncomeStats(data)
    } catch (error) {
      console.error("Error loading income stats:", error)
    } finally {
      setIsIncomeLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return showBalance ? formatCurrency(amount) : "Rp.••••••"
  }

  const generateMonthOptions = () => {
    const options = []
    const currentDate = new Date()

    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const value = format(date, "yyyy-MM")
      const label = format(date, "MMMM yyyy")
      options.push({ value, label })
    }

    return options
  }

  const expenseData = stats.filter((stat) => stat.type === "expense")
  const incomeData = incomeStats.filter((stat) => stat.type === "income")

  const renderChart = (data: CategoryStats[], chartType: "pie" | "bar", isIncome = false) => {
    if (data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <p>Tidak ada data untuk bulan ini</p>
        </div>
      )
    }

    if (chartType === "pie") {
      return (
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ category, percent }) => `${category} ${percent ? (percent * 100).toFixed(0) : "0"}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="total"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [formatAmount(value), "Jumlah"]} />
        </PieChart>
      )
    } else {
      return (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip formatter={(value: number) => [formatAmount(value), "Jumlah"]} />
          <Bar dataKey="total" fill={isIncome ? "#10b981" : "#ef4444"} />
        </BarChart>
      )
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Expense Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Rincian Pengeluaran</CardTitle>
          <div className="flex gap-2">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {generateMonthOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={expenseChartType} onValueChange={(value: "pie" | "bar") => setExpenseChartType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Memuat...</p>
                </div>
              ) : (
                renderChart(expenseData, expenseChartType, false)
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Income Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Rincian Pemasukan</CardTitle>
          <div className="flex gap-2">
            <Select value={incomeSelectedMonth} onValueChange={setIncomeSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {generateMonthOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={incomeChartType} onValueChange={(value: "pie" | "bar") => setIncomeChartType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pie">Pie Chart</SelectItem>
                <SelectItem value="bar">Bar Chart</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {isIncomeLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Memuat...</p>
                </div>
              ) : (
                renderChart(incomeData, incomeChartType, true)
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
