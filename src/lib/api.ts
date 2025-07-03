import type {
  Transaction,
  Category,
  MonthlyRecap,
  CategoryStats,
  DailyStats,
  DailyReport,
  MonthlyTrend,
} from "../types"

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api` || "http://localhost:3001/api"

export const api = {
  // Transactions
  getTransactions: async (filters?: { category?: string; type?: string; month?: string }): Promise<Transaction[]> => {
    const params = new URLSearchParams()
    if (filters?.category) params.append("category", filters.category)
    if (filters?.type) params.append("type", filters.type)
    if (filters?.month) params.append("month", filters.month)

    const response = await fetch(`${API_BASE_URL}/transactions?${params}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  createTransaction: async (transaction: Omit<Transaction, "id">): Promise<{ id: number; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/transactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  updateTransaction: async (id: number, transaction: Omit<Transaction, "id">): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  deleteTransaction: async (id: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  getMonthlyRecap: async (month: string): Promise<MonthlyRecap> => {
    const response = await fetch(`${API_BASE_URL}/transactions/recap/${month}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  getCategoryStats: async (month?: string): Promise<CategoryStats[]> => {
    const params = new URLSearchParams()
    if (month) params.append("month", month)

    const response = await fetch(`${API_BASE_URL}/transactions/stats?${params}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  getDailyStats: async (month?: string): Promise<DailyStats[]> => {
    const params = new URLSearchParams()
    if (month) params.append("month", month)

    const response = await fetch(`${API_BASE_URL}/transactions/daily-stats?${params}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  getDailyReport: async (date: string): Promise<DailyReport> => {
    const response = await fetch(`${API_BASE_URL}/transactions/daily-report/${date}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  getMonthlyTrends: async (months?: number): Promise<MonthlyTrend[]> => {
    const params = new URLSearchParams()
    if (months) params.append("months", months.toString())

    const response = await fetch(`${API_BASE_URL}/transactions/monthly-trends?${params}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  // Categories
  getCategories: async (type?: "income" | "expense"): Promise<Category[]> => {
    const params = new URLSearchParams()
    if (type) params.append("type", type)

    const response = await fetch(`${API_BASE_URL}/categories?${params}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  createCategory: async (category: Omit<Category, "id">): Promise<{ id: number; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(category),
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  },
}
