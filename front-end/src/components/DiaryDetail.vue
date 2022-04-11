<template>
    <va-modal
        v-model="state.detailVisible"
        no-outside-dismiss
        hide-default-actions
        max-height="100%"
        max-width="100%"
    >
        <div class="modal">
            <div class="modal-header">
                <va-button
                    class="modal-btn"
                    color="#6565ca"
                    icon="clear"
                    @click="clickRefresh"
                ></va-button>
            </div>

            <div class="modal-content">
                <video
                    class="mx-3 my-5 recorded-video"
                    :src="diaryContent.videoLink"
                    :poster="diaryContent.videoLink.replace('mp4', 'jpg')"
                    controls
                ></video>
                <!-- <section class="mx-3 my-5 video" @click="moveRecordingVideo"></section> -->
                <section class="mx-3 my-5 contain">
                    <va-tabs v-model="state.value" color="#5959be">
                        <template #tabs>
                            <va-tab
                                v-for="tab in ['Contents', 'Emotions']"
                                :key="tab"
                            >
                                {{ tab }}
                            </va-tab>
                            <div>{{ state.value }}</div>
                        </template>
                    </va-tabs>
                    <div v-if="state.value === 1">
                        <div class="text-container">
                            <div>
                                <!-- 
                                        @moveContent="moveContent"
                                    " -->
                                <DiaryDetailText
                                    class="front"
                                    :diaryContentDetail="
                                        state.diaryContentDetail
                                    "
                                />
                            </div>
                            <!-- <div>
                                <Buttons btn-text="수정" />
                            </div> -->
                        </div>
                    </div>
                    <div v-else-if="state.value === 2">
                        <DiaryDetailEmotion
                        class="back"
                        :diaryContentDetail="state.diaryContentDetail"/>
                    </div>
                </section>
            </div>
        </div>
    </va-modal>
</template>

<script>
import { computed, reactive } from "vue";
import Buttons from "@/components/Buttons.vue";
import DiaryDetailText from "@/components/DiaryDetailText.vue";
import DiaryDetailEmotion from "@/components/DiaryDetailEmotion.vue";

export default {
    name: "DiaryDetail",

    props: {
        move: {
            type: Boolean,
            default: false,
            tab: true,
        },
        diaryContent: {
            type: Object,
        },
        recordingUrl: {
            type: String,
        },
    },
    components: {
        Buttons,
        DiaryDetailText,
        DiaryDetailEmotion,
    },
    methods: {
        clickRefresh() {
            this.$router.go();
            console.log(window.location.pathname);
            console.log("새로고침");
        },
    },
    setup(props, { emit }) {
        const state = reactive({
            detailVisible: computed(() => props.move),
            contentVisible: false,
            value: 1,
            diaryContentDetail: computed(() => props.diaryContent),

        });

        const closeDetail = function () {
            state.value = 1;
            emit("closeDetail");
        };

        const moveContent = function () {
            state.contentVisible = !state.contentVisible;
        };

        const moveRecordingVideo = function () {
            console.log(props.recordingUrl);
            window.open(props.recordingUrl, "_blank");
        };

        const moveEmotion = function () {
            let card = document.querySelector(".detail-container");
            if (card.style.transform == "rotateY(180deg)") {
                card.style.transform = "rotateY(0deg)";
            } else {
                card.style.transform = "rotateY(180deg)";
            }
        };
        return {
            state,
            closeDetail,
            moveContent,
            moveEmotion,
            moveRecordingVideo,
        };
    },
};
</script>

<style scoped>
.modal {
    width: 90vw;
    height: 85vh;
}

.modal-header {
    display: flex;
}

.modal-btn {
    margin-left: auto;
}

.modal-content {
    display: flex;
    justify-content: center;
    margin-top: 1vw;
}

.recorded-video {
    display: block;
    width: 45vw;
    height: 55vh;
}
.contain {
    display: block;
    width: 30vw;
    height: 55vh;
    /* background: rgb(228, 228, 228); */
}

/* .card{    */
/*webkit을 사용해야지 사파리에서도 정상적으로 동작함*/
/* -webkit-backface-visibility: hidden; 
.card{   */
/*webkit을 사용해야지 사파리에서도 정상적으로 동작함*/
/* -webkit-backface-visibility: hidden; 
    -webkit-transform: translate3d(0,0,0); 
    -webkit-perspective: 0; 
    -webkit-transition: 1s; 
    backface-visibility: hidden; /*뒷면 숨기기*/
/* visibility: visible; 
    transition: 1s; 
}  

.front { 
    position: absolute;
    transform: rotateY(0deg); 
} 

.back { 
    transform: rotateY(-180deg); 
} 

.container:hover .front {  */
/*y축을 기준으로 180도까지회전*/
/* transform: rotateY(180deg); 
} 

.container:hover .back {  */
/*y축을 기준으로 0도 까지회전*/
/* transform: rotateY(0deg);
} */

.detail-container {
    perspective: 100rem;
    transition: transform 1s;
    transform-style: preserve-3d;
    cursor: pointer;
    background: #ffffff;
}

.front {
    position: absolute;
    transform: rotateY(0deg);
}

.back {
    transform: rotateY(0deg);
}

.detail-btns {
    display: flex;
    justify-content: flex-end;
}

.text-container {
    /* display: flex; */
}
</style>
