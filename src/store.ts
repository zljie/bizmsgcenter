import { reactive } from 'vue'
import type { Topic, EventMessage, Consumer, ConsumerType, DistributionRecord } from './types'

function genId(prefix: string) {
  const r = Math.random().toString(36).slice(2, 8)
  const t = Date.now().toString(36)
  return `${prefix}_${t}_${r}`
}

function todayKey(ts?: number) {
  const d = ts ? new Date(ts) : new Date()
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const da = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${da}`
}

interface InboxItem {
  consumerId: string
  message: EventMessage
  deliveredAt: string
}

const initialTopics: Topic[] = [
  { id: genId('topic'), name: 'purchase_topic', description: '采购相关事件' },
  { id: genId('topic'), name: 'logistics_topic', description: '物流相关事件' },
  { id: genId('topic'), name: 'inventory_topic', description: '库存相关事件' },
  { id: genId('topic'), name: 'finance_topic', description: '财务相关事件' },
]

export const store = reactive({
  topics: initialTopics as Topic[],
  messages: [] as EventMessage[],
  consumers: [] as Consumer[],
  records: [] as DistributionRecord[],
  inboxes: [] as InboxItem[],
  batchBuckets: {} as Record<string, { consumerId: string; messages: EventMessage[] }[]>,
  dedupBuckets: {} as Record<string, { consumerId: string; keys: Set<string>; messages: EventMessage[] }[]>,
  addTopic(name: string, description?: string) {
    const exists = this.topics.some(t => t.name === name)
    if (exists) return
    this.topics.push({ id: genId('topic'), name, description })
  },
  registerConsumer(payload: Omit<Consumer, 'id' | 'isActive'> & { isActive?: boolean }) {
    const c: Consumer = { id: genId('consumer'), isActive: payload.isActive ?? true, ...payload }
    this.consumers.push(c)
    return c
  },
  persistMessage(input: Omit<EventMessage, 'id' | 'tranId' | 'status' | 'dateKey'>) {
    const tranId = genId('tran')
    const msg: EventMessage = {
      id: genId('msg'),
      tranId,
      status: 'PERSISTED',
      dateKey: todayKey(Date.parse(input.timestamp)),
      ...input,
    }
    this.messages.push(msg)
    this.enqueueForDistribution(msg)
    return msg
  },
  enqueueForDistribution(msg: EventMessage) {
    const targets = this.consumers.filter(c => c.isActive && c.topics.includes(msg.topic))
    targets.forEach(c => {
      const rec: DistributionRecord = {
        id: genId('rec'),
        messageId: msg.id,
        consumerId: c.id,
        consumerType: c.consumerType,
        status: c.consumerType === 'REALTIME' ? 'QUEUED' : 'PENDING',
      }
      this.records.push(rec)
      if (c.consumerType === 'REALTIME') this.deliver(c, msg, rec)
      if (c.consumerType === 'DAILY_BATCH') this.addToBatch(c.id, msg)
      if (c.consumerType === 'DAILY_DEDUP') this.addToDedup(c.id, msg)
    })
    msg.status = 'QUEUED'
  },
  addToBatch(consumerId: string, msg: EventMessage) {
    const key = msg.dateKey
    if (!this.batchBuckets[key]) this.batchBuckets[key] = []
    const bucket = this.batchBuckets[key].find(b => b.consumerId === consumerId)
    if (bucket) bucket.messages.push(msg)
    else this.batchBuckets[key].push({ consumerId, messages: [msg] })
  },
  addToDedup(consumerId: string, msg: EventMessage) {
    const key = msg.dateKey
    if (!this.dedupBuckets[key]) this.dedupBuckets[key] = []
    let bucket = this.dedupBuckets[key].find(b => b.consumerId === consumerId)
    if (!bucket) {
      bucket = { consumerId, keys: new Set<string>(), messages: [] }
      this.dedupBuckets[key].push(bucket)
    }
    const k = `${msg.topic}-${msg.businessId}-${msg.eventType}`
    if (!bucket.keys.has(k)) {
      bucket.keys.add(k)
      bucket.messages.push(msg)
    }
  },
  triggerDailySettlement(dateKey?: string) {
    const key = dateKey ?? todayKey()
    const batch = this.batchBuckets[key] || []
    batch.forEach(b => {
      b.messages.forEach(m => {
        const rec = this.records.find(r => r.messageId === m.id && r.consumerId === b.consumerId)
        if (rec && rec.status !== 'SUCCESS') {
          const c = this.consumers.find(x => x.id === b.consumerId)
          if (c) this.deliver(c, m, rec)
        }
      })
    })
    const dedup = this.dedupBuckets[key] || []
    dedup.forEach(b => {
      b.messages.forEach(m => {
        const rec = this.records.find(r => r.messageId === m.id && r.consumerId === b.consumerId)
        if (rec && rec.status !== 'SUCCESS') {
          const c = this.consumers.find(x => x.id === b.consumerId)
          if (c) this.deliver(c, m, rec)
        }
      })
    })
  },
  deliver(c: Consumer, msg: EventMessage, rec: DistributionRecord) {
    const now = new Date().toISOString()
    this.inboxes.unshift({ consumerId: c.id, message: msg, deliveredAt: now })
    rec.status = 'SUCCESS'
    rec.distributedTime = now
    msg.status = 'DISTRIBUTED'
  },
  seedPetroScenario() {
    this.addTopic('refinery_topic', '炼化生产事件')
    this.addTopic('pipeline_topic', '管输批次事件')
    this.addTopic('hse_topic', '安全环保事件')
    this.addTopic('maintenance_topic', '设备维保事件')
    this.addTopic('trading_topic', '贸易合约事件')
    const exists = (name: string) => this.consumers.some(c => c.serviceName === name)
    if (!exists('logistics_control_service')) this.registerConsumer({ serviceName: 'logistics_control_service', consumerGroup: 'realtime_logistics', topics: ['logistics_topic'], callbackUrl: 'http://logistics/api/callback', consumerType: 'REALTIME' })
    if (!exists('warehouse_service')) this.registerConsumer({ serviceName: 'warehouse_service', consumerGroup: 'daily_settlement', topics: ['inventory_topic'], callbackUrl: 'http://warehouse/api/inventory', consumerType: 'DAILY_DEDUP', scheduleTime: '23:00:00' })
    if (!exists('procurement_service')) this.registerConsumer({ serviceName: 'procurement_service', consumerGroup: 'realtime_procurement', topics: ['purchase_topic'], callbackUrl: 'http://procurement/api/events', consumerType: 'REALTIME' })
    if (!exists('refinery_ops_service')) this.registerConsumer({ serviceName: 'refinery_ops_service', consumerGroup: 'daily_refinery', topics: ['refinery_topic'], callbackUrl: 'http://refinery/api/daily', consumerType: 'DAILY_BATCH', scheduleTime: '23:30:00' })
    if (!exists('finance_settlement_service')) this.registerConsumer({ serviceName: 'finance_settlement_service', consumerGroup: 'daily_finance', topics: ['finance_topic'], callbackUrl: 'http://finance/api/settlement', consumerType: 'DAILY_BATCH', scheduleTime: '00:10:00' })
    if (!exists('hse_alert_service')) this.registerConsumer({ serviceName: 'hse_alert_service', consumerGroup: 'realtime_hse', topics: ['hse_topic'], callbackUrl: 'http://hse/api/alerts', consumerType: 'REALTIME' })
    if (!exists('maintenance_service')) this.registerConsumer({ serviceName: 'maintenance_service', consumerGroup: 'realtime_maintenance', topics: ['maintenance_topic'], callbackUrl: 'http://maintenance/api/workorders', consumerType: 'REALTIME' })
    if (!exists('trading_marketing_service')) this.registerConsumer({ serviceName: 'trading_marketing_service', consumerGroup: 'daily_trading', topics: ['trading_topic'], callbackUrl: 'http://trading/api/contracts', consumerType: 'DAILY_BATCH', scheduleTime: '22:00:00' })
  },
  publishPetroSampleMessages() {
    const now = new Date()
    const iso = (d: Date) => d.toISOString()
    const d1 = new Date(now.getTime() - 60 * 60 * 1000)
    const d2 = new Date(now.getTime() - 2 * 60 * 60 * 1000)
    this.persistMessage({ topic: 'purchase_topic', eventType: 'CREATE', businessId: 'PO-CRUDE-2025-0001', timestamp: iso(d2), data: { supplier: 'MiddleEastCo', grade: 'Arab Light', volume: 100000 } })
    this.persistMessage({ topic: 'logistics_topic', eventType: 'UPDATE', businessId: 'SHIPMENT-ATLANTIC-7788', timestamp: iso(d1), data: { vessel: 'SEA-STAR', status: 'LOADED', eta: '2025-11-28T08:00:00Z' } })
    this.persistMessage({ topic: 'inventory_topic', eventType: 'UPDATE', businessId: 'TANK-T1', timestamp: iso(now), data: { location: 'Refinery-North', product: 'Diesel', level: 68.2, unit: '%' } })
    this.persistMessage({ topic: 'inventory_topic', eventType: 'UPDATE', businessId: 'TANK-T1', timestamp: iso(now), data: { location: 'Refinery-North', product: 'Diesel', level: 68.2, unit: '%' } })
    this.persistMessage({ topic: 'inventory_topic', eventType: 'UPDATE', businessId: 'TANK-T1', timestamp: iso(now), data: { location: 'Refinery-North', product: 'Diesel', level: 68.2, unit: '%' } })
    this.persistMessage({ topic: 'finance_topic', eventType: 'CREATE', businessId: 'SETTLE-PO-0001', timestamp: iso(now), data: { currency: 'USD', amount: 5200000, tax: 0.13 } })
    this.persistMessage({ topic: 'refinery_topic', eventType: 'UPDATE', businessId: 'DAILY-PROD-2025-11-26', timestamp: iso(now), data: { crudeIntake: 180000, dieselOut: 60000, gasolineOut: 70000 } })
    this.persistMessage({ topic: 'hse_topic', eventType: 'CREATE', businessId: 'INCIDENT-REF-N-001', timestamp: iso(now), data: { level: 'LOW', type: 'LeakAlarm', area: 'Unit-200', resolved: true } })
    this.persistMessage({ topic: 'maintenance_topic', eventType: 'CREATE', businessId: 'WO-PUMP-8842', timestamp: iso(now), data: { asset: 'CrudePump-P42', priority: 'HIGH', action: 'SealReplace' } })
    this.persistMessage({ topic: 'pipeline_topic', eventType: 'UPDATE', businessId: 'BATCH-PL-9921', timestamp: iso(now), data: { from: 'Field-A', to: 'Refinery-North', product: 'Crude', volume: 90000 } })
    this.persistMessage({ topic: 'trading_topic', eventType: 'CREATE', businessId: 'CONTRACT-OIL-7781', timestamp: iso(now), data: { counterparty: 'GlobalTradeLtd', incoterm: 'FOB', month: '2025-12' } })
  },
})
