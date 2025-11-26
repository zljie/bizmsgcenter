export type ConsumerType = 'REALTIME' | 'DAILY_BATCH' | 'DAILY_DEDUP'

export interface Topic {
  id: string
  name: string
  description?: string
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

export interface Consumer {
  id: string
  serviceName: string
  consumerGroup: string
  topics: string[]
  callbackUrl: string
  consumerType: ConsumerType
  scheduleTime?: string
  filterConditions?: Record<string, any>
  isActive: boolean
}

export interface DistributionRecord {
  id: string
  messageId: string
  consumerId: string
  consumerType: ConsumerType
  distributedTime?: string
  status: 'PENDING' | 'QUEUED' | 'SUCCESS' | 'FAILED'
  detail?: string
}
