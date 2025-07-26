"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import type { DailyReport } from "@/types";

interface MonthlyRecapCardProps {
  refreshTrigger: number;
  showBalance: boolean;
}

export function MonthlyRecapCard({
  refreshTrigger,
  showBalance,
}: MonthlyRecapCardProps) {
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [recap, setRecap] = useState<DailyReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadRecap();
  }, [selectedMonth, refreshTrigger]);

  const loadRecap = async () => {
    setIsLoading(true);
    const date = format(new Date(), "yyyy-MM-dd");
    try {
      const report = await api.getDailyReport(date);
      setRecap(report);
    } catch (error) {
      console.error("Error loading recap:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return showBalance ? formatCurrency(amount) : "Rp.••••••";
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();

    for (let i = 0; i < 12; i++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1
      );
      const value = format(date, "yyyy-MM");
      const label = format(date, "MMMM yyyy");
      options.push({ value, label });
    }

    return options;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Daily Recap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rekap Harian</CardTitle>
        {/* <Select value={selectedMonth} onValueChange={setSelectedMonth}>
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
        </Select> */}
      </CardHeader>
      <CardContent>
        {recap && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-600">
                  Limit Budget /day
                </p>
                <p className="text-2xl font-bold text-green-700">
                  {/* {formatAmount(recap.totalIncome)} */}
                  Rp. 130.000
                </p>
                {/* <p className="text-xs text-green-600">
                  {recap.incomeCount} transaksi
                </p> */}
              </div>
            </div>

            <div className="flex items-center space-x-2 p-4 bg-red-50 rounded-lg">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-600">
                  Total Pengeluaran /day
                </p>
                <p className="text-2xl font-bold text-red-700">
                  {formatAmount(recap.summary.totalExpense)}
                </p>
                <p className="text-xs text-red-600">
                  {recap.summary.transactionCount} transaksi
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-600">Saldo</p>
                <p
                  className={`text-2xl font-bold ${
                    recap.summary.balance >= 0
                      ? "text-blue-700"
                      : "text-red-700"
                  }`}
                >
                  {formatAmount(recap.summary.balance)}
                </p>
                <p className="text-xs text-blue-600">
                  {recap.summary.balance >= 0 ? "Surplus" : "Defisit"}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
