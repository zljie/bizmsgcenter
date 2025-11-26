<template>
  <div class="card">
    <h2>事件订阅</h2>
    <div class="row">
      <div class="col"><label>服务名</label><input v-model="serviceName" class="input" /></div>
      <div class="col"><label>消费组</label><input v-model="consumerGroup" class="input" /></div>
      <div class="col">
        <label>消费类型</label>
        <select v-model="consumerType" class="input">
          <option value="REALTIME">REALTIME</option>
          <option value="DAILY_BATCH">DAILY_BATCH</option>
          <option value="DAILY_DEDUP">DAILY_DEDUP</option>
        </select>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>订阅主题</label>
        <select v-model="topic" class="input">
          <option v-for="t in store.topics" :key="t.id" :value="t.name">{{ t.name }}</option>
        </select>
      </div>
      <div class="col"><label>回调URL</label><input v-model="callbackUrl" class="input" placeholder="http://service/api/callback" /></div>
      <div class="col"><label>触发时间</label><input v-model="scheduleTime" class="input" placeholder="23:00:00" /></div>
    </div>
    <div class="row">
      <div class="col"><label>过滤条件(JSON)</label><textarea v-model="filterStr" class="input" rows="4"></textarea></div>
      <div class="col">
        <label>异常处理</label>
        <div class="row">
          <div class="col"><label>开启重试</label><select v-model="retryEnabled" class="input"><option :value="true">是</option><option :value="false">否</option></select></div>
          <div class="col"><label>重试次数</label><input v-model.number="maxRetries" type="number" class="input" /></div>
          <div class="col"><label>退避毫秒</label><input v-model.number="backoffMs" type="number" class="input" /></div>
          <div class="col"><label>失败概率(0-1)</label><input v-model.number="failureRate" type="number" step="0.1" class="input" /></div>
        </div>
      </div>
    </div>
    <div>
      <button class="btn" @click="register">注册</button>
    </div>
  </div>
  <div class="card">
    <h3>已注册</h3>
    <table class="table">
      <thead><tr><th>服务名</th><th>消费组</th><th>消费类型</th><th>订阅主题</th><th>回调地址</th><th>重试</th><th>最大次数</th><th>失败概率</th><th>状态</th></tr></thead>
      <tbody>
        <tr v-for="s in store.subscriptions" :key="s.id">
          <td>{{ s.serviceName }}</td>
          <td>{{ s.consumerGroup }}</td>
          <td>{{ labelConsumerType(s.consumerType) }}</td>
          <td>{{ s.topic }}</td>
          <td>{{ s.callbackUrl }}</td>
          <td>{{ s.retryEnabled ? '是' : '否' }}</td>
          <td>{{ s.maxRetries ?? 0 }}</td>
          <td>{{ s.failureRate ?? 0 }}</td>
          <td><button class="btn gray" @click="toggle(s)">{{ s.isActive ? '停用' : '启用' }}</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { store } from '../store'
import type { ConsumerType } from '../types'
import { labelConsumerType } from '../labels'
const serviceName = ref('warehouse_service')
const consumerGroup = ref('daily_settlement')
const consumerType = ref<ConsumerType>('DAILY_BATCH')
const topic = ref('')
const callbackUrl = ref('http://warehouse-service/api/events/logistics')
const scheduleTime = ref('23:00:00')
const filterStr = ref('')
const retryEnabled = ref(true)
const maxRetries = ref(3)
const backoffMs = ref(1000)
const failureRate = ref(0)
function register() {
  let filter
  try { filter = filterStr.value ? JSON.parse(filterStr.value) : undefined } catch { filter = undefined }
  if (!serviceName.value || !consumerGroup.value || !topic.value) return
  store.registerSubscription({ serviceName: serviceName.value, consumerGroup: consumerGroup.value, topic: topic.value, callbackUrl: callbackUrl.value, consumerType: consumerType.value, scheduleTime: scheduleTime.value, filterConditions: filter, retryEnabled: retryEnabled.value, maxRetries: maxRetries.value, backoffMs: backoffMs.value, failureRate: failureRate.value })
}
function toggle(s: any) { s.isActive = !s.isActive }
</script>
