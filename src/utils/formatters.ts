export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function calculateRatingDistribution(rating: number, totalReviews: number): Record<number, number> {
  // Generate realistic distribution percentages
  const safeTotal = Math.max(1, totalReviews);
  if (rating >= 4.7) {
    return {
      5: Math.round(safeTotal * 0.78),
      4: Math.round(safeTotal * 0.16),
      3: Math.round(safeTotal * 0.04),
      2: Math.round(safeTotal * 0.01),
      1: Math.round(safeTotal * 0.01),
    };
  } else if (rating >= 4.3) {
    return {
      5: Math.round(safeTotal * 0.62),
      4: Math.round(safeTotal * 0.24),
      3: Math.round(safeTotal * 0.09),
      2: Math.round(safeTotal * 0.03),
      1: Math.round(safeTotal * 0.02),
    };
  } else {
    return {
      5: Math.round(safeTotal * 0.45),
      4: Math.round(safeTotal * 0.30),
      3: Math.round(safeTotal * 0.15),
      2: Math.round(safeTotal * 0.06),
      1: Math.round(safeTotal * 0.04),
    };
  }
}
