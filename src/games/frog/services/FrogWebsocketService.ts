// src/services/FindItWebSocketService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameService } from '../../../services/GameService';
import { webSocketService } from '../../../services/WebSocketService';
import { NavigationRefType } from '../../../navigation/navigationTypes';
import { WS_BASE_URL } from '../../../config';
import GameDetailScreen from '../../../screens/GameDetailScreen';
import { frogService } from './FrogService';
import { frogViewModel } from './FrogViewModel';
import frogCards from '../../../assets/data/frog_cards.json';

class FrogWebSocketService {
  private accessToken: string | null = null;
  private userID: number | null = null;
  private opponentID: number | null = null;
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

    // URL 변경: 참새작 랜덤 매칭
    const wsUrl = WS_BASE_URL + `/frog/v0.1/rooms/match/ws?tkn=${this.accessToken}`;
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

    // URL 변경: 참새작 함께하기 방 생성
    const wsUrl = WS_BASE_URL + `/frog/v0.1/rooms/play/together/ws?tkn=${this.accessToken}`;
    webSocketService.connect(wsUrl, this.handleMessage);
    this.sendPlayTogetherEvent();
  }
  async joinConnect(password: string) {
    // ✅ 기존 상태 초기화
    this.gameStarted = false;
    this.roomID = null;
    this.imageID = null;
    this.round = null;
    const isInitialized = await this.initialize();
    if (!isInitialized) return;
    // URL 변경: 참새작 방 참여
    const wsUrl = WS_BASE_URL + `/frog/v0.1/rooms/join/play/ws?tkn=${this.accessToken}&password=${password}`;
    webSocketService.connect(wsUrl, this.handleMessage);
    this.sendJoinPlayEvent(password);
  }

  handleMessage = async (eventType: string, data: any) => {
    console.log("📩 서버 응답 전체 데이터:", JSON.stringify(data, null, 2));
    const navigation = webSocketService.getNavigation();

    try {
        // message 필드가 JSON 문자열이므로 파싱
        let parsedData;
        try {
            parsedData = JSON.parse(data.message);
            console.log("📩 파싱된 메시지 데이터:", parsedData);
        } catch (e) {
            console.error("❌ 메시지 파싱 실패:", e);
            return;
        }

        // 유저 정보 업데이트
        if (parsedData.users && Array.isArray(parsedData.users)) {  // 배열인지 확인
            gameService.setUsers(parsedData.users);
            
            // 게임 맵 초기화 (10x10 빈 배열)
            const initialMap = Array(10).fill(null).map(() => Array(10).fill(null));
            frogViewModel.setGameMap(initialMap);
            
            // 컬러타입 저장
            if (parsedData.users.length === 2) {
                if (parsedData.users[0].id === this.userID) {
                    frogViewModel.setUserID(parsedData.users[0].id);
                    frogViewModel.setOpponentID(parsedData.users[1].id);
                } else {
                    frogViewModel.setOpponentID(parsedData.users[0].id);
                    frogViewModel.setUserID(parsedData.users[1].id);
                }
            }
            
            // 카드 정보 저장
            parsedData.users.forEach((user: any) => {
                if (user.id === this.userID) {
                  frogViewModel.setCardList(user.cards || []);
                  frogViewModel.setDiscardCardList(user.discardedCards || []);
                    // 내 turn 정보 저장
                    if (parsedData.FrogGameInfo && typeof user.turn !== 'undefined') {
                        frogViewModel.updateTurn(parsedData.FrogGameInfo.round, user.turn);
                    }
                } else {
                  frogViewModel.setOpponentDiscardCardList(user.discardedCards || []);
                }
            });
        }

        // 게임 정보 처리
        if (parsedData.gameInfo) {
            console.log("게임 정보:", parsedData.gameInfo);
            await gameService.setRoomID(parsedData.gameInfo.roomID);
            await gameService.setRound(parsedData.gameInfo.round);
            
            if (!this.gameStarted && parsedData.gameInfo.allReady && 
                parsedData.gameInfo.isFull && parsedData.users) {
                const isOwner = parsedData.users.some((user: any) => 
                    user.id === this.userID && user.isOwner
                );
                if (isOwner) {
                    console.log("방장이 게임 시작합니다.");
                    this.sendStartEvent();
                } else {
                    console.log("게임 시작 대기 중...");
                }
            }
        }

        // 이벤트 타입에 따른 처리
        switch (eventType) {
            case "JOIN":
                this.handleJoinEvent(data);
                break;
            case "MATCH":
                this.handleMatchEvent(data);
                break;
            case "QUIT_GAME":
                this.handleQuitGameEvent(data);
                break;
          case "START":
              frogService.deductCoin(-100);
              if (navigation) {
                navigation.navigate('Loading', { nextScreen: 'Frog' });
              }
              this.handleStartEvent(parsedData);
              break;
            case "DORA":
                this.handleDoraEvent(data);
                break;
            case "IMPORT_CARDS":
                this.handleImportCardsEvent(data);
                break;
            case "IMPORT_SINGLE_CARD":
                this.handleImportSingleCardEvent(data);
                break;
            case "DISCARD":
                this.handleDiscardEvent(data);
                break;
            case "LOAN":
                this.handleLoanEvent(data);
                break;
            case "FAILED_LOAN":
                this.handleFailedLoanEvent(data);
                break;
            case "GAME_OVER":
                this.handleGameOverEvent(data);
                break;
            case "SUCCESS_LOAN":
                this.handleSuccessLoanEvent(data);
                break;
            case "TIME_OUT":
                this.handleTimeoutEvent(data);
                break;
            case "CANCEL_MATCH":
                this.handleCancelMatchEvent(data);
                break;
            case "PLAY_TOGETHER":
                this.handlePlayTogetherEvent(data);
                break;
            case "JOIN_PLAY":
                this.handleJoinPlayEvent(data);
                break;
            default:
                console.warn("⚠️ 알 수 없는 이벤트:", data.event);
        }

        // 게임 정보에 gameOver가 true인 경우에도 결과 호출
        if (parsedData.FrogGameInfo && parsedData.FrogGameInfo.gameOver === true) {
            try {
                const result = await frogService.fetchGameResult();
                console.log('게임 결과:', result);
                // TODO: 결과를 화면에 전달하거나 상태에 저장
            } catch (err) {
                console.error('게임 결과 조회 실패:', err);
            }
            this.disconnect();
            if (navigation) {
                navigation.navigate('FrogResult', { isSuccess: false });
            }
        }
    } catch (error) {
        console.error("❌ 데이터 처리 중 오류 발생:", error);
    }
  };

  handleJoinEvent(data: any) { /* TODO: 구현 */ }
  handleMatchEvent(data: any) { /* TODO: 구현 */ }
  handleQuitGameEvent(data: any) { /* TODO: 구현 */ }
  handleDoraEvent(data: any) { 
    frogViewModel.setDora(data.gameInfo.dora);
  }
  handleImportCardsEvent(data: any) { /* TODO: 구현 */ }
  handleImportSingleCardEvent(data: any) { /* TODO: 구현 */ }
  handleDiscardEvent(data: any) { /* TODO: 구현 */ }
  handleLoanEvent(data: any) { /* TODO: 구현 */ }
  handleFailedLoanEvent(data: any) { /* TODO: 구현 */ }
  handleGameOverEvent(data: any) { /* TODO: 구현 */ }
  handleSuccessLoanEvent(data: any) { /* TODO: 구현 */ }
  handleTimeoutEvent(data: any) { /* TODO: 구현 */ }
  handleCancelMatchEvent(data: any) { /* TODO: 구현 */ }
  handlePlayTogetherEvent(data: any) { /* TODO: 구현 */ }
  handleJoinPlayEvent(data: any) { /* TODO: 구현 */ }

  handleStartEvent(data: any) {
    if (data.gameInfo) {
        this.roomID = data.gameInfo.roomID;
        this.round = data.gameInfo.round;
        this.gameStarted = true;
        // 카드 맵 랜덤 초기화 (6x8)
        const cardIds = frogCards.map(card => card.id);
        // Fisher-Yates shuffle
        for (let i = cardIds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [cardIds[i], cardIds[j]] = [cardIds[j], cardIds[i]];
        }
        // 6x8 맵에 배치 (44장 + 4칸은 null)
        const padded = [...cardIds, ...Array(48 - cardIds.length).fill(null)];
        const map = Array.from({ length: 6 }, (_, row) =>
          padded.slice(row * 8, row * 8 + 8)
        );
        frogViewModel.setGameMap(map);
    }
  }

  // ====== 이벤트 전송 메서드도 16개로 맞춤 ======
  sendJoinEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "JOIN", {});
  }
  sendMatchEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "MATCH", { userID: this.userID });
  }
  sendQuitGameEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "QUIT_GAME", {});
  }
  sendStartEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "START", { userID: this.userID, roomID: this.roomID });
  }
  sendDoraEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "DORA", {});
  }
  sendImportCardsEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "IMPORT_CARDS", {});
  }
  sendImportSingleCardEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "IMPORT_SINGLE_CARD", {});
  }
  sendDiscardEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "DISCARD", {});
  }
  sendLoanEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "LOAN", {});
  }
  sendFailedLoanEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "FAILED_LOAN", {});
  }
  sendGameOverEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "GAME_OVER", {});
  }
  sendSuccessLoanEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "SUCCESS_LOAN", {});
  }
  sendTimeoutEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "TIME_OUT", { userID:this.userID,round: this.round });
  }
  sendCancelMatchEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "CANCEL_MATCH", { userID: this.userID });
  }
  sendPlayTogetherEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "PLAY_TOGETHER", { userID: this.userID });
  }
  sendJoinPlayEvent(password: string) {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "JOIN_PLAY", { password });
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

export const frogWebSocketService = new FrogWebSocketService();
