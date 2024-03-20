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
    <button @click="startGo">开始抢购</button>
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
          baseHeaders.token = token
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
function getData(grouponid) {
  getJson({
    method: 'get',
    host: '/api',
    url: '/api/common/getGrouponSpus?groupon_id='+grouponid+'&size=40&page=1&query=&state=1&category=undefined&r='+ Math.random(),
    token: 'db2e42dafb3e4f4468b43756b7ef9e72',
    uid:'usr1647753967996159148'
  }).then((res) => {
      console.log(res.data.lst);
      // 详情列表
      detailList.value  = res.data.lst
  })
}
function getFrist() {
  getJson({
    method: 'get',
    host: '/api',
    url: '/api/user/groupons/viewed?page=1&query=&size=1&=r'+ Math.random(),
    token: '470bfeb2803c8417603b41cc07322247',
    uid:'usr1674136047649579902'
  }).then((res) => {
      let list = res.data.lst
      groupon_id = list[0].stast.groupon_id
      getData(groupon_id)
    
  })
}
function checkuuid(uuid) {

}
let flag = ref(false)
function startGo() {
  flag = true
  let checkskuList = document.querySelectorAll('.checksku')
  let checksku = []
  checkskuList.forEach((item,index)=>{
    let checked = item.checked
    if (checked) {
      checksku.push({"uuid":item.value,"count":1})
    }
  })
  if (checksku.length ==1 ) {
    for (let index = 500; index < 1; index++) {
      getJson({
        method: 'post',
        host: '/api',
        url: '/api/common/asyncCreateOrder?',
        token: '34b8d7a20e2385d983dc5805b771203d',
        uid:'usr1660312392831411543',
        headers:{
          authorized:'1'
        },
        params:{
          "groupon_id":groupon_id,
          "user_address":{"uuid":"84a5705e837d44839a23a90845f6205a","user_id":"usr1660312392831411543","nickname":"呜哇嘿","tel":"16643563081","area":"上海市/上海市/闵行区","detail":"红松路700弄龙柏二村252-501","is_default":1,"create_time":"2023-02-27 12:01:15"},
          "user_address_id":"",
          "remark":"1",
          "pickup":{},
          "contact":"",
          "items":checksku,
          "pay_type":"",
          "coupon_id":""
        }
      })
      getJson({
        method: 'post',
        host: '/api',
        url: '/api/common/asyncCreateOrder?',
        token: 'd7f2f64a9cb872a48e6b454b4257c3e1',
        uid:'usr1675859798427933889',
        headers:{
          authorized:'1'
        },
        params:{
          "groupon_id":groupon_id,
          "user_address":{"uuid":"cd5667d01c8044c1befe2affdb136bdf","user_id":"usr1675859798427933889","nickname":"小鱼丸","tel":"18050553610","area":"上海市/上海市/浦东新区","detail":"东明路街道凌兆路530弄小区59号楼401","is_default":1,"create_time":"2023-05-06 13:04:50"},
          "user_address_id":"",
          "remark":"1",
          "pickup":{},
          "contact":"",
          "items":checksku,
          "pay_type":"",
          "coupon_id":""
        }
      })
    }
  }else if (checksku.length == 2) {
    for (let index = 0; index < 500; index++) {
      let checksku1 = checksku.slice(0,1)
      let checksku2 = checksku.slice(1,2)
      getJson({
        method: 'post',
        host: '/api',
        url: '/api/common/asyncCreateOrder?',
        token: '34b8d7a20e2385d983dc5805b771203d',
        uid:'usr1660312392831411543',
        headers:{
          authorized:'1'
        },
        params:{
          "groupon_id":groupon_id,
          "user_address":{"uuid":"84a5705e837d44839a23a90845f6205a","user_id":"usr1660312392831411543","nickname":"呜哇嘿","tel":"16643563081","area":"上海市/上海市/闵行区","detail":"红松路700弄龙柏二村252-501","is_default":1,"create_time":"2023-02-27 12:01:15"},
          "user_address_id":"",
          "remark":"1",
          "pickup":{},
          "contact":"",
          "items":checksku1,
          "pay_type":"",
          "coupon_id":""
        }
      })
      getJson({
        method: 'post',
        host: '/api',
        url: '/api/common/asyncCreateOrder?',
        token: 'd7f2f64a9cb872a48e6b454b4257c3e1',
        uid:'usr1675859798427933889',
        headers:{
          authorized:'1'
        },
        params:{
          "groupon_id":groupon_id,
          "user_address":{"uuid":"cd5667d01c8044c1befe2affdb136bdf","user_id":"usr1675859798427933889","nickname":"小鱼丸","tel":"18050553610","area":"上海市/上海市/浦东新区","detail":"东明路街道凌兆路530弄小区59号楼401","is_default":1,"create_time":"2023-05-06 13:04:50"},
          "user_address_id":"",
          "remark":"1",
          "pickup":{},
          "contact":"",
          "items":checksku2,
          "pay_type":"",
          "coupon_id":""
        }
      })
      // getJson({
      //   method: 'post',
      //   host: '/api',
      //   url: '/api/common/asyncCreateOrder?',
      //   token: 'db2e42dafb3e4f4468b43756b7ef9e72',
      //   uid:'usr1647753967996159148',
      //   headers:{
      //     authorized:'1'
      //   },
      //   params:{
      //     "groupon_id":groupon_id,
      //     "user_address":{"uuid":"8c42b82a45204b7aba1825a627570e1d","user_id":"usr1647753967996159148","nickname":"玲珑","tel":"18050553610","area":"上海市/上海市/闵行区","detail":"吴宝路139弄汇宝公寓","is_default":1,"create_time":"2022-12-12 14:40:25"},
      //     "user_address_id":"",
      //     "remark":"1",
      //     "pickup":{},
      //     "contact":"",
      //     "items":checksku2,
      //     "pay_type":"",
      //     "coupon_id":""
      //   }
      // })
      // getJson({
      //   method: 'post',
      //   host: '/api',
      //   url: '/api/common/asyncCreateOrder?',
      //   token: '34b8d7a20e2385d983dc5805b771203d',
      //   uid:'usr1660312392831411543',
      //   headers:{
      //     authorized:'1'
      //   },
      //   params:{
      //     "groupon_id":groupon_id,
      //     "user_address":{"uuid":"84a5705e837d44839a23a90845f6205a","user_id":"usr1660312392831411543","nickname":"呜哇嘿","tel":"16643563081","area":"上海市/上海市/闵行区","detail":"红松路700弄龙柏二村252-501","is_default":1,"create_time":"2023-02-27 12:01:15"},
      //     "user_address_id":"",
      //     "remark":"1",
      //     "pickup":{},
      //     "contact":"",
      //     "items":checksku2,
      //     "pay_type":"",
      //     "coupon_id":""
      //   }
      // })
    }
  }else if (checksku.length == 3) {
    for (let index = 0; index < 500; index++) {
      let checksku1 = checksku.slice(0,1)
      let checksku2 = checksku.slice(1,2)
      let checksku3 = checksku.slice(2,3)
      getJson({
        method: 'post',
        host: '/api',
        url: '/api/common/asyncCreateOrder?',
        token: 'db2e42dafb3e4f4468b43756b7ef9e72',
        uid:'usr1647753967996159148',
        headers:{
          authorized:'1'
        },
        params:{
          "groupon_id":groupon_id,
          "user_address":{"uuid":"8c42b82a45204b7aba1825a627570e1d","user_id":"usr1647753967996159148","nickname":"玲珑","tel":"18050553610","area":"上海市/上海市/闵行区","detail":"吴宝路139弄汇宝公寓","is_default":1,"create_time":"2022-12-12 14:40:25"},
          "user_address_id":"",
          "remark":"1",
          "pickup":{},
          "contact":"",
          "items":checksku1,
          "pay_type":"",
          "coupon_id":""
        }
      })
      getJson({
        method: 'post',
        host: '/api',
        url: '/api/common/asyncCreateOrder?',
        token: '34b8d7a20e2385d983dc5805b771203d',
        uid:'usr1660312392831411543',
        headers:{
          authorized:'1'
        },
        params:{
          "groupon_id":groupon_id,
          "user_address":{"uuid":"84a5705e837d44839a23a90845f6205a","user_id":"usr1660312392831411543","nickname":"呜哇嘿","tel":"16643563081","area":"上海市/上海市/闵行区","detail":"红松路700弄龙柏二村252-501","is_default":1,"create_time":"2023-02-27 12:01:15"},
          "user_address_id":"",
          "remark":"1",
          "pickup":{},
          "contact":"",
          "items":checksku2,
          "pay_type":"",
          "coupon_id":""
        }
      })
      getJson({
        method: 'post',
        host: '/api',
        url: '/api/common/asyncCreateOrder?',
        token: '470bfeb2803c8417603b41cc07322247',
        uid:'usr1674136047649579902',
        headers:{
          authorized:'1'
        },
        params:{
          "groupon_id":groupon_id,
          "user_address":{"uuid":"10959be1a66f410f8f9448176bebfabc","user_id":"usr1674136047649579902","nickname":"兔子强盗","tel":"17701269964","area":"上海市/上海市/闵行区","detail":"新龙路558弄号西郊英园","is_default":1,"create_time":"2023-02-27 12:02:16"},
          "user_address_id":"",
          "remark":"1",
          "pickup":{},
          "contact":"",
          "items":checksku3,
          "pay_type":"",
          "coupon_id":""
        }
      })
    }
  }
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
