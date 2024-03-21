<template>
  <div>
    <div>
      <div>抢哪个！</div>
      <div v-for="(item) in detailList" :key="item.spu_id">
        <label @click="checkuuid(item.skus[0].uuid)" :for="item.spu_id">{{item.title}}<input class="checksku" :id="item.spu_id" :value="item.skus[0].uuid" type="checkbox"></label>
        <span>数量{{item.stock}}</span>
        <span>价格{{item.price}}</span>
      </div>
    </div>
    <button @click="getWeibo">微博监控</button>
    <button @click="getFrist">请求数据1</button>
    <button @click="goStart">开始抢购</button>
  </div>
  <audio controls ref="audio" class="aud">
    <source src="./assets/2929593989.mp3" />
  </audio>
</template>

<script setup>
import { ref,reactive } from 'vue'
import HelloWorld from './components/HelloWorld.vue'
import axios from 'axios'
const params = reactive({})
function ajax({ method = 'POST', url = '', params = {}, token = '',uid = '', host = "/api", headers = {} }) {
    method = method.toUpperCase()
    url = host + url
    return new Promise((resolve, reject) => {
        let baseHeaders = {
            'Content-Type': 'application/json;charset=UTF-8',
        }
        if (token) {
          baseHeaders['X-Auth-Token'] = token
          baseHeaders['X-Timestamp'] = new Date().getTime()
          baseHeaders['X-Nonce'] = 'PmHwbMiDpriX'
        }
        if (uid) {
          baseHeaders.uid = uid
        }
        let opt = {
            method: method,
            url: url,
            timeout: 1000 * 60,
            headers: Object.assign(baseHeaders, headers)
        } 
        if (method === 'POST'){
            opt.data = params
        } else if (method === 'GET') {
            opt.params = params
        }
        axios( opt )
        .then((res) => {
          resolve(res.data)
        })
        .catch((err) => {
            reject(err.data);
        })
    })
}
function getJson({ method = 'POST', url = '', params = {}, token = '',uid = '', host = "/api", headers = {} }) {
  return new Promise((resolve, reject)=>{
    ajax({ method, url, params, token, uid, host, headers }).then(data => resolve(data)).catch(err => reject(err))
  })
}
// 请求微博
let newMessage = reactive({
  messageList:[] //微博消息列表
})
const audio = ref(null)
let messageId = ref('')
function getWeibo() {
  getJson({
    method: 'get',
    host: '/weibo',
    url: '/2/profile/statuses?containerid=1076036614019582&gsid=_2AuZuilCKpZYuRwtW6348d4EHbVnAm2Jd1pce2x33IKl9B9C5DmfYsr59THQXiYQcrLlXUzLC1C1KhWaQFZ2NT2dd0lri&from=1885396040&wm=90163_90001&c=weixinminiprogram&s=b68afbcd&lang=zh_CN&page=1',
  }).then((res) => {
      console.log(res.cards);
      if (messageId.value && messageId.value != res.cards[1].profile_type_id) {
        audio.value.play()
        clearInterval(timer)
      }
      newMessage.messageList = res.cards
      messageId.value = res.cards[1].profile_type_id
    })
  let timer = setInterval(() => {
    getJson({
      method: 'get',
      host: '/weibo',
      url: '/2/profile/statuses?containerid=1076036614019582&gsid=_2AuZuilCKpZYuRwtW6348d4EHbVnAm2Jd1pce2x33IKl9B9C5DmfYsr59THQXiYQcrLlXUzLC1C1KhWaQFZ2NT2dd0lri&from=1885396040&wm=90163_90001&c=weixinminiprogram&s=b68afbcd&lang=zh_CN&page=1',
    }).then((res) => {
      console.log(res.cards);
      if (messageId.value && messageId.value != res.cards[1].profile_type_id) {
        audio.value.play()
        clearInterval(timer)
      }
      newMessage.messageList = res.cards
      messageId.value = res.cards[1].profile_type_id
    })
  }, 30000);
}


let detailList = ref([])
let groupon_id = ref('')
function getData(uuid) {
  getJson({
    method: 'get',
    host: '/api',
    url: '/api/v1/common/groupon/item/batch?groupon_uuid='+uuid+'&size=20&page=1&query=&state=1',
    token: 'SDf6cZsR+tvTf71DXULNhw==',
  }).then((res) => {
      console.log(res.data.lst);
      // 详情列表
      detailList.value  = res.data.list
      getFreight(uuid,detailList.value[0].skus[0].uuid)
      getaddress()
  })
}
function getFrist() {
  getJson({
    method: 'get',
    host: '/api',
    url: '/api/common/getViewedGroupons?page=1&query=&size=10&=r'+ Math.random(),
    token: 'SDf6cZsR+tvTf71DXULNhw==',
  }).then((res) => {
      let list = res.data.lst
      let uuid = list[0].uuid
      groupon_id.value = list[0].uuid
      getData(uuid)
  })
}
function checkuuid(uuid) {

}

// 请求运费
function getFreight(uuid,uuid1) {
  getJson({
    method: 'post',
    host: '/api',
    url: '/api/common/previewOrderFreight?',
    token: 'SDf6cZsR+tvTf71DXULNhw==',
    params:{"groupon_id":uuid,"items":[{"uuid":uuid1,"count":1}]}
  }).then((res) => {
    console.log('运费',res.data.freight);
  })
}
// 请求默认地址
let address = ref({})
function getaddress(uuid,uuid1) {
  getJson({
    method: 'get',
    host: '/api',
    url: '/api/v1/address/receiver/default?',
    token: 'SDf6cZsR+tvTf71DXULNhw==',
  }).then((res) => {
    address.value = res.data
  })
}
// 创建订单
function goStart() {
  let checkskuList = document.querySelectorAll('.checksku')
  let checksku = []
  checkskuList.forEach((item,index)=>{
    let checked = item.checked
    if (checked) {
      checksku.push({"uuid":item.value,"count":1})
    }
  })
  let timer = setInterval(() => {
    if (new Date().getTime() >= 1711026000000) {
      clearInterval(timer)
      for (let index = 0; index < 20; index++) {
        creatOrder(checksku)
      }
    }
  }, 10);
}

// 创建订单
function creatOrder(checksku) {
  getJson({
    method: 'post',
    host: '/api',
    url: '/api/common/asyncCreateOrder?',
    token: 'SDf6cZsR+tvTf71DXULNhw==',
    params:{
      "groupon_id": groupon_id.value,
      "user_address": {
          "uuid": address.value.address_uuid,
          "nickname": address.value.name,
          "tel": address.value.tel,
          "area": address.value.province+'/'+address.value.city+'/'+address.value.area,
          "detail": address.value.address
      },
      "user_address_id": address.value.address_uuid,
      "remark": "111",
      "items": checksku,
      "pay_type": "",
      "coupon_id": "",
      "opt_delivery": 1
  },
  }).then((res) => {
   if (res.code != 20000) {
    creatOrder(checksku)
   }
  })
}

</script>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
