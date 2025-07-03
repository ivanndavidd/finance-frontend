"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"
import { api } from "@/lib/api"
import type { Category } from "@/types"

interface TransactionFormProps {
  onTransactionAdded: () => void
}

export function TransactionForm({ onTransactionAdded }: TransactionFormProps) {
  const [formData, setFormData] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    category: "",
    description: "",
    date: new Date(),
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [formData.type])

  const loadCategories = async () => {
    try {
      const data = await api.getCategories(formData.type)
      // Remove duplicates based on name and type
      const uniqueCategories = data.filter(
        (category: Category, index: number, self: Category[]) =>
          index === self.findIndex((c) => c.name === category.name && c.type === category.type),
      )
      setCategories(uniqueCategories)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.amount || !formData.category) return

    setIsLoading(true)
    try {
      await api.createTransaction({
        type: formData.type,
        amount: Number.parseFloat(formData.amount),
        category: formData.category,
        description: formData.description,
        date: format(formData.date, "yyyy-MM-dd"),
      })

      // Reset form
      setFormData({
        type: "expense",
        amount: "",
        category: "",
        description: "",
        date: new Date(),
      })

      // Trigger refresh for all components
      onTransactionAdded()

      // Show success message
      console.log("Transaksi berhasil ditambahkan!")
    } catch (error) {
      console.error("Error creating transaction:", error)
      alert("Gagal menambahkan transaksi. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Tambah Transaksi
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label htmlFor="type" className="text-sm font-medium">
                Tipe
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value: "income" | "expense") => setFormData({ ...formData, type: value, category: "" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Pemasukan</SelectItem>
                  <SelectItem value="expense">Pengeluaran</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="amount" className="text-sm font-medium">
                Jumlah (Rp)
              </Label>
              <Input
                id="amount"
                type="number"
                step="1000"
                placeholder="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="category" className="text-sm font-medium">
              Kategori
            </Label>
            <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={`${category.id}-${category.name}-${category.type}`} value={category.name}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description" className="text-sm font-medium">
              Deskripsi
            </Label>
            <Input
              id="description"
              placeholder="Deskripsi opsional"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium">Tanggal</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(formData.date, "dd MMMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => date && setFormData({ ...formData, date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit" className="w-full mt-6" disabled={isLoading}>
            {isLoading ? "Menambahkan..." : "Tambah Transaksi"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
