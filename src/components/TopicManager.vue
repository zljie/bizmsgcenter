<template>
  <div class="card">
    <h2>消息主题定义</h2>
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
    <div class="row" style="margin-top:12px;">
      <div class="col">
        <label>参数名</label>
        <input v-model="paramName" class="input" placeholder="如 vessel" />
      </div>
      <div class="col">
        <label>类型</label>
        <select v-model="paramType" class="input">
          <option value="string">string</option>
          <option value="number">number</option>
          <option value="boolean">boolean</option>
          <option value="object">object</option>
        </select>
      </div>
      <div class="col">
        <label>必填</label>
        <select v-model="paramRequired" class="input"><option :value="true">是</option><option :value="false">否</option></select>
      </div>
      <div>
        <button class="btn gray" @click="addParam">添加参数</button>
      </div>
    </div>
    <div class="card">
      <h3>当前待添加的参数</h3>
      <table class="table">
        <thead><tr><th>参数名</th><th>类型</th><th>必填</th></tr></thead>
        <tbody>
          <tr v-for="p in params" :key="p.name">
            <td>{{ p.name }}</td>
            <td>{{ p.type }}</td>
            <td>{{ p.required ? '是' : '否' }}</td>
          </tr>
        </tbody>
      </table>
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
const paramName = ref('')
const paramType = ref('string')
const paramRequired = ref(true)
const params = ref<{name:string;type:string;required:boolean}[]>([])
function add() {
  if (!name.value.trim()) return
  store.addTopic(name.value.trim(), description.value.trim(), params.value.slice())
  name.value = ''
  description.value = ''
  params.value = []
}
function addParam() {
  if (!paramName.value.trim()) return
  params.value.push({ name: paramName.value.trim(), type: paramType.value, required: paramRequired.value })
  paramName.value = ''
  paramType.value = 'string'
  paramRequired.value = true
}
</script>
