import { Registry, collectDefaultMetrics } from 'prom-client'

// ✅ สร้าง Registry ของ Prometheus
export const register = new Registry()

// ✅ รวบรวม metrics พื้นฐานของ process/node.js
collectDefaultMetrics({ register })

// ✅ โหลด metrics อื่น ๆ ที่ประกาศไว้
import './outbox.metrics'  // <-- สมมุติว่าเราจะเก็บ metrics เกี่ยวกับ outbox (เช่น success/error count)
