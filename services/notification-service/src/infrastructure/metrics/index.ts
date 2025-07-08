// services/notification-service/src/infrastructure/metrics/index.ts
import { Registry, collectDefaultMetrics } from 'prom-client'

export const register = new Registry()
collectDefaultMetrics({ register })

// 👇 import metric definitions หลังจาก register ถูกประกาศ
import './consumer.metrics'
