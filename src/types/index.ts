export interface Transaction {
  id?: number
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
  created_at?: string
}

export interface Category {
  id?: number
  name: string
  type: "income" | "expense"
  color: string
}

export interface MonthlyRecap {
  month: string
  totalIncome: number
  totalExpense: number
  balance: number
  incomeCount: number
  expenseCount: number
}

export interface CategoryStats {
  category: string
  type: "income" | "expense"
  total: number
  count: number
}

export interface DailyStats {
  date: string
  type: "income" | "expense"
  total: number
  count: number
  categories: string
}

export interface DailyReport {
  date: string
  transactions: Transaction[]
  categoryStats: CategoryStats[]
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
    transactionCount: number
  }
}

export interface DailyData {
  date: string
  income: number
  expense: number
  incomeCount: number
  expenseCount: number
  incomeCategories: string[]
  expenseCategories: string[]
}

export interface MonthlyTrend {
  month: string
  totalIncome: number
  totalExpense: number
  balance: number
  incomeCount: number
  expenseCount: number
}
