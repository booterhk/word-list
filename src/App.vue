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
      <a-menu-item key="class">
      <a-dropdown :trigger="['click']">
          <a class="ant-dropdown-link" @click="e => e.preventDefault()">
             <a-icon type="mail" /> {{currentClass ? currentClass : '班级'}} <a-icon type="down" />
          </a>
          <a-menu slot="overlay" @click="handleClassMenuClick">
            <a-menu-item :key="item+','+index" v-for="(item,index) in classList">
              <span style="">{{item}}</span>
            </a-menu-item>
            <a-menu-item key='add'>
              <a class="ant-dropdown-link" @click="classVisible = !classVisible">
                <a-icon type="plus" /> 新增
              </a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </a-menu-item>
    </a-menu>
    <a-modal v-model="classVisible" title="新增班级" ok-text="确认" cancel-text="取消" @ok="onAddClass">
      <a-input
        placeholder="请输入班级名称"
        v-model='classname'
      />
    </a-modal>
    <a-drawer
      width='360'
      placement="right"
      :visible="drawerVisible"
      :closable="false"
      @close="drawerChange"
    >
      <div slot="title">
        <a-dropdown>
          <a class="ant-dropdown-link" @click="e => e.preventDefault()">
            {{remember.value}} <a-icon type="down" />
          </a>
          <a-menu slot="overlay" @click="handleMenuClick">
            <a-menu-item key="1">
              <span>记住的</span>
            </a-menu-item>
            <a-menu-item key="0">
              <span>没记住</span>
            </a-menu-item>
            <a-menu-item key="all">
              <span>全部</span>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
        <a-date-picker v-model='date' :locale="locale" placeholder='请选择日期' style="float: right" @change="onDateChange" />
      </div>
      <a-list bordered :data-source="filterWords">
        <a-list-item slot="renderItem" :key="index" slot-scope="item, index">
          <span :style="`color: ${item.remember ? 'black' : 'red'}`">{{ item.word }}</span>
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
        <a-button style="margin-right: 20px;margin-top: 16px" type="info" @click="unkown">没记住,下一个</a-button>
        <a-button type="primary" @click="kown">记住了,下一个</a-button>
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
      remember: {key: '0', value: '没记住'},
      drawerVisible: false,
      words: [],
      filterWords: [],
      // 班级
      classVisible: false,
      classname: '',
      currentClass: '',
      classList: []
    }
  },
  methods: {
    getDate(time) {
      var day1 = new Date();
      day1.setTime(time);
      return day1.getFullYear()+"-" + (day1.getMonth()+1 > 9 ? day1.getMonth()+1 : '0' + (day1.getMonth()+1)) + "-" + (day1.getDate() > 9 ? day1.getDate() : '0' + (day1.getDate()));
    },
    async onAddClass() {
      if (!this.classList.find(item => item === this.classname)) {
        this.classList.push(this.classname)
        const {data = ''} = await axios.get(`${window.location.href}/word-list.json`);
        this.wordList = {words:data, class: this.classname}
        this.currentClass = this.classname
        await localStorage.setItem(`${this.classname}-word-list`, JSON.stringify({words:data, class: this.classname}))
        await localStorage.setItem('class', JSON.stringify(this.classList))
        this.getWords()
        this.classVisible = !this.classVisible
      } else {
        this.$message.error('当前班级已存在');
      }
    },
    async handleClassMenuClick({key }) {
      const [name, ] = key.split(',')
      if (name !== 'add') {
        this.currentClass = name
        const wordList = await localStorage.getItem(`${name}-word-list`);
        this.wordList = JSON.parse(wordList) 
        this.words = this.getDateWords(this.getDate(new Date().getTime()-24*60*60*1000))
      }
    },
    handleMenuClick({key }) {
      switch (key) {
        case 'all':
          this.remember = {key: 'all', value: '全部'}
          this.filterWords = this.words
          break;
        case '1':
          this.remember = {key: '1', value: '记住了'}
          this.filterWords = this.words?.filter(item => item.remember)
          break;
        case '0':
          this.remember = {key: '0', value: '没记住'}
          this.filterWords = this.words?.filter(item => !item.remember)
          break;
        default:
          break;
      }
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
      this.words = this.wordList?.words?.filter(item => {
      console.log('word getDateWords', item.first_read_time, date)

        return item.first_read_time === date
      })
      this.handleMenuClick({key: this.remember.key})
    },
    getWords() {
      const log = this.wordList?.words.find(item => !item.first_read_time)
      if (log) {
        if (this.currentClass) {
          const index = parseInt(Math.random()*(this.wordList?.words?.length+1),10)
          const {first_read_time} = this.wordList?.words[index] || ''
          if (!first_read_time && this.wordList?.words[index]) {
            this.word = this.wordList?.words[index]
            return {
              word: this.word,
              index
            }
          } else {
            this.getWords()
          }
        } else {
          this.$message.info('请先选择班级',1);
          return {
              word: '',
            }
        }
      } else {
        this.$message.success('恭喜，已经完成单词记忆',1);
      }
      
      
    },
    async unkown() {
      const {word = '', index} = this.getWords() || ''
      this.wordVisible = false
      if (word) {
        if (word.first_read_time) {
          word.update_read_time = this.getDate(new Date().getTime())
        } else {
          word.first_read_time = this.getDate(new Date().getTime())
          word.update_read_time = this.getDate(new Date().getTime())
        }
        word.remember = false;
        this.wordList.words[index] = word
        await localStorage.setItem(`${this.classname}-word-list`, JSON.stringify({words:this.wordList.words, class: this.classname}))
      }
    },
    async kown() {
      const {word = '', index} = this.getWords() || ''
      this.wordVisible = false
      if (word) {
        if (word?.first_read_time) {
          word.update_read_time = this.getDate(new Date().getTime())
        } else {
          word.first_read_time = this.getDate(new Date().getTime())
          word.update_read_time = this.getDate(new Date().getTime())
        }
        word.remember = true
        this.wordList.words[index] = word
        await localStorage.setItem(`${this.classname}-word-list`, JSON.stringify({words:this.wordList.words, class: this.classname}))
      }
    }
  },
  async beforeCreate() {
      // localStorage.clear()
    // const wordList = await localStorage.getItem('word-list');
    const classList = await localStorage.getItem('class')
    this.date = moment().format(this.getDate(new Date().getTime()-24*60*60*1000))
    if (classList) {
      this.classList = JSON.parse(classList);
      // if (wordList) {
      //   this.wordList = JSON.parse(wordList)
      // } else {
        // const {data = ''} = await axios.get(`${window.location.href}/word-list.json`);
        // this.wordList = data
        // await localStorage.setItem('word-list', JSON.stringify(data))
      // } 
      // this.words = this.getDateWords(this.getDate(new Date().getTime()-24*60*60*1000))
      // this.getWords()
    } else {
      this.classVisible = true
    }
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