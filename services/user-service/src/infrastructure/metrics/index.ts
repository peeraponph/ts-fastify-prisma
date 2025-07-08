import { collectDefaultMetrics } from 'prom-client'
import { register } from './register'

// 👇 import หลังจาก register พร้อมแล้ว
import './http.metrics'
import './kafka.metrics'

collectDefaultMetrics({ register })
export { register }
