export function labelMessageStatus(s: string) {
  if (s === 'PERSISTED') return '已持久化'
  if (s === 'QUEUED') return '已入队'
  if (s === 'DISTRIBUTED') return '已分发'
  return s
}

export function labelRecordStatus(s: string) {
  if (s === 'PENDING') return '待分发'
  if (s === 'QUEUED') return '队列中'
  if (s === 'SUCCESS') return '已成功'
  if (s === 'FAILED') return '失败'
  return s
}

export function labelConsumerType(s: string) {
  if (s === 'REALTIME') return '实时消费'
  if (s === 'DAILY_BATCH') return '每日批量'
  if (s === 'DAILY_DEDUP') return '每日去重'
  return s
}
