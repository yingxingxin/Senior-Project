/**
 * Activity Heatmap Helpers
 *
 * Utility functions for building activity heatmap data structures.
 * These helpers are server-side compatible and do not depend on React.
 */

export interface DailyActivityStat {
  date: string; // YYYY-MM-DD format
  total_points: number;
  event_count: number;
}

export interface HeatmapCell {
  date: Date;
  dateString: string; // YYYY-MM-DD format
  totalPoints: number;
  eventCount: number;
}

/**
 * Calculate date range for heatmap
 *
 * Computes the from and to dates for a heatmap showing the last N months.
 * Both dates are normalized to the start of day (00:00:00).
 *
 * @param monthsBack - Number of months to look back (default: 6)
 * @returns Object with from and to dates
 *
 * @example
 * const { from, to } = getHeatmapDateRange(6);
 */
export function getHeatmapDateRange(monthsBack: number = 6): {
  from: Date;
  to: Date;
} {
  const to = new Date();
  to.setHours(0, 0, 0, 0);

  const from = new Date(to);
  from.setMonth(from.getMonth() - monthsBack);
  from.setHours(0, 0, 0, 0);

  return { from, to };
}

/**
 * Calculate date range for heatmap by days
 *
 * Computes the from and to dates for a heatmap showing the last N days.
 * Both dates are normalized to the start of day (00:00:00).
 *
 * @param daysBack - Number of days to look back (default: 30)
 * @returns Object with from and to dates
 *
 * @example
 * const { from, to } = getHeatmapDateRangeByDays(30);
 */
export function getHeatmapDateRangeByDays(daysBack: number = 30): {
  from: Date;
  to: Date;
} {
  const to = new Date();
  to.setHours(0, 0, 0, 0);

  const from = new Date(to);
  from.setDate(from.getDate() - daysBack);
  from.setHours(0, 0, 0, 0);

  return { from, to };
}

/**
 * Format date to YYYY-MM-DD string
 *
 * @param date - Date object to format
 * @returns Date string in YYYY-MM-DD format
 */
function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Build heatmap cells from daily activity stats
 *
 * Creates a continuous array of cells covering the entire date range,
 * filling in missing days with zero activity. This ensures the heatmap
 * displays a complete grid without gaps.
 *
 * @param from - Start date (inclusive)
 * @param to - End date (inclusive)
 * @param dailyStats - Array of daily activity statistics from the database
 * @returns Array of heatmap cells, one per day in the range
 *
 * @example
 * const cells = buildHeatmapCells(from, to, dailyStats);
 * // Returns array with one cell per day, even if no activity occurred
 */
export function buildHeatmapCells(
  from: Date,
  to: Date,
  dailyStats: DailyActivityStat[]
): HeatmapCell[] {
  // Create a map of date string to stats for quick lookup
  const statsMap = new Map<string, DailyActivityStat>();
  for (const stat of dailyStats) {
    statsMap.set(stat.date, stat);
  }

  // Generate all dates in the range
  const cells: HeatmapCell[] = [];
  const currentDate = new Date(from);

  while (currentDate <= to) {
    const dateString = formatDateString(currentDate);
    const stat = statsMap.get(dateString);

    cells.push({
      date: new Date(currentDate),
      dateString,
      totalPoints: stat?.total_points ?? 0,
      eventCount: stat?.event_count ?? 0,
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return cells;
}

