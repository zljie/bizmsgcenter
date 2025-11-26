export type ConsumerType = 'REALTIME' | 'DAILY_BATCH' | 'DAILY_DEDUP'

export interface Topic {
  id: string
  name: string
  description?: string
  params?: ParamDef[]
}

export type ParamType = 'string' | 'number' | 'boolean' | 'object'

export interface ParamDef {
  name: string
  type: ParamType
  required?: boolean
}

export interface EventMessage {
  id: string
  tranId: string
  topic: string
  eventType: string
  businessId: string
  timestamp: string
  data: Record<string, any>
  status: 'PERSISTED' | 'QUEUED' | 'DISTRIBUTED'
  dateKey: string
}

export interface Subscription {
  id: string
  serviceName: string
  consumerGroup: string
  topic: string
  callbackUrl: string
  consumerType: ConsumerType
  scheduleTime?: string
  filterConditions?: Record<string, any>
  isActive: boolean
  retryEnabled?: boolean
  maxRetries?: number
  backoffMs?: number
  failureRate?: number
}

export interface DistributionRecord {
  id: string
  messageId: string
  subscriptionId: string
  subscriptionType: ConsumerType
  distributedTime?: string
  status: 'PENDING' | 'QUEUED' | 'SUCCESS' | 'FAILED'
  detail?: string
}
