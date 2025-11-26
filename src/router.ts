import { createRouter, createWebHashHistory } from 'vue-router'
import TopicManager from './components/TopicManager.vue'
import PublishEvent from './components/PublishEvent.vue'
import ConsumerRegistry from './components/ConsumerRegistry.vue'
import DailySettlement from './components/DailySettlement.vue'
import LiveConsumer from './components/LiveConsumer.vue'
import DistributionLog from './components/DistributionLog.vue'
import PipelineMonitor from './components/PipelineMonitor.vue'

const routes = [
  { path: '/', redirect: '/monitor' },
  { path: '/monitor', component: PipelineMonitor },
  { path: '/topics', component: TopicManager },
  { path: '/publish', component: PublishEvent },
  { path: '/consumers', component: ConsumerRegistry },
  { path: '/daily', component: DailySettlement },
  { path: '/live', component: LiveConsumer },
  { path: '/logs', component: DistributionLog },
]

export default createRouter({ history: createWebHashHistory(), routes })
