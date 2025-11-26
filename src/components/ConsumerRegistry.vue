<template>
  <div class="card">
    <h2>监听注册</h2>
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
        <label>Topics</label>
        <div>
          <label v-for="t in store.topics" :key="t.id" style="margin-right:12px;">
            <input type="checkbox" :value="t.name" v-model="topics" /> {{ t.name }}
          </label>
        </div>
      </div>
      <div class="col"><label>回调URL</label><input v-model="callbackUrl" class="input" placeholder="http://service/api/callback" /></div>
      <div class="col"><label>触发时间</label><input v-model="scheduleTime" class="input" placeholder="23:00:00" /></div>
    </div>
    <div class="row">
      <div class="col"><label>过滤条件(JSON)</label><textarea v-model="filterStr" class="input" rows="4"></textarea></div>
    </div>
    <div>
      <button class="btn" @click="register">注册</button>
    </div>
  </div>
  <div class="card">
    <h3>已注册</h3>
    <table class="table">
      <thead><tr><th>服务名</th><th>消费组</th><th>消费类型</th><th>订阅主题</th><th>回调地址</th><th>状态</th></tr></thead>
      <tbody>
        <tr v-for="c in store.consumers" :key="c.id">
          <td>{{ c.serviceName }}</td>
          <td>{{ c.consumerGroup }}</td>
          <td>{{ labelConsumerType(c.consumerType) }}</td>
          <td>{{ c.topics.join(',') }}</td>
          <td>{{ c.callbackUrl }}</td>
          <td>
            <button class="btn gray" @click="toggle(c)">{{ c.isActive ? '停用' : '启用' }}</button>
          </td>
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
const topics = ref<string[]>([])
const callbackUrl = ref('http://warehouse-service/api/events/logistics')
const scheduleTime = ref('23:00:00')
const filterStr = ref('')
function register() {
  let filter
  try { filter = filterStr.value ? JSON.parse(filterStr.value) : undefined } catch { filter = undefined }
  if (!serviceName.value || !consumerGroup.value || topics.value.length === 0) return
  store.registerConsumer({ serviceName: serviceName.value, consumerGroup: consumerGroup.value, topics: topics.value, callbackUrl: callbackUrl.value, consumerType: consumerType.value, scheduleTime: scheduleTime.value, filterConditions: filter })
}
function toggle(c: any) { c.isActive = !c.isActive }
</script>
