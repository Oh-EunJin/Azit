<template>
  <div class="go-diary-container">
    <div class="left-btns">
      <!-- Left Buttons -->
      <!-- router 임의 설정, 나중에 바꿔서 해당 router로 push -->
      <Buttons btn-text="일기작성" @click="onOpenRecording" />
      <Buttons
        class="write-with-diary"
        btn-text="함께쓰기"
        @click="showWithModal = !showWithModal"
      />
    </div>

    <div class="right-btns">
     <!-- Search -->
        <div class="search">
          <input
            type="text" v-model="searchTitle"
            placeholder="내용을 입력해주세요." />
          <div @click="searchDiary" class="material-icons">
            search
          </div>
        </div>

      <!-- Right Buttons -->
      <Buttons class="search-filter" btn-text="필터" />
    </div>

    <!-- 일기 작성 modal -->
    <Recording
      :open="openRecording"
      @closeRecording="this.openRecording = !this.openRecording"
    />

    <!-- 함께 쓰기 modal -->
    <va-modal v-model="showWithModal" hide-default-actions>
      <b>추억을 저장 해보세요</b>
      <div class="group-btns">
        <WhiteButtons
          class="mx-2"
          white-btn-text="방생성"
          @click="onOpenRecording"
        />
        <Buttons class="mx-2" btn-text="방 검색" @click="MoveSearchModal" />
      </div>
    </va-modal>

    <!-- 방 생성 modal -->
    <GroupRecording
      :open="openRecording"
      :session="session"
      :publisher="publisher"
      :mainStreamManager="mainStreamManager"
      :subscribers="subscribers"
      @closeRecording="leaveSession"
      @recordingStart="recordingStart"
      @recordingStop="recordingStop"
    />
    <DiaryDetail
      :move="moveDiaryDetail"
      :diaryContent="diaryContent"
      :recordingUrl="recordingUrl"
      @closeDetail="this.moveDiaryDetail = !this.moveDiaryDetail"
    />
    <!-- 방 검색 modal -->
    <va-modal v-model="showSearchModal" hide-default-actions>
      <b>방에 참여 하시겠습니까?</b>
      <div class="search">
        <input
          v-model="roomCode"
          type="text"
          placeholder="내용을 입력해주세요."
        />
        <div class="material-icons">search</div>
      </div>
      <div class="group-btns">
        <WhiteButtons
          class="mx-2"
          white-btn-text="취소"
          @click="CloseSearchModal"
        />
        <Buttons class="mx-2" btn-text="참여하기" @click="joinGroup" />
      </div>
    </va-modal>
  </div>
</template>

<script>
import Buttons from "./Buttons.vue";
import WhiteButtons from "./WhiteButtons.vue";
import { OpenVidu } from "openvidu-browser";
import Recording from "./Recording.vue";
import GroupRecording from "./GroupRecording.vue";
import DiaryDetail from "./DiaryDetail.vue";
import axios from "axios";

axios.defaults.headers.post["Content-Type"] = "application/json";
// axios.defaults.baseURL = "/api/v1";
const OPENVIDU_SERVER_URL = "https://" + location.hostname + ":4443";
const OPENVIDU_SERVER_SECRET = "MY_SECRET";

export default {
  components: {
    Buttons,
    WhiteButtons,
    Recording,
    GroupRecording,
    DiaryDetail,
  },
  data() {
    return {
      openRecording: false,
      moveDiaryDetail: false,
      showWithModal: false,
      showSearchModal: false,
      searchTitle : '',
      joinGroupId : '',
      searchData : [],
      userId: "testUser", // sessionId를 userId로 대체
      recordingTest: null,
      recordingUrl: null,
      diaryContent: [],
      OV: undefined,
      session: undefined,
      mainStreamManager: undefined,
      publisher: undefined,
      subscribers: [],
      // sessionId: 'SessionA',
      roomCode: "", // roomCode는 방을 만든 사람의 userId값
      myName: "테스트 유저",
    };
  },
  methods: {
    /**
     * 함께쓰기 시 모달 창을 열고 Openvidu 세션을 생성하는 함수
     */
    onOpenRecording() {
      this.openRecording = !this.openRecording;
      this.createRoom();
    },
    MoveSearchModal() {
      this.showSearchModal = !this.showSearchModal;
      this.showWithModal = !this.showWithModal;
    },
    CloseSearchModal() {
      this.showSearchModal = !this.showSearchModal;
      console.log(this.showSearchModal);
    },
    async searchDiary(){
      this.searchData = await this.api('https://15f8ee3f-349a-4cf2-86ef-1f8c61ec2767.mock.pstmn.io/api/diary/'+this.searchTitle,'get',{}) //url
      console.log(this.searchTitle);
      console.log(this.searchData);
    },
    joinGroup() {
      this.openRecording = !this.openRecording;
      this.joinSession(this.roomCode);

      // this.productList = await this.api("/sample", "post", {
      //   userId: this.userId,
      // });
      // console.log(this.productList);
    },
    /**
     * 함께쓰기 방 생성 함수
     */
    createRoom() {
      this.joinSession(this.userId);
    },
    /* Openvidu API 시작 */
    joinSession(roomCode) {
      // --- Get an OpenVidu object ---
      this.OV = new OpenVidu();

      // --- Init a session ---
      this.session = this.OV.initSession();

      // --- Specify the actions when events take place in the session ---

      // On every new Stream received...
      this.session.on("streamCreated", ({ stream }) => {
        const subscriber = this.session.subscribe(stream);
        this.subscribers.push(subscriber);
      });

      // On every Stream destroyed...
      this.session.on("streamDestroyed", ({ stream }) => {
        const index = this.subscribers.indexOf(stream.streamManager, 0);
        if (index >= 0) {
          this.subscribers.splice(index, 1);
        }
      });

      // On every asynchronous exception...
      this.session.on("exception", ({ exception }) => {
        console.warn(exception);
      });

      // --- Connect to the session with a valid user token ---

      // 'getToken' method is simulating what your server-side should do.
      // 'token' parameter should be retrieved and returned by your own backend
      // sessionId를 userId로 대체
      this.getToken(roomCode).then((token) => {
        this.session
          .connect(token, { clientData: this.myUserName })
          .then((res) => {
            // --- Get your own camera stream with the desired properties ---
            console.log(res)
            let publisher = this.OV.initPublisher(undefined, {
              audioSource: undefined, // The source of audio. If undefined default microphone
              videoSource: undefined, // The source of video. If undefined default webcam
              publishAudio: true, // Whether you want to start publishing with your audio unmuted or not
              publishVideo: true, // Whether you want to start publishing with your video enabled or not
              resolution: "640x480", // The resolution of your video
              frameRate: 30, // The frame rate of your video
              insertMode: "APPEND", // How the video is inserted in the target element 'video-container'
              mirror: false, // Whether to mirror your local video or not
            });

            this.mainStreamManager = publisher;
            this.publisher = publisher;

            // --- Publish your stream ---

            this.session.publish(this.publisher);
            // openRecording: false,
            //             showWithModal: false,
            //             showSearchModal: false,
            //             userId: "testUser", // sessionId를 userId로 대체

            //             OV: undefined,
            //             session: undefined,
            //             mainStreamManager: undefined,
            //             publisher: undefined,
            //             subscribers: [],
            //             // sessionId: 'SessionA',
            //             roomCode: "", // roomCode는 방을 만든 사람의 userId값
            //             myName: "테스트 유저"
            console.log(this.openRecording);
            console.log(this.OV);
            console.log(this.session);
          })
          .catch((error) => {
            console.log(
              "There was an error connecting to the session:",
              error.code,
              error.message
            );
          });
      });

      window.addEventListener("beforeunload", this.leaveSession);
    },

    leaveSession() {
      // --- Leave the session by calling 'disconnect' method over the Session object ---
      if (this.session) this.session.disconnect();

      this.openRecording = !this.openRecording;
      this.session = undefined;
      this.mainStreamManager = undefined;
      this.publisher = undefined;
      this.subscribers = [];
      this.OV = undefined;

      window.removeEventListener("beforeunload", this.leaveSession);
    },
    recordingStart() {
      // console.log("녹화 시작");
      // Face API 시작
      axios
        .post(
          `${OPENVIDU_SERVER_URL}/openvidu/api/recordings/start`,
          {
            session: "testUser",
          },
          {
            auth: {
              username: "OPENVIDUAPP",
              password: OPENVIDU_SERVER_SECRET,
            },
          }
        )
        .then((res) => {
          console.log(res);
          this.recordingTest = res.data.id;
        });
    },
    recordingStop() {
      axios
        .post(
          `${OPENVIDU_SERVER_URL}/openvidu/api/recordings/stop/${this.recordingTest}`,
          {},
          {
            auth: {
              username: "OPENVIDUAPP",
              password: OPENVIDU_SERVER_SECRET,
            },
          }
        )
        .then((res) => {
          console.log(res);
          console.log(res.data.url);
          this.recordingUrl = res.data.url;
          this.leaveSession();
          axios.get(`https://eab5b3d9-43de-4dee-bee6-77ceb04377eb.mock.pstmn.io/diary/1`)
          .then(response => {
            this.diaryContent = response.data
          })
          this.moveDiaryDetail = !this.moveDiaryDetail;
          // this.recordingUrl =
          //   "https://localhost:4443/openvidu/recordings/testUser-20/testUser-20.mp4";
        });
      // this.leaveSession();
      // this.moveDiaryDetail = !this.moveDiaryDetail;
    },

    updateMainVideoStreamManager(stream) {
      if (this.mainStreamManager === stream) return;
      this.mainStreamManager = stream;
    },

    /**
     * --------------------------
     * SERVER-SIDE RESPONSIBILITY
     * --------------------------
     * These methods retrieve the mandatory user token from OpenVidu Server.
     * This behavior MUST BE IN YOUR SERVER-SIDE IN PRODUCTION (by using
     * the API REST, openvidu-java-client or openvidu-node-client):
     *   1) Initialize a Session in OpenVidu Server	(POST /openvidu/api/sessions)
     *   2) Create a Connection in OpenVidu Server (POST /openvidu/api/sessions/<SESSION_ID>/connection)
     *   3) The Connection.token must be consumed in Session.connect() method
     */

    getToken(roomCode) {
      return this.createSession(roomCode).then((sessionId) =>
        this.createToken(sessionId)
      );
    },

    // See https://docs.openvidu.io/en/stable/reference-docs/REST-API/#post-openviduapisessions
    createSession(roomCode) {
      return new Promise((resolve, reject) => {
        axios
          .post(
            `${OPENVIDU_SERVER_URL}/openvidu/api/sessions`,
            JSON.stringify({
              customSessionId: roomCode,
            }),
            {
              auth: {
                username: "OPENVIDUAPP",
                password: OPENVIDU_SERVER_SECRET,
              },
            }
          )
          .then((response) => response.data)
          .then((data) => resolve(data.id))
          .catch((error) => {
            if (error.response.status === 409) {
              resolve(roomCode);
            } else {
              console.warn(
                `No connection to OpenVidu Server. This may be a certificate error at ${OPENVIDU_SERVER_URL}`
              );
              if (
                window.confirm(
                  `No connection to OpenVidu Server. This may be a certificate error at ${OPENVIDU_SERVER_URL}\n\nClick OK to navigate and accept it. If no certificate warning is shown, then check that your OpenVidu Server is up and running at "${OPENVIDU_SERVER_URL}"`
                )
              ) {
                location.assign(`${OPENVIDU_SERVER_URL}/accept-certificate`);
              }
              reject(error.response);
            }
          });
      });
    },

    // See https://docs.openvidu.io/en/stable/reference-docs/REST-API/#post-openviduapisessionsltsession_idgtconnection
    createToken(roomCode) {
      return new Promise((resolve, reject) => {
        axios
          .post(
            `${OPENVIDU_SERVER_URL}/openvidu/api/sessions/${roomCode}/connection`,
            {},
            {
              auth: {
                username: "OPENVIDUAPP",
                password: OPENVIDU_SERVER_SECRET,
              },
            }
          )
          .then((response) => response.data)
          .then((data) => resolve(data.token))
          .catch((error) => reject(error.response));
      });
    },
    /* openVidu API 끝 */

    // async api(url, method, data) {
    //   return (
    //     await axios({
    //       method: method,
    //       url: url,
    //       data: data,
    //     }).catch((e) => {
    //       console.log(e);
    //     })
    //   ).data;
    // },
  },
};
</script>

<style scoped>
.go-diary-container {
  display: flex;
  justify-content: space-between;
}

.left-btns {
  display: inline-flex;
}

.write-with-diary {
  margin-left: 20px;
}

.right-btns {
  display: flex;
}

.search-filter {
  margin-left: 20px;
}

.search {
  position: relative;
  height: 34px;
  vertical-align: middle;
  top: 20px;
}

.search-input {
  width: 200px;
  height: inherit;
  padding: 4px 10px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  border-radius: 5px;
  outline: none;
  background-color: #fff;
  color: #777;
  font-size: 12px;
}

.search-input:focus {
  width: 200px;
  border-color: #000080;
}

.search .material-icons {
  height: 24px;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 5px;
  margin: auto;
  cursor: pointer;
}

.search.focused .material-icons {
  opacity: 0;
}

.group-btns {
  display: flex;
  margin-top: 1.5rem;
}
</style>
