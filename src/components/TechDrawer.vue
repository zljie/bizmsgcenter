<template>
  <div class="drawer">
    <div class="bar">
      <div>消息管理技术流程图</div>
      <div class="tools">
        <button class="btn gray" @click="zoomOut">-</button>
        <button class="btn gray" @click="zoomIn">+</button>
        <button class="btn gray" @click="reset">重置</button>
        <button class="btn gray" @click="$emit('close')">关闭</button>
      </div>
    </div>
    <div class="content">
      <div class="zoom" :style="{ transform: `scale(${zoom})` }">
        <img :src="techSvg" alt="bizmsg tech" />
      </div>
    </div>
  </div>
  </template>

<script setup lang="ts">
import { ref } from 'vue'
import techSvg from '../staic/bizmsgtech.svg'
const zoom = ref(1)
function zoomIn() { zoom.value = Math.min(2, +(zoom.value + 0.1).toFixed(2)) }
function zoomOut() { zoom.value = Math.max(0.5, +(zoom.value - 0.1).toFixed(2)) }
function reset() { zoom.value = 1 }
</script>

<style>
.drawer { position: fixed; right: 0; top: 0; height: 100vh; width: 50vw; min-width: 480px; background: #fff; border-left: 1px solid #e5e7eb; box-shadow: -6px 0 12px rgba(0,0,0,0.08); z-index: 50; display: flex; flex-direction: column; }
.bar { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; background: #f8fafc; }
.tools { display: flex; gap: 8px; }
.content { padding: 12px; overflow: auto; }
.zoom { transform-origin: top left; }
.content img { max-width: 100%; height: auto; }
</style>
