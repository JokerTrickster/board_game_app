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

    const wsUrl = WS_BASE_URL + `/sequence/v0.1/rooms/match/ws?tkn=${this.accessToken}`;
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

    const wsUrl = WS_BASE_URL + `/sequence/v0.1/rooms/play/together/ws?tkn=${this.accessToken}`;
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
    const wsUrl = WS_BASE_URL + `/sequence/v0.1/rooms/play/join/ws?tkn=${this.accessToken}&password=${password}`;
    webSocketService.connect(wsUrl, this.handleMessage);
    console.log("password", password);
    this.sendJoinMatchEvent(password);
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
            sequenceViewModel.setGameMap(initialMap);
            
            // 컬러타입 저장
            if (parsedData.users.length === 2) {
                if (parsedData.users[0].id === this.userID) {
                    sequenceViewModel.setUserColorType(parsedData.users[0].colorType);
                    sequenceViewModel.setUserID(parsedData.users[0].id);
                    sequenceViewModel.setOwnedMapIDs(parsedData.users[0].ownedMapIDs);
                    sequenceViewModel.setOpponentColorType(parsedData.users[1].colorType);
                    sequenceViewModel.setOpponentID(parsedData.users[1].id);
                  sequenceViewModel.setOpponentOwnedMapIDs(parsedData.users[1].ownedMapIDs);  
                } else {
                    sequenceViewModel.setOpponentColorType(parsedData.users[0].colorType);
                    sequenceViewModel.setOpponentID(parsedData.users[0].id);
                    sequenceViewModel.setOpponentOwnedMapIDs(parsedData.users[0].ownedMapIDs);
                    sequenceViewModel.setUserID(parsedData.users[1].id);
                    sequenceViewModel.setUserColorType(parsedData.users[1].colorType);
                    sequenceViewModel.setOwnedMapIDs(parsedData.users[1].ownedMapIDs);
                }
            }
            
            // 카드 정보 저장
            parsedData.users.forEach((user: any) => {
                if (user.id === this.userID) {
                    sequenceViewModel.setCardList(user.ownedCardIDs || []);
                    // 내 turn 정보 저장
                    if (parsedData.sequenceGameInfo && typeof user.turn !== 'undefined') {
                        sequenceViewModel.updateTurn(parsedData.sequenceGameInfo.round, user.turn);
                    }
                } else {
                    sequenceViewModel.setOpponentCardList(user.ownedCardIDs || []);
                }
            });
        }

        // 게임 정보 처리
        if (parsedData.sequenceGameInfo) {
            console.log("게임 정보:", parsedData.sequenceGameInfo);
            this.roomID = parsedData.sequenceGameInfo.roomID;
            await gameService.setRoomID(parsedData.sequenceGameInfo.roomID);
            await gameService.setRound(parsedData.sequenceGameInfo.round);
            
            if (!this.gameStarted && parsedData.sequenceGameInfo.allReady && 
                parsedData.sequenceGameInfo.isFull && parsedData.users) {
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
            case "MATCH":
            case "TOGETHER":
            case "JOIN":
                console.log(`✅ ${eventType} 매칭 성공!`, data.message);
                break;
            case "START":
                sequenceService.deductCoin(-100);
                if (navigation) {
                    navigation.navigate('Sequence');
                }
                this.handleGameStart(parsedData);
                break;
            case "USE_CARD":
                if (parsedData.sequenceGameInfo) {
                  sequenceViewModel.updateGameState(parsedData.sequenceGameInfo.round);
                }
                  if (parsedData.users) {
                    if (parsedData.users[0].id === this.userID) {
                      if (parsedData.users[0].lastCardID !== 0) {
                          sequenceViewModel.setMyLastPlacedCard(parsedData.users[0].lastCardID);
                      }
                      else if (parsedData.users[1].lastCardID !== 0) {
                        sequenceViewModel.setOpponentLastPlacedCard(parsedData.users[1].lastCardID);
                      }
                  } else {
                      if (parsedData.users[1].lastCardID !== 0) {
                        sequenceViewModel.setMyLastPlacedCard(parsedData.users[1].lastCardID);
                      }
                      else if (parsedData.users[0].lastCardID !== 0) {
                        sequenceViewModel.setOpponentLastPlacedCard(parsedData.users[0].lastCardID);
                      }
                  }
                  }
                break;
            case "TIME_OUT":
                if (parsedData.sequenceGameInfo) {
                  sequenceViewModel.updateGameState(parsedData.sequenceGameInfo.round);
                }
                if (parsedData.users) {
                  if (parsedData.users[0].id === this.userID) {
                    if (parsedData.users[0].lastCardID !== 0) {
                        sequenceViewModel.setMyLastPlacedCard(parsedData.users[0].lastCardID);
                    }
                    else if (parsedData.users[1].lastCardID !== 0) {
                      sequenceViewModel.setOpponentLastPlacedCard(parsedData.users[1].lastCardID);
                    }
                } else {
                    if (parsedData.users[1].lastCardID !== 0) {
                      sequenceViewModel.setMyLastPlacedCard(parsedData.users[1].lastCardID);
                    }
                    else if (parsedData.users[0].lastCardID !== 0) {
                      sequenceViewModel.setOpponentLastPlacedCard(parsedData.users[0].lastCardID);
                    }
                }
                }
                console.log("🔑 시간 초과. ", data.message);
                break;
            case "GAME_OVER":
                try {
                    // 시퀀스 개수를 점수로 사용
                    const myScore = sequenceViewModel.mySequences.length;
                    const opponentScore = sequenceViewModel.opponentSequences.length;
                    
                    // 결과 결정 (1: 승리, 0: 패배)
                    const result = myScore > opponentScore ? 1 : 0;
                    
                    // 게임 종료 결과 전송
                    await sequenceService.sendGameOverResult(
                        this.roomID as number,
                        this.userID as number,
                        myScore,
                        result,
                    );

                    // 웹소켓 종료
                    this.disconnect();
                    
                    // 게임 종료 상태 설정
                    sequenceViewModel.setGameOver({
                        isSuccess: result === 1,
                        myScore: myScore,
                        opponentScore: opponentScore
                    });
                } catch (error) {
                    console.error('Error in game over handling:', error);
                    sequenceViewModel.setGameOver({
                        isSuccess: false,
                        myScore: 0,
                        opponentScore: 0
                    });
                }
                break;
            case "MATCH_CANCEL":
                console.log("🚫 매칭 취소:", data.message);
                break;

            case "REMOVE_CARD":
                console.log("🔑 카드 제거:", data.message);
                break;
            case "DISCONNECT":
                console.log("❌ 서버와 연결이 끊어졌습니다.");
                this.disconnect();
                // ✅ 게임 결과 화면으로 이동
                if (navigation) {
                    navigation.navigate('SequenceResult', { isSuccess: false, myScore: 0, opponentScore: 0 });  
                }
            break;
            case "ERROR":
              console.log("❌ 에러:", data.message);
              this.disconnect();
              // ✅ 게임 결과 화면으로 이동
              if (navigation) {
                navigation.navigate('SequenceResult', { isSuccess: false, myScore: 0, opponentScore: 0 });  
              }
                break;
            default:
                console.warn("⚠️ 알 수 없는 이벤트:", data.event);
        }

        // 게임 정보에 gameOver가 true인 경우에도 결과 호출
        if (parsedData.sequenceGameInfo && parsedData.sequenceGameInfo.gameOver === true) {
            try {
                const result = await sequenceService.fetchGameResult(this.roomID as number);
                console.log('게임 결과:', result);
                // TODO: 결과를 화면에 전달하거나 상태에 저장
            } catch (err) {
                console.error('게임 결과 조회 실패:', err);
            }
            this.disconnect();
            if (navigation) {
                navigation.navigate('SequenceResult', { isSuccess: false, myScore: 0, opponentScore: 0 });  
            }
        }
    } catch (error) {
        console.log("❌ 데이터 처리 중 오류 발생:", error);
    }
  };

  async handleGameStart(data: any) {
    if (data.sequenceGameInfo) {
        this.roomID = data.sequenceGameInfo.roomID;
        this.round = data.sequenceGameInfo.round;
        this.gameStarted = true;
    }
  }
  sendRemoveCardEvent(cardID: number, mapID: number){
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "REMOVE_CARD", { cardID: cardID, mapID: mapID });
  }
  sendGameOverEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "GAME_OVER", { winnerID: this.userID, loserID: sequenceViewModel.opponentID });
  }
  sendUseCardEvent(cardID: number, mapID: number) {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "USE_CARD", { cardID: cardID, mapID: mapID });
  }
  sendTimeoutEvent() {
    webSocketService.sendMessage(this.userID as number, this.roomID as number, "TIME_OUT", { userID:this.userID,round: this.round });
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
