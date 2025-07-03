export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000000000) {
    return `Rp ${(amount / 1000000000).toFixed(1)}M`
  } else if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}Jt`
  } else if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)}rb`
  }
  return `Rp ${amount.toLocaleString("id-ID")}`
}

export function formatCurrencyCompactMini(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}b`
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}m`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k`
  }
  return `${amount.toLocaleString("id-ID")}`
}
