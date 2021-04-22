/*
 * @Author       : hekai
 * @Date         : 2021-04-09 16:36:58
 * @FilePath     : \word-list\src\main.js
 * @Description  : 
 */
import Antd from 'ant-design-vue';
import App from './App.vue'
import 'ant-design-vue/dist/antd.css';
import Vue from 'vue'

Vue.config.productionTip = false
Vue.use(Antd)
new Vue({
  render: h => h(App),
}).$mount('#app')
