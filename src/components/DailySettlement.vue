<template>
  <div class="card">
    <h2>每日结算触发</h2>
    <div class="row">
      <div class="col">
        <label>日期</label>
        <input v-model="dateKey" class="input" />
      </div>
      <div>
        <button class="btn" @click="trigger">触发分发</button>
      </div>
    </div>
  </div>
  <div class="card">
    <h3>待分发概览</h3>
    <table class="table">
      <thead><tr><th>记录标识</th><th>订阅服务</th><th>消息标识</th><th>订阅类型</th><th>状态</th></tr></thead>
      <tbody>
        <tr v-for="r in pendingRecords" :key="r.id">
          <td>{{ r.id }}</td>
          <td>{{ nameMap[r.subscriptionId] }}</td>
          <td>{{ r.messageId }}</td>
          <td>{{ labelConsumerType(r.subscriptionType) }}</td>
          <td>{{ labelRecordStatus(r.status) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { store } from '../store'
import { labelConsumerType, labelRecordStatus } from '../labels'
const dateKey = ref(new Date().toISOString().slice(0,10))
const pendingRecords = computed(() => store.records.filter(r => r.status === 'PENDING'))
function trigger() { store.triggerDailySettlement(dateKey.value) }
const nameMap = computed(() => Object.fromEntries(store.subscriptions.map(s => [s.id, s.serviceName])))
</script>
