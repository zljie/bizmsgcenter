<template>
  <div class="card">
    <h2>Topic定义</h2>
    <div class="row">
      <div class="col">
        <label>名称</label>
        <input v-model="name" class="input" placeholder="如 logistics_topic" />
      </div>
      <div class="col">
        <label>描述</label>
        <input v-model="description" class="input" placeholder="用途说明" />
      </div>
      <div>
        <button class="btn" @click="add">新增</button>
      </div>
    </div>
  </div>
  <div class="card">
    <h3>已定义</h3>
    <table class="table">
      <thead><tr><th>名称</th><th>描述</th><th>标识</th></tr></thead>
      <tbody>
        <tr v-for="t in store.topics" :key="t.id">
          <td>{{ t.name }}</td>
          <td>{{ t.description }}</td>
          <td>{{ t.id }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { store } from '../store'
const name = ref('')
const description = ref('')
function add() {
  if (!name.value.trim()) return
  store.addTopic(name.value.trim(), description.value.trim())
  name.value = ''
  description.value = ''
}
</script>
