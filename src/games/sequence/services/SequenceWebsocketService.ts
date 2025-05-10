// src/services/FindItWebSocketService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameService } from '../../../services/GameService';
import { webSocketService } from '../../../services/WebSocketService';
import { NavigationRefType } from '../../../navigation/navigationTypes';
import { WS_BASE_URL } from '../../../config';
import GameDetailScreen from '../../../screens/GameDetailScreen';
import { sequenceService } from './SequenceService';
import { sequenceViewModel } from './SequenceViewModel';

class SequenceWebSocketService {
  private accessToken: string | null = null;
  private userID: number | null = null;
  private roomID: number | null = null;
  private imageID: number | null = null;
  private round: number | null = null;
  private gameStarted: boolean = false;
  private password: string | null = null;
  async initialize() {
    this.accessToken = await AsyncStorage.getItem('accessToken');
    const storedUserID = await AsyncStorage.getItem('userID');

    if (!this.accessToken || !storedUserID) {
      console.error("❌ 액세스 토큰 또는 유저 ID가 없습니다.");
      return false;
    }

    this.userID = parseInt(storedUserID, 10);
    return true;
  }
  async connect() {
    // ✅ 기존 상태 초기화
    this.gameStarted = false;
    this.roomID = null;
    this.imageID = null;
    this.round = null;
    const isInitialized = await this.initialize();
    if (!isInitialized) return;

    const wsUrl = WS_BASE_URL + `/slime-war/v0.1/rooms/match/ws?tkn=${this.accessToken}`;
    webSocketService.connect(wsUrl, this.handleMessage);
    this.sendMatchEvent();
  }
  async togetherConnect() {
    // ✅ 기존 상태 초기화
    this.gameStarted = false;
    this.roomID = null;
    this.imageID = null;
    this.round = null;
    const isInitialized = await this.initialize();
    if (!isInitialized) return;

    const wsUrl = WS_BASE_URL + `/slime-war/v0.1/rooms/play/together/ws?tkn=${this.accessToken}`;
    webSocketService.connect(wsUrl, this.handleMessage);
    this.sendTogetherMatchEvent();
  }
  async joinConnect(password: string) {
    // ✅ 기존 상태 초기화
    this.gameStarted = false;
    this.roomID = null;
    this.imageID = null;
    this.round = null;
    const isInitialized = await this.initialize();
    if (!isInitialized) return;
    const wsUrl = WS_BASE_URL + `/slime-war/v0.1/rooms/play/join/ws?tkn=${this.accessToken}&password=${password}`;
    webSocketService.connect(wsUrl, this.handleMessage);
    console.log("password", password);
    this.sendJoinMatchEvent(password);
  }

  handleMessage = async (eventType: string, data: any) => {
    console.log("📩 서버 응답:", data);
    const navigation = webSocketService.getNavigation();

    try {
      // ✅ 유저 정보 업데이트 (정답 좌표 저장)
      if (data.users) {
        gameService.setUsers(data.users);
        // 맵 정보 저장
        sequenceViewModel.setGameMap(data.users);

        // 컬러타입 저장
        if (data.users.length === 2) {
          if (data.users[0].id === this.userID) {
            sequenceViewModel.setUserColorType(data.users[0].colorType);
            sequenceViewModel.setUserID(data.users[0].id);
            sequenceViewModel.setOpponentColorType(data.users[1].colorType);
            sequenceViewModel.setOpponentID(data.users[1].id);
          } else {
            sequenceViewModel.setOpponentColorType(data.users[0].colorType);
            sequenceViewModel.setOpponentID(data.users[0].id);
            sequenceViewModel.setUserID(data.users[1].id);
            sequenceViewModel.setUserColorType(data.users[1].colorType);
          }
        }
        // 카드 정보 저장
        data.users.forEach((user: any) => {
          if (user.id === this.userID) {
            sequenceViewModel.setCardList(user.ownedCardIDs || []);
            // 내 turn 정보 저장
            if (data.sequenceGameInfo && typeof user.turn !== 'undefined') {
              sequenceViewModel.updateTurn(data.sequenceGameInfo.currentRound, user.turn);
            }
          } else {
            sequenceViewModel.setOpponentCardList(user.ownedCardIDs || []);
          }
        });
      }

      console.log("응답으로 온 타입 , ", eventType);
      // 게임이 시작한다. START 이벤트 
      // next_round -> round_start
      // 다음 라운드 진출하면 next_round 이벤트 호출
      //next_round : 라운드 실패하거나 성공했을때 호출, 좌표 5개 모두 맞췄을 때 
      // round_start : next_round에서 호출 
      switch (eventType) {
        case "MATCH":
          console.log("✅ 매칭 성공!", data.message);

          // ✅ 게임 정보가 있는 경우 처리
          if (data.sequenceGameInfo) {
            await gameService.setRoomID(data.sequenceGameInfo.roomID);  // ✅ roomID 저장
            await gameService.setRound(data.sequenceGameInfo.round);
            // ✅ 모든 플레이어가 준비되었고, 방이 가득 찼으며, 내가 방장인 경우 "START" 이벤트 요청
            if (!this.gameStarted && data.sequenceGameInfo.allReady && data.sequenceGameInfo.isFull && data.users) {
              const isOwner = data.users.some((user: any) => user.id === this.userID && user.isOwner);
              if (isOwner) {
                console.log(this.roomID);
                console.log("방장이 게임 시작한다. ");
                this.sendStartEvent();
              } else {
                console.log("🕒 게임 시작 대기 중...");
              }
            }
          }
          break;
        case "TOGETHER":
          console.log("✅ 함께하기 매칭 성공!", data.message);

          // ✅ 게임 정보가 있는 경우 처리
          if (data.sequenceGameInfo) {
            gameService.setRoomID(data.sequenceGameInfo.roomID);  // ✅ roomID 저장
            gameService.setRound(data.sequenceGameInfo.round);
            gameService.setPassword(data.sequenceGameInfo.password);
            console.log("함께하기 비밀번호 : ", data.sequenceGameInfo.password);
            // ✅ 모든 플레이어가 준비되었고, 방이 가득 찼으며, 내가 방장인 경우 "START" 이벤트 요청
            if (!this.gameStarted && data.gamesequenceGameInfoInfo.allReady && data.sequenceGameInfo.isFull && data.users) {

              const isOwner = data.users.some((user: any) => user.id === this.userID && user.isOwner);
              if (isOwner) {
                console.log(this.roomID);
                console.log("방장이 게임 시작한다. ");
                this.sendStartEvent();
              } else {
                console.log("🕒 게임 시작 대기 중...");
              }
            }
          }
          break;
        case "JOIN":
          console.log("✅ 참여 매칭 성공!", data.message);
          if (data.gameInfo) {
            await gameService.setRoomID(data.sequenceGameInfo.roomID);  // ✅ roomID 저장
            await gameService.setRound(data.sequenceGameInfo.round);
            await gameService.setPassword(data.sequenceGameInfo.password);
            // ✅ 모든 플레이어가 준비되었고, 방이 가득 찼으며, 내가 방장인 경우 "START" 이벤트 요청
            if (!this.gameStarted && data.sequenceGameInfo.allReady && data.sequenceGameInfo.isFull && data.users) {

              const isOwner = data.users.some((user: any) => user.id === this.userID && user.isOwner);
              if (isOwner) {
                console.log(this.roomID);
                console.log("방장이 게임 시작한다. ");
                this.sendStartEvent();
              } else {
                console.log("🕒 게임 시작 대기 중...");
              }
            }
          }
          break;
        case "START":
          sequenceService.deductCoin(-100);
          if (navigation) {
            navigation.navigate('Loading', { nextScreen: 'Sequence' });
          }
          this.handleGameStart(data);
          // ✅ 게임 정보 저장

          break;
        case "GET_CARD":
          sequenceViewModel.updateGameState(data.sequenceGameInfo.round);
          console.log("🔑 카드 받았다. ", data.message);
          break;
        case "HERO":
          sequenceViewModel.updateGameState(data.sequenceGameInfo.round);
          console.log("🔑 영웅 카드 사용. ", data.message);
          break;
        case "MOVE":
          sequenceViewModel.updateGameState(data.sequenceGameInfo.round);
          console.log("🔑 이동. ", data.message);
          break;

        case "TIME_OUT":
          sequenceViewModel.updateGameState(data.sequenceGameInfo.round);
          console.log("🔑 시간 초과. ", data.message);
          break;
        case "NEXT_ROUND":
          sequenceViewModel.updateGameState(data.sequenceGameInfo.round);
          console.log("🔑 다음 라운드. ", data.message);
          break;

        case "GAME_OVER":
          // ✅ 게임 결과 정보 호출
          const result = await sequenceService.fetchGameResult();
          let isSuccess = false;
          if (result[0].score > result[1].score) {
            if (result[0].userID === this.userID) {
              isSuccess = true;
            } else {
              isSuccess = false;
            }
          } else {
            if (result[0].userID === this.userID) {
              isSuccess = false;
            } else {
              isSuccess = true;
            }
          }
          await sequenceService.sendGameOver(isSuccess, this.roomID as number);

          // ✅ 웹소켓 종료
          this.disconnect();
          //현재 유저ID가 스코어가 더 높으면 isSuccess true, 낮으면 false
          // ✅ 게임 결과 화면으로 이동
          if (navigation) {
            navigation.navigate('SequenceResult', { isSuccess: isSuccess });
          }
          break;
        case "MATCH_CANCEL":
          console.log("🚫 매칭 취소:", data.message);
          break;
        case "DISCONNECT":
          console.log("❌ 서버와 연결이 끊어졌습니다.");
          this.disconnect();
          // ✅ 게임 결과 화면으로 이동
          if (navigation) {
            navigation.navigate('SequenceResult', { isSuccess: false });
          }
          break;
        default:
          console.warn("⚠️ 알 수 없는 이벤트:", data.event);
      }

      // 게임 정보에 gameOver가 true인 경우에도 결과 호출
      if (data.sequenceGameInfo && data.sequenceGameInfo.gameOver === true) {
        try {
          const result = await sequenceService.fetchGameResult();
          console.log('게임 결과:', result);
          // TODO: 결과를 화면에 전달하거나 상태에 저장
        } catch (err) {
          console.error('게임 결과 조회 실패:', err);
        }
        this.disconnect();
        if (navigation) {
          navigation.navigate('SequenceResult', { isSuccess: false });
        }
      }
    } catch (error) {
      console.error("❌ 데이터 처리 중 오류 발생:", error);
    }
  };

  async handleGameStart(data: any) {
    this.roomID = data.gameInfo.roomID;
    this.imageID = data.gameInfo.imageInfo.id;
    this.round = data.gameInfo.round;
    this.gameStarted = true;

  }
  sendGetCardEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "GET_CARD", { userID: this.userID });
  }
  sendHeroEvent(cardId: number, newIndex: number) {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "HERO", { userID: this.userID, cardID: cardId, kingIndex: newIndex });
  }
  sendMoveEvent(cardId: number, newIndex: number) {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "MOVE", { userID: this.userID, cardID: cardId, kingIndex: newIndex });
  }

  sendNextRoundEvent(opponentCanMove: boolean) {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "NEXT_ROUND", { userID: this.userID, round: this.round, opponentCanMove: opponentCanMove });
  }
  sendTimeoutEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "TIME_OUT", { round: this.round });
  }

  sendMatchEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "MATCH", { userID: this.userID });
  }
  sendTogetherMatchEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "TOGETHER", { userID: this.userID });
  }
  sendJoinMatchEvent(password: string) {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "JOIN", { password: password });
  }

  sendStartEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "START", { userID: this.userID, roomID: this.roomID });
  }

  sendMatchCancelEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "MATCH_CANCEL", { userID: this.userID });
  }



  disconnect() {
    webSocketService.disconnect();
    // ✅ 게임 데이터 초기화
    this.gameStarted = false;
    this.roomID = null;
    this.imageID = null;
    this.round = null;
  }
}

export const sequenceWebSocketService = new SequenceWebSocketService();
