<template>
  <div class="drawer">
    <div class="bar">
      <div>消息管理技术流程图</div>
      <button class="btn gray" @click="$emit('close')">关闭</button>
    </div>
    <div class="content">
      <img :src="techSvg" alt="bizmsg tech" />
    </div>
  </div>
</template>

<script setup lang="ts">
import techSvg from '../staic/bizmsgtech.svg'
</script>

<style>
.drawer { position: fixed; right: 0; top: 0; height: 100vh; width: 38vw; min-width: 360px; background: #fff; border-left: 1px solid #e5e7eb; box-shadow: -6px 0 12px rgba(0,0,0,0.08); z-index: 50; display: flex; flex-direction: column; }
.bar { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; background: #f8fafc; }
.content { padding: 12px; overflow: auto; }
.content img { max-width: 100%; height: auto; }
</style>
