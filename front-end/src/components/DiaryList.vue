<template>
  <div>
    <div class="row">ㅇㅇㅇ
      <div class="flex md4 lg3">
        <diary-list-item/>
      </div>
  c
      <!-- <div class="flex md4 lg3" v-if="diarys.length"> 
        <diary-list-item
        v-for="(diary, index) in diarys"
        :key="index"
        v-bind="diary">
        </diary-list-item>
      </div>
      <div v-else> 
        게시글이 없습니다.
      </div> -->
    </div>
  </div>
</template>

<script>
import DiaryListItem from '@/components/DiaryListItem.vue'
import axios from "axios";


export default {
  components: {
    DiaryListItem
  },

  data(){
    return{
      diaryList : []
    };
  },
  methods:{
    newdiary(){
      this.$router.push({ name : 'Record'})
    },
    async getList() {
    this.diaryList = await this.$api("https://15f8ee3f-349a-4cf2-86ef-1f8c61ec2767.mock.pstmn.io/api/diarylist/1","get");
    console.log(this.diaryList)
  }
  },
  created() {
    axios.get('https://15f8ee3f-349a-4cf2-86ef-1f8c61ec2767.mock.pstmn.io/api/diarylist/1')
    .then(response => {
      this.diarys = response.data
      console.log(response.data)
    })

  }
};

</script>

<style>

</style>