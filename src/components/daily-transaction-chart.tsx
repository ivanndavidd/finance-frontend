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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  format,
  parseISO,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { id } from "date-fns/locale";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { DailyReportModal } from "./daily-report-modal";
import type {
  DailyData,
  DailyStats,
  Transaction,
  CategoryStats,
} from "@/types";

interface DailyTransactionChartProps {
  refreshTrigger: number;
  showBalance: boolean;
}

interface DailyDTO {
  date: string;
  transactions: Transaction[];
  categoryStats: CategoryStats[];
  summary: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    transactionCount: number;
  };
}

export function DailyTransactionChart({
  refreshTrigger,
  showBalance,
}: DailyTransactionChartProps) {
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<
    "income" | "expense" | "all"
  >("all");
  const [dailyReport, setDailyReport] = useState<DailyDTO>({
    date: "",
    transactions: [],
    categoryStats: [],
    summary: {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      transactionCount: 0,
    },
  } as DailyDTO);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showIncome, setShowIncome] = useState(true);
  const [showExpense, setShowExpense] = useState(true);

  useEffect(() => {
    loadDailyData();
  }, [selectedMonth, refreshTrigger]);

  const loadDailyData = async () => {
    setIsLoading(true);
    try {
      const data: DailyStats[] = await api.getDailyStats(selectedMonth);

      // Generate all days in the month
      const monthStart = startOfMonth(new Date(selectedMonth + "-01"));
      const monthEnd = endOfMonth(monthStart);
      const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

      // Create a map of existing data
      const dataMap: { [key: string]: DailyData } = {};

      data.forEach((item: DailyStats) => {
        if (!dataMap[item.date]) {
          dataMap[item.date] = {
            date: item.date,
            income: 0,
            expense: 0,
            incomeCount: 0,
            expenseCount: 0,
            incomeCategories: [],
            expenseCategories: [],
          };
        }

        if (item.type === "income") {
          dataMap[item.date].income = item.total;
          dataMap[item.date].incomeCount = item.count;
          dataMap[item.date].incomeCategories = item.categories
            ? item.categories.split(",")
            : [];
        } else {
          dataMap[item.date].expense = item.total;
          dataMap[item.date].expenseCount = item.count;
          dataMap[item.date].expenseCategories = item.categories
            ? item.categories.split(",")
            : [];
        }
      });

      // Fill in missing days with zero values
      const completeData = allDays.map((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        return (
          dataMap[dateStr] || {
            date: dateStr,
            income: 0,
            expense: 0,
            incomeCount: 0,
            expenseCount: 0,
            incomeCategories: [],
            expenseCategories: [],
          }
        );
      });

      setDailyData(completeData);
    } catch (error) {
      console.error("Error loading daily data:", error);
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
      const label = format(date, "MMMM yyyy", { locale: id });
      options.push({ value, label });
    }

    return options;
  };

  const handleDotClick = async (
    data: any,
    transactionType: "income" | "expense"
  ) => {
    if (data && data.date) {
      await openDailyReport(data.date, transactionType);
    }
  };

  const openDailyReport = async (
    date: string,
    type: "income" | "expense" | "all" = "all"
  ) => {
    setSelectedDate(date);
    setSelectedType(type);

    try {
      const report = await api.getDailyReport(date);
      setDailyReport(report);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error loading daily report:", error);
      alert("Gagal memuat laporan harian. Silakan coba lagi.");
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DailyData;
      const incomeData = payload.find((p: any) => p.dataKey === "income");
      const expenseData = payload.find((p: any) => p.dataKey === "expense");

      // Don't show tooltip if no transactions
      if (data.incomeCount === 0 && data.expenseCount === 0) {
        return null;
      }

      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium mb-2">
            {format(parseISO(label), "dd MMMM yyyy", { locale: id })}
          </p>

          {incomeData && incomeData.value > 0 && (
            <div className="mb-2">
              <p className="text-green-600 font-medium">
                Pemasukan: {formatAmount(incomeData.value)}
              </p>
              <p className="text-sm text-green-500">
                {data.incomeCount} transaksi
              </p>
              {data.incomeCategories.length > 0 && (
                <p className="text-xs text-gray-600">
                  Kategori:{" "}
                  {data.incomeCategories
                    .slice(0, 3)
                    .map((cat: string) => cat.split(":")[0])
                    .join(", ")}
                  {data.incomeCategories.length > 3 && "..."}
                </p>
              )}
            </div>
          )}

          {expenseData && expenseData.value > 0 && (
            <div>
              <p className="text-red-600 font-medium">
                Pengeluaran: {formatAmount(expenseData.value)}
              </p>
              <p className="text-sm text-red-500">
                {data.expenseCount} transaksi
              </p>
              {data.expenseCategories.length > 0 && (
                <p className="text-xs text-gray-600">
                  Kategori:{" "}
                  {data.expenseCategories
                    .slice(0, 3)
                    .map((cat: string) => cat.split(":")[0])
                    .join(", ")}
                  {data.expenseCategories.length > 3 && "..."}
                </p>
              )}
            </div>
          )}

          <p className="text-xs text-gray-500 mt-2 border-t pt-2">
            Klik titik hijau untuk detail pemasukan, titik merah untuk detail
            pengeluaran
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomIncomeDot = (props: any) => {
    const { cx, cy, payload } = props;
    const hasData = payload.incomeCount > 0;

    if (!hasData) return null;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#10b981"
        stroke="#10b981"
        strokeWidth={2}
        style={{ cursor: "pointer" }}
        onClick={(event) => {
          event.stopPropagation();
          handleDotClick(payload, "income");
        }}
      />
    );
  };

  const CustomExpenseDot = (props: any) => {
    const { cx, cy, payload } = props;
    const hasData = payload.expenseCount > 0;

    if (!hasData) return null;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#ef4444"
        stroke="#ef4444"
        strokeWidth={2}
        style={{ cursor: "pointer" }}
        onClick={(event) => {
          event.stopPropagation();
          handleDotClick(payload, "expense");
        }}
      />
    );
  };

  const CustomIncomeActiveDot = (props: any) => {
    const { cx, cy, payload } = props;
    const hasData = payload.incomeCount > 0;

    if (!hasData) return null;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#10b981"
        stroke="#10b981"
        strokeWidth={2}
        style={{ cursor: "pointer" }}
        onClick={(event) => {
          event.stopPropagation();
          handleDotClick(payload, "income");
        }}
      />
    );
  };

  const CustomExpenseActiveDot = (props: any) => {
    const { cx, cy, payload } = props;
    const hasData = payload.expenseCount > 0;

    if (!hasData) return null;

    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="#ef4444"
        stroke="#ef4444"
        strokeWidth={2}
        style={{ cursor: "pointer" }}
        onClick={(event) => {
          event.stopPropagation();
          handleDotClick(payload, "expense");
        }}
      />
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grafik Transaksi Harian</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Memuat...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Grafik Transaksi Harian</CardTitle>
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
            {/* Checkbox toggle income */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showIncome}
                onChange={(e) => setShowIncome(e.target.checked)}
                className="accent-gray-500 w-4 h-4"
              />
              <span className="text-sm">Tampilkan Pemasukan</span>
            </label>

            {/* Checkbox toggle expense */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showExpense}
                onChange={(e) => setShowExpense(e.target.checked)}
                className="accent-gray-500 w-4 h-4"
              />
              <span className="text-sm">Tampilkan Pengeluaran</span>
            </label>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(parseISO(value), "dd/MM")}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}Jt`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {showIncome && (
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={<CustomIncomeDot />}
                    activeDot={<CustomIncomeActiveDot />}
                    name="Pemasukan"
                    connectNulls={false}
                  />
                )}
                {showExpense && (
                  <Line
                    type="monotone"
                    dataKey="expense"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={<CustomExpenseDot />}
                    activeDot={<CustomExpenseActiveDot />}
                    name="Pengeluaran"
                    connectNulls={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <DailyReportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        date={selectedDate || ""}
        report={dailyReport}
        filterType={selectedType}
      />
    </>
  );
}
