// src/services/WebSocketService.ts
import { NavigationRefType } from '../navigation/navigationTypes';

class WebSocketService {
    private socket: WebSocket | null = null;
    private navigation: NavigationRefType = null;
    private isConnected: boolean = false; // ✅ 연결 상태 확인
    private messageQueue: any[] = []; // ✅ 메시지 큐 추가

    setNavigation(navigation: NavigationRefType) {
        this.navigation = navigation;
    }

    getNavigation() {
        return this.navigation;
    }

    connect(url: string, onMessage: (eventType: string, event: WebSocketMessageEvent) => void) {
        if (this.socket) {
            this.socket.close();
        }

        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            console.log("✅ 웹소켓 연결 성공!");
            this.isConnected = true; // ✅ 연결 상태 업데이트

            // ✅ 큐에 저장된 메시지를 전송
            while (this.messageQueue.length > 0) {
                const message = this.messageQueue.shift();
                this.socket?.send(JSON.stringify(message));
                console.log(`📤 큐에서 메시지 전송:`, message);
            }
        };

        this.socket.onmessage = (event: WebSocketMessageEvent) => {
            try {
                const rawData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                console.log(rawData.event);
                const data = typeof rawData.message === 'string' ? JSON.parse(rawData.message) : rawData.message;

                onMessage(rawData.event, data); // ✅ 이벤트 타입을 함께 전달
            } catch (error) {
                console.error("❌ JSON 파싱 오류:", error);
            }
        };

        this.socket.onclose = (event) => {
            console.log(`🔌 웹소켓 연결 종료 (코드: ${event.code}, 이유: ${event.reason})`);
            this.isConnected = false; // ✅ 연결 종료 시 상태 업데이트
        };

        this.socket.onerror = (error) => {
            console.error("❌ 웹소켓 오류 발생:", JSON.stringify(error, null, 2));
            this.isConnected = false; // ✅ 오류 발생 시 연결 상태 업데이트
        };
    }

    sendMessage(userID: number, roomID: number, eventType: string, message: any) {
        const event = {
            userID: userID,
            roomID: roomID,
            event: eventType,
            message: JSON.stringify(message),
        };

        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            this.messageQueue.push(event); // ✅ 메시지를 큐에 저장
            return;
        }

        this.socket.send(JSON.stringify(event));
        console.log(`📤 ${eventType} 이벤트 전송:`, event);
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
        }
        this.isConnected = false;
    }
}

export const webSocketService = new WebSocketService();
