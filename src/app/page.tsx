"use client"

import { useState } from "react"
import { TransactionForm } from "@/components/transaction-form"
import { MonthlyRecapCard } from "@/components/monthly-recap"
import { MonthlyTrendsChart } from "@/components/monthly-trends-chart"
import { ExpenseChart } from "@/components/charts"
import { DailyTransactionChart } from "@/components/daily-transaction-chart"
import { TransactionList } from "@/components/transactions-list"
import { QuickStats } from "@/components/quick-stats"
import { BalanceVisibilityToggle } from "@/components/balance-visibility-toggle"

export default function Home() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showBalance, setShowBalance] = useState(false)

  const handleDataChange = () => {
    setRefreshTrigger((prev) => prev + 1)
    console.log("Data refreshed! Trigger:", refreshTrigger + 1)
  }

  const toggleBalanceVisibility = () => {
    setShowBalance((prev) => !prev)
  }

 return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Monitor Keuangan</h1>
        <p className="text-gray-600">Pantau pemasukan dan pengeluaran Anda dengan analisis detail</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <BalanceVisibilityToggle isVisible={showBalance} onToggle={toggleBalanceVisibility} />
          <QuickStats refreshTrigger={refreshTrigger} />

          {/* Transaction Form */}
          <TransactionForm onTransactionAdded={handleDataChange} />
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          <MonthlyRecapCard refreshTrigger={refreshTrigger} showBalance={showBalance} />
          <MonthlyTrendsChart refreshTrigger={refreshTrigger} showBalance={showBalance} />
        </div>
      </div>

      <DailyTransactionChart refreshTrigger={refreshTrigger} showBalance={showBalance} />

      <ExpenseChart refreshTrigger={refreshTrigger} showBalance={showBalance} />

      <TransactionList refreshTrigger={refreshTrigger} onDataChange={handleDataChange} showBalance={showBalance}/>
    </div>
  )
}