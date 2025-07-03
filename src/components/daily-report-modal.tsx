"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/currency"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import type { DailyReport } from "@/types"

interface DailyReportModalProps {
  isOpen: boolean
  onClose: () => void
  date: string
  report: DailyReport | null
  filterType?: "income" | "expense" | "all"
}

export function DailyReportModal({ isOpen, onClose, date, report, filterType = "all" }: DailyReportModalProps) {
  if (!report) return null

  // Filter data based on type
  const filteredTransactions = report.transactions.filter((transaction) => {
    if (filterType === "all") return true
    return transaction.type === filterType
  })

  const filteredCategoryStats = report.categoryStats.filter((stat) => {
    if (filterType === "all") return true
    return stat.type === filterType
  })

  const hasTransactions = filteredTransactions.length > 0

  // Calculate filtered summary
  const filteredSummary = {
    totalIncome: filterType === "expense" ? 0 : report.summary.totalIncome,
    totalExpense: filterType === "income" ? 0 : report.summary.totalExpense,
    balance:
      filterType === "income"
        ? report.summary.totalIncome
        : filterType === "expense"
          ? -report.summary.totalExpense
          : report.summary.balance,
    transactionCount: filteredTransactions.length,
  }

  const getModalTitle = () => {
    const dateStr = date ? format(new Date(date), "dd MMMM yyyy", { locale: id }) : ""
    switch (filterType) {
      case "income":
        return `Detail Pemasukan - ${dateStr}`
      case "expense":
        return `Detail Pengeluaran - ${dateStr}`
      default:
        return `Laporan Harian - ${dateStr}`
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="p-4"
        style={{
          width: "fit-content",
          maxWidth: "100%",
          maxHeight: "80vh",
          overflowY: "auto", 
        }}
      >
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!hasTransactions ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">
                Tidak ada{" "}
                {filterType === "income" ? "pemasukan" : filterType === "expense" ? "pengeluaran" : "transaksi"} pada
                tanggal ini
              </p>
              <p className="text-gray-400 text-sm mt-2">Silakan pilih tanggal lain atau tambah transaksi baru</p>
            </div>
          ) : (
            <>
              {/* Category Breakdown */}
              {filteredCategoryStats.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      Ringkasan per Kategori{" "}
                      {filterType === "income" ? "(Pemasukan)" : filterType === "expense" ? "(Pengeluaran)" : ""}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-2 md:px-4">
                    {filterType === "all" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-green-600 mb-2">Pemasukan</h4>
                          <div className="space-y-2">
                            {filteredCategoryStats
                              .filter((stat) => stat.type === "income")
                              .map((stat, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                                  <span className="text-sm">{stat.category}</span>
                                  <div className="text-right">
                                    <div className="font-medium text-green-700">{formatCurrency(stat.total)}</div>
                                    <div className="text-xs text-green-600">{stat.count} transaksi</div>
                                  </div>
                                </div>
                              ))}
                            {filteredCategoryStats.filter((stat) => stat.type === "income").length === 0 && (
                              <p className="text-gray-500 text-sm">Tidak ada pemasukan</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-red-600 mb-2">Pengeluaran</h4>
                          <div className="space-y-2">
                            {filteredCategoryStats
                              .filter((stat) => stat.type === "expense")
                              .map((stat, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                                  <span className="text-sm">{stat.category}</span>
                                  <div className="text-right">
                                    <div className="font-medium text-red-700">{formatCurrency(stat.total)}</div>
                                    <div className="text-xs text-red-600">{stat.count} transaksi</div>
                                  </div>
                                </div>
                              ))}
                            {filteredCategoryStats.filter((stat) => stat.type === "expense").length === 0 && (
                              <p className="text-gray-500 text-sm">Tidak ada pengeluaran</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {filteredCategoryStats.map((stat, index) => (
                          <div
                            key={index}
                            className={`flex justify-between items-center p-2 rounded ${
                              stat.type === "income" ? "bg-green-50" : "bg-red-50"
                            }`}
                          >
                            <span className="text-sm">{stat.category}</span>
                            <div className="text-right">
                              <div
                                className={`font-medium ${stat.type === "income" ? "text-green-700" : "text-red-700"}`}
                              >
                                {formatCurrency(stat.total)}
                              </div>
                              <div className={`text-xs ${stat.type === "income" ? "text-green-600" : "text-red-600"}`}>
                                {stat.count} transaksi
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Detailed Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Detail Transaksi ({filteredSummary.transactionCount})
                    {filterType !== "all" && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        - {filterType === "income" ? "Pemasukan" : "Pengeluaran"} saja
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                <div className="overflow-x-auto">
                
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="text-sm">
                            {transaction.created_at ? format(new Date(transaction.created_at), "HH:mm") : "-"}
                          </TableCell>
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
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
