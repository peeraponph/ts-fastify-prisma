function getDiff(before: any, after: any): Record<string, { before: any; after: any }> {
    const diff: Record<string, { before: any; after: any }> = {}
    for (const key in after) {
        if (before[key] !== after[key]) {
            diff[key] = { before: before[key], after: after[key] }
        }
    }
    return diff
}
export { getDiff }  