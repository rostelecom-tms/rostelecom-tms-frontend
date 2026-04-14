import type {IRun} from "../models/run/run.ts";

const STATUS_COLOR_MAP: Record<string, string> = {
    passed: "success",
    failed: "error",
    broken: "volcano",
    skipped: "default",
}

export const getRunStatusColor = (statusSlug: string): string => {
    return STATUS_COLOR_MAP[statusSlug] ?? "blue"
}

export const getRunExecutorLabel = (run: IRun): string => {
    if (run.executedByUsername && run.executedByEmail) {
        return `${run.executedByUsername} (${run.executedByEmail})`
    }
    if (run.executedByUsername) {
        return run.executedByUsername
    }
    if (run.executedByEmail) {
        return run.executedByEmail
    }
    if (run.executedBy) {
        return `User #${run.executedBy}`
    }
    return "Система"
}
