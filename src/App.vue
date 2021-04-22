<!--
 * @Author       : hekai
 * @Date         : 2021-04-09 16:36:58
 * @FilePath     : \word-list\src\App.vue
 * @Description  : 
-->
<template>
  <div id='app'>
    <a-menu @click='menuChange' v-model="current" mode="horizontal">
      <a-menu-item key="app"> <a-icon type="appstore" />单词板</a-menu-item>
      <a-menu-item key="yesturday"> <a-icon type="mail" />昨天的单词</a-menu-item>
    </a-menu>
    <a-drawer
      width='360'
      placement="right"
      :visible="drawerVisible"      
      :closable="false"
      @close="drawerChange"
    >
      <div slot="title">
        <span>选择日期</span>
        <a-date-picker v-model='date' :locale="locale" placeholder='请选择日期' style="float: right" @change="onDateChange" />
      </div>
      <a-list bordered :data-source="words">
        <a-list-item slot="renderItem" :key="index" slot-scope="item, index">
          {{ item.word }}
          {{ item.pronunciation }}
          {{ item.explain }}
        </a-list-item>
      </a-list>
    </a-drawer>
    <div class="content">
      <div :style="`font-size: ${fontSize}px;`">
        {{word.word}}
      </div>
      <a-button v-if="!wordVisible" style="margin-bottom: 16px" type="primary" shape="circle" icon="eye" @click="wordVisible = !wordVisible" />
      <template v-else>
        <div :style="`font-size: ${fontSize-10}px;`">
          {{word.pronunciation}}
        </div>
        <div :style="`font-size: ${fontSize-10}px;`">
          {{word.explain}}
        </div>
      </template>
      <a-button-group class="button-word">
          <a-button type="primary" @click="fontSize--" icon="minus" />
          <a-button type="primary" @click="fontSize++" icon="plus" />
      </a-button-group>
      <div>
        <a-button style="margin-right: 20px;margin-top: 16px" type="info" @click="forget">没记住,下一个</a-button>
        <a-button type="primary" @click="remember">记住了,下一个</a-button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
export default {
  name: 'App',
  data() {
    return {
      wordList: [],
      locale,
      fontSize: 40,
      date: moment(null),
      word: '',
      current: ['app'],
      wordVisible: false,
      drawerVisible: false,
      words: []
    }
  },
  methods: {
    getDate(time) {
      var day1 = new Date();
      day1.setTime(time);
      return day1.getFullYear()+"-" + (day1.getMonth()+1 > 9 ? day1.getMonth()+1 : '0' + (day1.getMonth()+1)) + "-" + day1.getDate();
    },
    menuChange({key }) {
      if (key === 'yesturday') {
        this.drawerChange();
      }
    },
    onDateChange(date, dateString) {
      this.getDateWords(dateString)
    },
    drawerChange() {
      this.drawerVisible = !this.drawerVisible
      if (!this.drawerVisible) {
        this.current = ['app']
      }
    },
    getDateWords(date) {
      this.words = this.wordList.filter(item => {
        return item.first_read_time === date
      })
    },
    getWords() {
      const index = parseInt(Math.random()*(this.wordList.length+1),10)
      const {first_read_time} = this.wordList[index]
      if (!first_read_time) {
        this.word = this.wordList[index]
        return {
          word: this.word,
          index
        }
      } else {
        this.getWords()
      }
    },
    forget() {
      this.getWords()
      this.wordVisible = false
      localStorage.clear()
    },
    async remember() {
      const {word, index} = this.getWords()
      this.wordVisible = false
      if (word.first_read_time) {
        word.update_read_time = this.getDate(new Date().getTime())
      } else {
        word.first_read_time = this.getDate(new Date().getTime())
        word.update_read_time = this.getDate(new Date().getTime())
      }
      this.wordList[index] = word
      await localStorage.setItem('word-list', JSON.stringify(this.wordList))
    }
  },
  async beforeCreate() {
    const wordList = await localStorage.getItem('word-list')
    if (wordList) {
      this.wordList = JSON.parse(wordList)
    } else {
      const {data = ''} = await axios.get(`${window.location.href}/word-list.json`);
      this.wordList = data
      await localStorage.setItem('word-list', JSON.stringify(data))
    } 
    // this.getDateWords('2021-04-15')
    this.date = moment().format(this.getDate(new Date().getTime()-24*60*60*1000))
    this.words = this.getDateWords(this.getDate(new Date().getTime()-24*60*60*1000))
    this.getWords()
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
.button-word{
  position: fixed !important;
  right: 16px;
  bottom: 10px;
}
.content{
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-top: 220px;
}
</style>
fasfsa