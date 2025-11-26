# 企业通用消息分发管理中心（演示版）

面向石油化工行业的 ERP 消息基础设施前端演示，基于 Vite + Vue。用于展示统一接入、消息持久化、实时/每日分发、去重、监听注册与监控的完整产品体验。可对照 SAP ERP（MM、SD/TM、PP-PI、PM、EHS、FI/CO、TRM）对应业务域。

## 产品定位
- 构建企业级“消息支撑层”，统一承接事件源的 `topic + message`，持久化并带上流水 ID，再推送到消息队列（架构目标为 RocketMQ）。
- 下游消费中心按业务场景拆分（实时、每日批量、每日去重、条件触发），通过注册接口进行订阅与监听。

## 关键功能
- 统一发布入口：以统一参数规范发布事件消息，生成全局唯一 `tranId` 并持久化。
- 分发引擎：
  - 实时分发（REALTIME）：入库即投递；
  - 每日批量（DAILY_BATCH）：按日聚合，结算时批量投递；
  - 每日去重（DAILY_DEDUP）：按 `topic+businessId+eventType` 当日去重；
- 监听注册：服务注册消费组、消费类型、订阅 Topics、回调 URL 与激活状态。
- 轨迹与监控：分发记录、消息流、统计概览、可视化操作面板。

## 导航与页面
- 监控总览：总量指标、使用指引、操作按钮（加载行业场景、生成示例消息、触发今日结算）。
- Topic 定义：新增/查看 Topic。
- 事件发布：按 `topic/eventType/businessId/timestamp/data(JSON)` 发布，查看最新消息列表。
- 监听注册：注册消费者（实时/每日批量/每日去重），订阅 Topics，切换激活状态。
- 每日结算：查看待分发记录并触发当日分发。
- 实时监听：查看消费者消息流到达记录。
- 分发记录：查看分发状态、时间与详情。

## 行业场景（石油化工）
- 预置 Topics：
  - `purchase_topic`（采购）、`logistics_topic`（物流/运输）、`inventory_topic`（库存）、`finance_topic`（财务）、
  - `refinery_topic`（炼化生产）、`pipeline_topic`（管输批次）、`hse_topic`（安全环保）、`maintenance_topic`（设备维保）、`trading_topic`（贸易合约）。
- 预置消费者：
  - 实时：`logistics_control_service`、`procurement_service`、`hse_alert_service`、`maintenance_service`
  - 每日批量：`refinery_ops_service`、`finance_settlement_service`、`trading_marketing_service`
  - 每日去重：`warehouse_service`
- 示例消息：采购单创建、装船状态更新、库存变更（去重示例）、财务结算、炼化日报、安环事件、维保工单、管输批次、贸易合约等。

## 与 SAP ERP 模块映射
- MM（物料管理）：采购与库存事件
- SD/TM（销售与运输）：物流与运输事件
- PP-PI（流程制造生产）：炼化生产日报与批次
- PM（设备维护）：维保工单与停机计划
- EHS（环境、健康与安全）：告警与事件
- FI/CO（财务与控制）：结算与成本分摊
- TRM/SD（贸易与合约）：合约与定价事件

## 状态与显示（中文）
- 消息状态：已持久化 / 已入队 / 已分发
- 分发记录状态：待分发 / 队列中 / 已成功 / 失败
- 消费类型：实时消费 / 每日批量 / 每日去重
- 列标题：流水ID、主题、事件类型、业务编号、记录标识、消费者服务、消息标识、分发时间、状态、详情

## 技术栈
- 前端：Vite 5、Vue 3、Vue Router 4、TypeScript
- 目录：
  - `src/store.ts`：内存持久化与分发模拟、每日结算触发与去重逻辑；
  - `src/components/*`：各功能页面；
  - `src/types.ts`：核心类型；`src/labels.ts`：中文标签化；
  - `vite.config.ts`、`index.html`、`package.json`、`tsconfig.json`。

## 使用方式
1. 安装依赖并启动：
   - `npm install`
   - `npm run dev`
   - 打开 `http://localhost:5173/`
2. 监控总览：
   - 点击“加载石油化工行业场景”初始化 Topic 与消费者；
   - 点击“生成示例消息”；
   - 点击“触发今日结算”执行批量与去重分发。
3. 在各页面查看消息流、分发记录与配置效果。

## 与后端/RocketMQ 对接建议
- 发布入口：`POST /api/v1/events/publish` 入库后以 RocketMQ 事务消息投递；
- 结算任务：按 Cron 扫描当日分桶与去重集，批量投递；
- 回调治理：HMAC-SHA256 签名、幂等键、指数退避重试与 DLQ；
- 监控：入站 QPS、分发延迟、成功率、重试率、DLQ 堆积；
- 多租户：Topic 标签化与配额治理。

## 许可
- 演示用途，欢迎在企业内部 PoC 与二次开发。
