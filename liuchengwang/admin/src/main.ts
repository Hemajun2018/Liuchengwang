import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import router from './router'
import './style.css'

// 添加全局导航错误处理
router.onError((error) => {
  console.error('路由导航错误:', error);
});

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用Pinia状态管理
app.use(createPinia())

// 使用Element Plus
app.use(ElementPlus, {
  locale: zhCn,
})

// 使用路由
app.use(router)

app.mount('#app')
