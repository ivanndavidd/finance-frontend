"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Trash2, Filter } from "lucide-react"
import { format } from "date-fns"
import { api } from "@/lib/api"
import { formatCurrency } from "@/lib/currency"
import { DeleteConfirmationModal } from "./delete-modal"
import type { Transaction, Category } from "@/types"

interface TransactionListProps {
  refreshTrigger: number
  onDataChange: () => void
  showBalance: boolean
}

export function TransactionList({ refreshTrigger, onDataChange, showBalance}: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filters, setFilters] = useState({
    category: "all",
    type: "all",
    month: format(new Date(), "yyyy-MM"),
  })
  const [isLoading, setIsLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    transactionId: null as number | null,
    isDeleting: false,
  })

  useEffect(() => {
    loadTransactions()
    loadCategories()
  }, [filters, refreshTrigger])

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const apiFilters: any = {}

      if (filters.category !== "all") {
        apiFilters.category = filters.category
      }

      if (filters.type !== "all") {
        apiFilters.type = filters.type
      }

      if (filters.month !== "all") {
        apiFilters.month = filters.month
      }

      const data = await api.getTransactions(apiFilters)
      setTransactions(data)
    } catch (error) {
      console.error("Error loading transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const data = await api.getCategories()
      const uniqueCategories = data.filter(
        (category: Category, index: number, self: Category[]) =>
          index === self.findIndex((c) => c.name === category.name && c.type === category.type),
      )
      setCategories(uniqueCategories)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const openDeleteModal = (id: number) => {
    setDeleteModal({
      isOpen: true,
      transactionId: id,
      isDeleting: false,
    })
  }

  const formatAmount = (amount: number) => {
    return showBalance ? formatCurrency(amount) : "Rp.••••••"
  }

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      transactionId: null,
      isDeleting: false,
    })
  }

  const handleDelete = async () => {
    if (!deleteModal.transactionId) return

    setDeleteModal((prev) => ({ ...prev, isDeleting: true }))

    try {
      await api.deleteTransaction(deleteModal.transactionId)
      await loadTransactions()
      onDataChange()
      closeDeleteModal()
      console.log("Transaksi berhasil dihapus!")
    } catch (error) {
      console.error("Error deleting transaction:", error)
      alert("Gagal menghapus transaksi. Silakan coba lagi.")
    } finally {
      setDeleteModal((prev) => ({ ...prev, isDeleting: false }))
    }
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

  const clearFilters = () => {
    setFilters({
      category: "all",
      type: "all",
      month: format(new Date(), "yyyy-MM"),
    })
  }

  const loadAllTransactions = async () => {
    try {
      const data = await api.getTransactions({})
      setTransactions(data)
    } catch (error) {
      console.error("Error loading all transactions:", error)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Riwayat Transaksi
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select value={filters.month} onValueChange={(value) => setFilters({ ...filters, month: value })}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Pilih bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua bulan</SelectItem>
                {generateMonthOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Semua tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua tipe</SelectItem>
                <SelectItem value="income">Pemasukan</SelectItem>
                <SelectItem value="expense">Pengeluaran</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Semua kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua kategori</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={`filter-${category.id}-${category.name}`} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              Hapus Filter
            </Button>

            <Button variant="outline" onClick={loadAllTransactions}>
              Tampilkan Semua
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Memuat...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Tipe</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Tidak ada transaksi ditemukan
                        <br />
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{format(new Date(transaction.date), "dd MMM yyyy")}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              transaction.type === "income"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-red-100 text-red-800 hover:bg-red-200"
                            }
                          >
                            {transaction.type === "income" ? "Pemasukan" : "Pengeluaran"}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>{transaction.description || "-"}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            transaction.type === "income" ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatAmount(transaction.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => transaction.id && openDeleteModal(transaction.id)}
                            className="hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        isLoading={deleteModal.isDeleting}
      />
    </>
  )
}
