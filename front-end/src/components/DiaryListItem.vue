<template>
  <div class="flex md3">
    <va-card @click="onOpenDetail" class="item" style="margin: 0.75rem;">
      <va-image
        :src=diary.thumbnail
        style="height: 200px;"/>
      
      <!-- <va-image
        src="https://picsum.photos/400/200"
        style="height: 200px;"
      /> -->
      <!-- <va-card-title>{{diary.title}}</va-card-title> -->
      <va-card-content>제목 : {{diary.title}}</va-card-content>
      <va-card-content>작성일 : {{diary.create_date}}</va-card-content>
    </va-card>
  </div>
  <DiaryDetail 
    :move="openDetail"
    :diaryContent="diaryContent"
    @closeDetail="this.openDetail = !this.openDetail"/>
</template>

<script>
import DiaryDetail from '@/components/DiaryDetail.vue'
import axios from 'axios'

export default {
    name:'DiaryListItem',
    props: {
      diary: {
        type: Object,
      }
    },
    components: {
      DiaryDetail
    },
    data(){
      return{
        openDetail: false,
        diaryContent: []
      };
    },
    methods:{
      onOpenDetail () {
        this.openDetail = !this.openDetail
        console.log(this.diary)
        // axios.get('https://d373f615-141e-4add-8fb7-910b49246039.mock.pstmn.io/diarydetail')
        axios.get(`https://eab5b3d9-43de-4dee-bee6-77ceb04377eb.mock.pstmn.io/diary/${this.diary.diary_id}`)
        .then(response => {
          this.diaryContent = response.data
        })
    }
  }
}
</script>

<style>
</style>