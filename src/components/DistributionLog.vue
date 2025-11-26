<template>
  <div class="card">
    <h2>分发记录</h2>
    <div class="row">
      <div class="col">
        <label>过滤消费者</label>
        <select v-model="cid" class="input">
          <option value="">全部</option>
          <option v-for="c in store.consumers" :key="c.id" :value="c.id">{{ c.serviceName }}</option>
        </select>
      </div>
    </div>
  </div>
  <div class="card">
    <table class="table">
      <thead><tr><th>记录标识</th><th>消费者服务</th><th>消息标识</th><th>消费类型</th><th>分发时间</th><th>状态</th><th>详情</th></tr></thead>
      <tbody>
        <tr v-for="r in filtered" :key="r.id">
          <td>{{ r.id }}</td>
          <td>{{ nameMap[r.consumerId] }}</td>
          <td>{{ r.messageId }}</td>
          <td>{{ labelConsumerType(r.consumerType) }}</td>
          <td>{{ r.distributedTime || '-' }}</td>
          <td>{{ labelRecordStatus(r.status) }}</td>
          <td>{{ r.detail || '-' }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { store } from '../store'
import { labelConsumerType, labelRecordStatus } from '../labels'
const cid = ref('')
const filtered = computed(() => store.records.filter(r => !cid.value || r.consumerId === cid.value))
const nameMap = computed(() => Object.fromEntries(store.consumers.map(c => [c.id, c.serviceName])))
</script>
