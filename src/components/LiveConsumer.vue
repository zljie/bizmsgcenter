<template>
  <div class="card">
    <h2>实时监听中心</h2>
    <div class="row">
      <div class="col">
        <label>选择消费者</label>
        <select v-model="cid" class="input">
          <option v-for="s in actives" :key="s.id" :value="s.id">{{ s.serviceName }} ({{ s.consumerType }})</option>
        </select>
      </div>
    </div>
  </div>
  <div class="card">
    <h3>消息流</h3>
    <table class="table">
      <thead><tr><th>订阅服务</th><th>流水ID</th><th>主题</th><th>事件类型</th><th>业务编号</th><th>到达时间</th></tr></thead>
      <tbody>
        <tr v-for="i in feed" :key="i.deliveredAt + i.message.id">
          <td>{{ nameMap[i.subscriptionId] }}</td>
          <td>{{ i.message.tranId }}</td>
          <td>{{ i.message.topic }}</td>
          <td>{{ i.message.eventType }}</td>
          <td>{{ i.message.businessId }}</td>
          <td>{{ i.deliveredAt }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { store } from '../store'
const cid = ref('')
const actives = computed(() => store.subscriptions.filter(s => s.isActive))
const feed = computed(() => store.inboxes.filter(i => !cid.value || i.subscriptionId === cid.value))
const nameMap = computed(() => Object.fromEntries(store.subscriptions.map(s => [s.id, s.serviceName])))
</script>
