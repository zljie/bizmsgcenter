<template>
  <div class="card">
    <h2>实时监听中心</h2>
    <div class="row">
      <div class="col">
        <label>选择消费者</label>
        <select v-model="cid" class="input">
          <option v-for="c in actives" :key="c.id" :value="c.id">{{ c.serviceName }} ({{ c.consumerType }})</option>
        </select>
      </div>
    </div>
  </div>
  <div class="card">
    <h3>消息流</h3>
    <table class="table">
      <thead><tr><th>消费者服务</th><th>流水ID</th><th>主题</th><th>事件类型</th><th>业务编号</th><th>到达时间</th></tr></thead>
      <tbody>
        <tr v-for="i in feed" :key="i.deliveredAt + i.message.id">
          <td>{{ nameMap[i.consumerId] }}</td>
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
const actives = computed(() => store.consumers.filter(c => c.isActive))
const feed = computed(() => store.inboxes.filter(i => !cid.value || i.consumerId === cid.value))
const nameMap = computed(() => Object.fromEntries(store.consumers.map(c => [c.id, c.serviceName])))
</script>
