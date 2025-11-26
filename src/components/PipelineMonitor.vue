<template>
  <div class="card">
    <h2>监控总览</h2>
    <div class="row">
      <div class="col">
        <div class="card"><strong>Topic数</strong><div>{{ store.topics.length }}</div></div>
      </div>
      <div class="col">
        <div class="card"><strong>消息总数</strong><div>{{ store.messages.length }}</div></div>
      </div>
      <div class="col">
        <div class="card"><strong>记录数</strong><div>{{ store.records.length }}</div></div>
      </div>
      <div class="col">
        <div class="card"><strong>订阅数</strong><div>{{ store.subscriptions.length }}</div></div>
      </div>
    </div>
  </div>
  <div class="card">
    <h3>快速指引</h3>
    <ul>
      <li>在 消息主题定义 中新增或查看 Topic</li>
      <li>在 事件发布 中选择 Topic 并发送消息</li>
      <li>在 事件订阅 中注册实时或每日消费者</li>
      <li>在 每日结算 中触发当日批量或去重分发</li>
      <li>在 实时监听 中查看到达的消息流</li>
      <li>在 分发记录 中查看分发状态</li>
    </ul>
    <div class="row" style="margin-top:12px;">
      <div>
        <button class="btn" @click="seed">加载石油化工行业场景</button>
      </div>
      <div>
        <button class="btn" @click="gen">生成示例消息</button>
      </div>
      <div>
        <button class="btn" @click="settle">触发今日结算</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { store } from '../store'
function seed() { store.seedPetroScenario() }
function gen() { store.publishPetroSampleMessages() }
function settle() { store.triggerDailySettlement() }
</script>
