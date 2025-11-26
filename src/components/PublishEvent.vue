<template>
  <div class="card">
    <h2>事件发布</h2>
    <div class="row">
      <div class="col">
        <label>Topic</label>
        <select v-model="topic" class="input">
          <option v-for="t in store.topics" :key="t.id" :value="t.name">{{ t.name }}</option>
        </select>
      </div>
      <div class="col">
        <label>事件类型</label>
        <select v-model="eventType" class="input">
          <option>CREATE</option>
          <option>UPDATE</option>
          <option>DELETE</option>
        </select>
      </div>
      <div class="col">
        <label>业务ID</label>
        <input v-model="businessId" class="input" placeholder="如 PO20240001" />
      </div>
    </div>
    <div class="row">
      <div class="col">
        <label>时间戳</label>
        <input v-model="timestamp" class="input" />
      </div>
      <div class="col">
        <label>数据(JSON)</label>
        <textarea v-model="dataStr" class="input" rows="6" placeholder='{ "amount": 10 }'></textarea>
      </div>
    </div>
    <div>
      <button class="btn" @click="publish">发布</button>
    </div>
  </div>
  <div class="card">
    <h3>最新消息</h3>
    <table class="table">
      <thead><tr><th>流水ID</th><th>主题</th><th>事件类型</th><th>业务编号</th><th>状态</th><th>时间</th></tr></thead>
      <tbody>
        <tr v-for="m in store.messages.slice().reverse().slice(0,8)" :key="m.id">
          <td>{{ m.tranId }}</td>
          <td>{{ m.topic }}</td>
          <td>{{ m.eventType }}</td>
          <td>{{ m.businessId }}</td>
          <td>{{ labelMessageStatus(m.status) }}</td>
          <td>{{ m.timestamp }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { store } from '../store'
import { labelMessageStatus } from '../labels'
const topic = ref(store.topics[0]?.name || '')
const eventType = ref('CREATE')
const businessId = ref('')
const timestamp = ref(new Date().toISOString())
const dataStr = ref('{"amount":10}')
function publish() {
  if (!topic.value || !eventType.value || !businessId.value) return
  let data
  try { data = JSON.parse(dataStr.value || '{}') } catch { return }
  store.persistMessage({ topic: topic.value, eventType: eventType.value, businessId: businessId.value, timestamp: timestamp.value, data })
}
</script>
