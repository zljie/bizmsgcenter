<template>
  <div class="layout">
    <header>
      <h1>企业通用消息分发管理中心 演示</h1>
      <nav>
        <a href="#/monitor">监控总览</a>
        <a href="#/topics">Topic定义</a>
        <a href="#/publish">事件发布</a>
        <a href="#/consumers">监听注册</a>
        <a href="#/daily">每日结算</a>
        <a href="#/live">实时监听</a>
        <a href="#/logs">分发记录</a>
      </nav>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts"></script>

<style>
body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
.layout header { background: #0f172a; color: #fff; padding: 12px 16px; }
.layout nav { display: flex; gap: 12px; margin-top: 8px; }
.layout nav a { color: #93c5fd; text-decoration: none; background: #1f2937; padding: 6px 10px; border-radius: 6px; }
.layout main { padding: 16px; }
.card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
.row { display: flex; gap: 16px; }
.col { flex: 1; }
.btn { padding: 8px 12px; border: none; border-radius: 6px; background: #2563eb; color: #fff; cursor: pointer; }
.btn.gray { background: #6b7280; }
.input { width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; }
.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
</style>
