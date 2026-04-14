export interface IDashboardTotals {
    totalCases: number
    totalPlans: number
    totalRuns: number
    passedRuns: number
    failedRuns: number
    brokenRuns: number
    skippedRuns: number
    passRatePercent: number
    passRateTrend: "UP" | "DOWN" | "STABLE"
    passRateLast7DaysPercent: number
    passRatePrevious7DaysPercent: number
}

export interface IDashboardRecentRun {
    id: number
    caseId: number
    caseTitle: string
    planId: number
    planName: string
    statusSlug: string
    statusName: string
    executedBy?: number
    executedByUsername?: string
    executedByEmail?: string
    executedAt: string
}

export interface IDashboardRecentPlan {
    id: number
    name: string
    createdAt: string
    casesCount: number
}

export interface IDashboardTrendPoint {
    date: string
    totalRuns: number
    passedRuns: number
    failedRuns: number
    brokenRuns: number
    skippedRuns: number
    passRatePercent: number
}

export interface IDashboardResponse {
    totals: IDashboardTotals
    recentRuns: IDashboardRecentRun[]
    recentPlans: IDashboardRecentPlan[]
    trendLast7Days: IDashboardTrendPoint[]
}
