// src/services/WebSocketService.ts
import { NavigationRefType } from '../navigation/navigationTypes';

export class WebSocketService {
    private ws: WebSocket | null = null;
    private navigation: NavigationRefType = null;
    private isConnected: boolean = false; // ✅ 연결 상태 확인
    private messageQueue: any[] = []; // ✅ 메시지 큐 추가
    private messageHandlers: ((eventType: string, data: any) => void)[] = [];

    constructor() {
        // Remove the connect() call from constructor since it needs parameters
    }

    setNavigation(navigation: NavigationRefType) {
        this.navigation = navigation;
    }

    getNavigation() {
        return this.navigation;
    }

    public connect(wsUrl: string, messageHandler: (eventType: string, data: any) => void) {
        this.ws = new WebSocket(wsUrl);
        this.messageHandlers.push(messageHandler);

        this.ws.onopen = () => {
            console.log("✅ 웹소켓 연결 성공!");
            this.isConnected = true; // ✅ 연결 상태 업데이트

            // ✅ 큐에 저장된 메시지를 전송
            while (this.messageQueue.length > 0) {
                const message = this.messageQueue.shift();
                this.ws?.send(JSON.stringify(message));
                console.log(`📤 큐에서 메시지 전송:`, message);
            }
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.messageHandlers.forEach(handler => handler(message.event, message));
        };

        this.ws.onclose = (event) => {
            //큐 초기화
            console.log(`🔌 웹소켓 연결 종료 (코드: ${event.code}, 이유: ${event.reason})`);
            this.isConnected = false; // ✅ 연결 종료 시 상태 업데이트
        };

        this.ws.onerror = (error) => {
            console.error("❌ 웹소켓 오류 발생:", JSON.stringify(error, null, 2));
            this.isConnected = false; // ✅ 오류 발생 시 연결 상태 업데이트
        };
    }

    onMessage(handler: (message: any) => void) {
        this.messageHandlers.push(handler);
    }

    send(message: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
    }

    sendMessage(userID: number, roomID: number, eventType: string, message: any) {
        const event = {
            userID: userID,
            roomID: roomID,
            event: eventType,
            message: JSON.stringify(message),
        };

        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            this.messageQueue.push(event); // ✅ 메시지를 큐에 저장
            return;
        }

        this.ws.send(JSON.stringify(event));
        console.log(`📤 ${eventType} 이벤트 전송:`, event);
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnected = false;
    }
}

export const webSocketService = new WebSocketService();
