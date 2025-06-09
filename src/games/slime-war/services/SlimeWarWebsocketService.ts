// src/services/FindItWebSocketService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { gameService } from '../../../services/GameService';
import { webSocketService } from '../../../services/WebSocketService';
import { NavigationRefType } from '../../../navigation/navigationTypes';
import {WS_BASE_URL} from '../../../config';
import GameDetailScreen from '../../../screens/GameDetailScreen';
import { slimeWarService } from './SlimeWarService';
import { slimeWarViewModel } from './SlimeWarViewModel';

class SlimeWarWebSocketService {
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

        const wsUrl = WS_BASE_URL +`/slime-war/v0.1/rooms/match/ws?tkn=${this.accessToken}`;
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
        // message 필드가 JSON 문자열이므로 파싱
        let parsedData;
        try {
            parsedData = JSON.parse(data.message);
        } catch (e) {
            console.error("❌ 메시지 파싱 실패:", e);
            return;
        }

        try {
            // ✅ 유저 정보 업데이트 (정답 좌표 저장)
            if (parsedData.users) {
                gameService.setUsers(parsedData.users);
                // 맵 정보 저장
                slimeWarViewModel.setGameMap(parsedData.users);

                // 컬러타입 저장
                if (parsedData.users.length === 2) {
                    if (parsedData.users[0].id === this.userID) {
                        slimeWarViewModel.setUserColorType(parsedData.users[0].colorType);
                        slimeWarViewModel.setUserHeroCount(parsedData.users[0].heroCardCount);
                        slimeWarViewModel.setUserID(parsedData.users[0].id);
                        slimeWarViewModel.setMyTurn(parsedData.users[0].turn);
                        slimeWarViewModel.setOpponentColorType(parsedData.users[1].colorType);
                        slimeWarViewModel.setOpponentHeroCount(parsedData.users[1].heroCardCount);
                        slimeWarViewModel.setOpponentID(parsedData.users[1].id);
                        slimeWarViewModel.setOpponentCanMove(parsedData.users[1].canMove);
                    } else {
                        slimeWarViewModel.setOpponentColorType(parsedData.users[0].colorType);
                        slimeWarViewModel.setOpponentHeroCount(parsedData.users[0].heroCardCount);
                        slimeWarViewModel.setOpponentID(parsedData.users[0].id);
                        slimeWarViewModel.setOpponentCanMove(parsedData.users[0].canMove);
                        slimeWarViewModel.setUserID(parsedData.users[1].id);
                        slimeWarViewModel.setUserColorType(parsedData.users[1].colorType);
                        slimeWarViewModel.setUserHeroCount(parsedData.users[1].heroCardCount);
                        slimeWarViewModel.setMyTurn(parsedData.users[1].turn);
                    }   
                }
                // 카드 정보 저장
                if (parsedData.users) {
                    // 내 정보 찾기
                    const myInfo = parsedData.users.find((user: any) => user.id === this.userID);
                    if (myInfo) {
                        slimeWarViewModel.setCardList(myInfo.ownedCardIDs || []);
                        // 내 turn 정보 저장
                        if (parsedData.slimeWarGameInfo && typeof myInfo.turn !== 'undefined') {
                            slimeWarViewModel.updateTurn(parsedData.slimeWarGameInfo.currentRound, myInfo.turn);
                        }
                    }

                    // 상대방 정보 찾기
                    const opponentInfo = parsedData.users.find((user: any) => user.id !== this.userID);
                    if (opponentInfo) {
                        slimeWarViewModel.setOpponentCardList(opponentInfo.ownedCardIDs || []);
                    }
                }
            }
            if (parsedData.slimeWarGameInfo) {
                slimeWarViewModel.setKingIndex(parsedData.slimeWarGameInfo.kingPosition);
                slimeWarViewModel.setRemainingSlime(parsedData.slimeWarGameInfo.slimeCount);
            }

            console.log("응답으로 온 타입 , ",eventType);
            // 게임이 시작한다. START 이벤트 
            // next_round -> round_start
            // 다음 라운드 진출하면 next_round 이벤트 호출
            //next_round : 라운드 실패하거나 성공했을때 호출, 좌표 5개 모두 맞췄을 때 
            // round_start : next_round에서 호출 
            switch (eventType) {
                case "MATCH":
                    console.log("✅ 매칭 성공!",  parsedData);

                    // ✅ 게임 정보가 있는 경우 처리
                    if (parsedData.slimeWarGameInfo) {
                        this.roomID = parsedData.slimeWarGameInfo.roomID; // roomID 직접 설정
                        await gameService.setRoomID(parsedData.slimeWarGameInfo.roomID);
                        await gameService.setRound(parsedData.slimeWarGameInfo.round);
                        // ✅ 모든 플레이어가 준비되었고, 방이 가득 찼으며, 내가 방장인 경우 "START" 이벤트 요청
                        if (!this.gameStarted && parsedData.slimeWarGameInfo.allReady && parsedData.slimeWarGameInfo.isFull && parsedData.users) {
                            const isOwner = parsedData.users.some((user: any) => user.id === this.userID && user.isOwner);
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
                    console.log("✅ 함께하기 매칭 성공!", parsedData);

                    // ✅ 게임 정보가 있는 경우 처리
                    if (parsedData.slimeWarGameInfo) {
                        this.roomID = parsedData.slimeWarGameInfo.roomID; // roomID 직접 설정
                        gameService.setRoomID(parsedData.slimeWarGameInfo.roomID);
                        gameService.setRound(parsedData.slimeWarGameInfo.round);
                        gameService.setPassword(parsedData.slimeWarGameInfo.password);
                        console.log("함께하기 비밀번호 : ", data.slimeWarGameInfo.password);
                        // ✅ 모든 플레이어가 준비되었고, 방이 가득 찼으며, 내가 방장인 경우 "START" 이벤트 요청
                        if (!this.gameStarted && parsedData.slimeWarGameInfo.allReady && parsedData.slimeWarGameInfo.isFull && parsedData.users) {

                            const isOwner = parsedData.users.some((user: any) => user.id === this.userID && user.isOwner);
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
                    console.log("✅ 참여 매칭 성공!", parsedData);
                    if (parsedData.slimeWarGameInfo) {
                        this.roomID = parsedData.slimeWarGameInfo.roomID; // roomID 직접 설정
                        await gameService.setRoomID(parsedData.slimeWarGameInfo.roomID);
                        await gameService.setRound(parsedData.slimeWarGameInfo.round);
                        await gameService.setPassword(parsedData.slimeWarGameInfo.password);
                        // ✅ 모든 플레이어가 준비되었고, 방이 가득 찼으며, 내가 방장인 경우 "START" 이벤트 요청
                        if (!this.gameStarted && parsedData.slimeWarGameInfo.allReady && parsedData.slimeWarGameInfo.isFull && parsedData.users) {

                            const isOwner = parsedData.users.some((user: any) => user.id === this.userID && user.isOwner);
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
                    slimeWarService.deductCoin(-100);
                    if (navigation) {
                        navigation.navigate('Loading', { nextScreen: 'SlimeWar' });
                    }
                    this.handleGameStart(parsedData);
                    // ✅ 게임 정보 저장
                    
                    break;
                case "GET_CARD":
                    slimeWarViewModel.updateGameState(parsedData.slimeWarGameInfo.round);
                    console.log("🔑 카드 받았다. ", parsedData);
                    break;
                case "HERO":
                    slimeWarViewModel.updateGameState(parsedData.slimeWarGameInfo.round);
                    console.log("🔑 영웅 카드 사용. ", parsedData);
                    if (parsedData.users[0].id === this.userID) {
                        if (parsedData.users[0].lastCardID !== 0) {
                            slimeWarViewModel.setMyLastPlacedCard(parsedData.users[0].lastCardID);
                        }
                        else if (parsedData.users[1].lastCardID !== 0) {
                            slimeWarViewModel.setOpponentLastPlacedCard(parsedData.users[1].lastCardID);
                        }
                    } else {
                        if (parsedData.users[1].lastCardID !== 0) {
                            slimeWarViewModel.setMyLastPlacedCard(parsedData.users[1].lastCardID);
                        }
                        else if (parsedData.users[0].lastCardID !== 0) {
                            slimeWarViewModel.setOpponentLastPlacedCard(parsedData.users[0].lastCardID);
                        }
                    }
                    break;
                case "MOVE":
                    
                    slimeWarViewModel.updateGameState(parsedData.slimeWarGameInfo.round);
                    if (parsedData.slimeWarGameInfo.slimeCount === 30) {
                        const isOwner = parsedData.users.some((user: any) => user.id === this.userID && user.isOwner);
                        if (isOwner) {
                            console.log(this.roomID);
                            console.log("방장이 게임 종료한다. ");
                            this.sendGameOverEvent();
                        } else {
                            console.log("🕒 게임 종료 대기 중...");
                        }
                    }
                    if (parsedData.users[0].id === this.userID) {
                        if (parsedData.users[0].lastCardID !== 0) {
                            slimeWarViewModel.setMyLastPlacedCard(parsedData.users[0].lastCardID);
                        }
                        else if (parsedData.users[1].lastCardID !== 0) {
                            slimeWarViewModel.setOpponentLastPlacedCard(parsedData.users[1].lastCardID);
                        }
                    } else {
                        if (parsedData.users[1].lastCardID !== 0) {
                            slimeWarViewModel.setMyLastPlacedCard(parsedData.users[1].lastCardID);
                        }
                        else if (parsedData.users[0].lastCardID !== 0) {
                            slimeWarViewModel.setOpponentLastPlacedCard(parsedData.users[0].lastCardID);
                        }
                    }
                    
                    console.log("🔑 이동. ", parsedData);
                    break;
                
                case "TIME_OUT":
                    slimeWarViewModel.updateGameState(parsedData.slimeWarGameInfo.round);
                    console.log("🔑 시간 초과. ", parsedData);
                    if (parsedData.users[0].id === this.userID) {
                        if (parsedData.users[0].lastCardID !== 0) {
                            slimeWarViewModel.setMyLastPlacedCard(parsedData.users[0].lastCardID);
                        }
                        else if (parsedData.users[1].lastCardID !== 0) {
                            slimeWarViewModel.setOpponentLastPlacedCard(parsedData.users[1].lastCardID);
                        }
                    } else {
                        if (parsedData.users[1].lastCardID !== 0) {
                            slimeWarViewModel.setMyLastPlacedCard(parsedData.users[1].lastCardID);
                        }
                        else if (parsedData.users[0].lastCardID !== 0) {
                            slimeWarViewModel.setOpponentLastPlacedCard(parsedData.users[0].lastCardID);
                        }
                    }
                    break;
                case "NEXT_ROUND":
                    // parsedData.users에 유저 둘다 이동이 불가능하다면 GAME_OVER 이벤트 호출 
                    if (parsedData.users[0].canMove === false && parsedData.users[1].canMove === false) {
                        const isOwner = parsedData.users.some((user: any) => user.id === this.userID && user.isOwner);
                        if (isOwner) {
                            console.log(this.roomID);
                            console.log("방장이 게임 종료한다. ");
                            this.sendGameOverEvent();
                        } else {
                            console.log("🕒 게임 종료 대기 중...");
                        }
                    }
                    
                    slimeWarViewModel.updateGameState(parsedData.slimeWarGameInfo.round);
                    console.log("🔑 다음 라운드. ", parsedData);
                    break;
               
                case "GAME_OVER":
                    try {
                        // 내 점수와 상대방 점수 계산
                        const myScore = slimeWarViewModel.calculateScore(this.userID as number);
                        const opponentScore = slimeWarViewModel.calculateScore(slimeWarViewModel.opponentID);
                        let myScoreString = slimeWarViewModel.calculateScoreString(this.userID as number);
                        let opponentScoreString = slimeWarViewModel.calculateScoreString(slimeWarViewModel.opponentID);
                        // 결과 결정 (1: 승리, 0: 패배)
                        const result = myScore > opponentScore ? 1 : 0;
                        myScoreString += " = " + myScore.toString();
                        opponentScoreString += " = " + opponentScore.toString();

                        // 게임 종료 결과 전송
                        await slimeWarService.sendGameOverResult(
                            this.roomID as number,
                            this.userID as number,
                            myScore,
                            result,
                        );

                        // 웹소켓 종료
                        this.disconnect();
                        
                        // 게임 종료 상태 설정
                        slimeWarViewModel.setGameOver({
                            isSuccess: result === 1,
                            myScore: myScoreString,
                            opponentScore: opponentScoreString
                        });

                    } catch (error) {
                        console.error('Error in game over handling:', error);
                        slimeWarViewModel.setGameOver({
                            isSuccess: false,
                            myScore: "0",
                            opponentScore: "0"
                        });
                    }
                    break;
                case "MATCH_CANCEL":
                    console.log("🚫 매칭 취소:", parsedData);
                    break;
                case "DISCONNECT":
                    console.log("❌ 서버와 연결이 끊어졌습니다.");
                    this.disconnect();
                    // ✅ 게임 결과 화면으로 이동
                    if (navigation) {
                        navigation.navigate('SlimeWarResult', { isSuccess: false, myScore: "0", opponentScore: "0" });    
                    }
                    break;
                case "ERROR":
                    console.log("❌ 에러:", parsedData);
                    this.disconnect();
                    // ✅ 게임 결과 화면으로 이동
                    if (navigation) {
                        navigation.navigate('SlimeWarResult', { isSuccess: false, myScore: "0", opponentScore: "0" });    
                    }
                    break;
                default:
                    console.warn("⚠️ 알 수 없는 이벤트:", data.event);
            }

        } catch (error) {
            console.log("❌ 데이터 처리 중 오류 발생:", error);
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
    sendGameOverEvent() {
        webSocketService.sendMessage(this.userID as number, this.roomID as number, "GAME_OVER", { userID: this.userID});
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

export const slimeWarWebSocketService = new SlimeWarWebSocketService();
