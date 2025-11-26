import { reactive } from 'vue'
import type { Topic, EventMessage, Subscription, ConsumerType, DistributionRecord, ParamDef } from './types'

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
  subscriptionId: string
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
  subscriptions: [] as Subscription[],
  records: [] as DistributionRecord[],
  inboxes: [] as InboxItem[],
  batchBuckets: {} as Record<string, { subscriptionId: string; messages: EventMessage[] }[]>,
  dedupBuckets: {} as Record<string, { subscriptionId: string; keys: Set<string>; messages: EventMessage[] }[]>,
  addTopic(name: string, description?: string, params?: ParamDef[]) {
    const exists = this.topics.some(t => t.name === name)
    if (exists) return
    this.topics.push({ id: genId('topic'), name, description, params })
  },
  registerSubscription(payload: Omit<Subscription, 'id' | 'isActive'> & { isActive?: boolean }) {
    const s: Subscription = { id: genId('sub'), isActive: payload.isActive ?? true, ...payload }
    this.subscriptions.push(s)
    return s
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
    const targets = this.subscriptions.filter(s => s.isActive && s.topic === msg.topic)
    targets.forEach(s => {
      const rec: DistributionRecord = {
        id: genId('rec'),
        messageId: msg.id,
        subscriptionId: s.id,
        subscriptionType: s.consumerType,
        status: s.consumerType === 'REALTIME' ? 'QUEUED' : 'PENDING',
      }
      this.records.push(rec)
      if (s.consumerType === 'REALTIME') this.deliver(s, msg, rec)
      if (s.consumerType === 'DAILY_BATCH') this.addToBatch(s.id, msg)
      if (s.consumerType === 'DAILY_DEDUP') this.addToDedup(s.id, msg)
    })
    msg.status = 'QUEUED'
  },
  addToBatch(subscriptionId: string, msg: EventMessage) {
    const key = msg.dateKey
    if (!this.batchBuckets[key]) this.batchBuckets[key] = []
    const bucket = this.batchBuckets[key].find(b => b.subscriptionId === subscriptionId)
    if (bucket) bucket.messages.push(msg)
    else this.batchBuckets[key].push({ subscriptionId, messages: [msg] })
  },
  addToDedup(subscriptionId: string, msg: EventMessage) {
    const key = msg.dateKey
    if (!this.dedupBuckets[key]) this.dedupBuckets[key] = []
    let bucket = this.dedupBuckets[key].find(b => b.subscriptionId === subscriptionId)
    if (!bucket) {
      bucket = { subscriptionId, keys: new Set<string>(), messages: [] }
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
        const rec = this.records.find(r => r.messageId === m.id && r.subscriptionId === b.subscriptionId)
        if (rec && rec.status !== 'SUCCESS') {
          const s = this.subscriptions.find(x => x.id === b.subscriptionId)
          if (s) this.deliver(s, m, rec)
        }
      })
    })
    const dedup = this.dedupBuckets[key] || []
    dedup.forEach(b => {
      b.messages.forEach(m => {
        const rec = this.records.find(r => r.messageId === m.id && r.subscriptionId === b.subscriptionId)
        if (rec && rec.status !== 'SUCCESS') {
          const s = this.subscriptions.find(x => x.id === b.subscriptionId)
          if (s) this.deliver(s, m, rec)
        }
      })
    })
  },
  deliver(s: Subscription, msg: EventMessage, rec: DistributionRecord) {
    const now = new Date().toISOString()
    let attempts = 0
    const max = s.maxRetries ?? 0
    const enabled = s.retryEnabled ?? false
    const rate = s.failureRate ?? 0
    function tryOnce() {
      attempts += 1
      const failed = Math.random() < rate
      return !failed
    }
    let ok = tryOnce()
    while (!ok && enabled && attempts <= max) {
      ok = tryOnce()
    }
    this.inboxes.unshift({ subscriptionId: s.id, message: msg, deliveredAt: now })
    rec.status = ok ? 'SUCCESS' : 'FAILED'
    rec.distributedTime = now
    rec.detail = `attempts=${attempts}`
    msg.status = 'DISTRIBUTED'
  },
  seedPetroScenario() {
    this.addTopic('refinery_topic', '炼化生产事件')
    this.addTopic('pipeline_topic', '管输批次事件')
    this.addTopic('hse_topic', '安全环保事件')
    this.addTopic('maintenance_topic', '设备维保事件')
    this.addTopic('trading_topic', '贸易合约事件')
    const exists = (name: string, topic: string) => this.subscriptions.some(s => s.serviceName === name && s.topic === topic)
    if (!exists('logistics_control_service','logistics_topic')) this.registerSubscription({ serviceName: 'logistics_control_service', consumerGroup: 'realtime_logistics', topic: 'logistics_topic', callbackUrl: 'http://logistics/api/callback', consumerType: 'REALTIME' })
    if (!exists('warehouse_service','inventory_topic')) this.registerSubscription({ serviceName: 'warehouse_service', consumerGroup: 'daily_settlement', topic: 'inventory_topic', callbackUrl: 'http://warehouse/api/inventory', consumerType: 'DAILY_DEDUP', scheduleTime: '23:00:00' })
    if (!exists('procurement_service','purchase_topic')) this.registerSubscription({ serviceName: 'procurement_service', consumerGroup: 'realtime_procurement', topic: 'purchase_topic', callbackUrl: 'http://procurement/api/events', consumerType: 'REALTIME' })
    if (!exists('refinery_ops_service','refinery_topic')) this.registerSubscription({ serviceName: 'refinery_ops_service', consumerGroup: 'daily_refinery', topic: 'refinery_topic', callbackUrl: 'http://refinery/api/daily', consumerType: 'DAILY_BATCH', scheduleTime: '23:30:00' })
    if (!exists('finance_settlement_service','finance_topic')) this.registerSubscription({ serviceName: 'finance_settlement_service', consumerGroup: 'daily_finance', topic: 'finance_topic', callbackUrl: 'http://finance/api/settlement', consumerType: 'DAILY_BATCH', scheduleTime: '00:10:00' })
    if (!exists('hse_alert_service','hse_topic')) this.registerSubscription({ serviceName: 'hse_alert_service', consumerGroup: 'realtime_hse', topic: 'hse_topic', callbackUrl: 'http://hse/api/alerts', consumerType: 'REALTIME' })
    if (!exists('maintenance_service','maintenance_topic')) this.registerSubscription({ serviceName: 'maintenance_service', consumerGroup: 'realtime_maintenance', topic: 'maintenance_topic', callbackUrl: 'http://maintenance/api/workorders', consumerType: 'REALTIME' })
    if (!exists('trading_marketing_service','trading_topic')) this.registerSubscription({ serviceName: 'trading_marketing_service', consumerGroup: 'daily_trading', topic: 'trading_topic', callbackUrl: 'http://trading/api/contracts', consumerType: 'DAILY_BATCH', scheduleTime: '22:00:00' })
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
