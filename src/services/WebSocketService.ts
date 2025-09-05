// src/services/WebSocketService.ts
import { NavigationRefType } from '../navigation/navigationTypes';

interface QueuedMessage {
    event: any;
    timestamp: number;
    retryCount: number;
}

interface WebSocketConfig {
    maxQueueSize: number;
    messageTTL: number; // Time to live in milliseconds
    maxRetries: number;
    reconnectDelay: number;
}

const DEFAULT_CONFIG: WebSocketConfig = {
    maxQueueSize: 100,
    messageTTL: 30000, // 30 seconds
    maxRetries: 3,
    reconnectDelay: 5000 // 5 seconds
};

export class WebSocketService {
    private ws: WebSocket | null = null;
    private navigation: NavigationRefType = null;
    private isConnected: boolean = false;
    private messageQueue: QueuedMessage[] = [];
    private messageHandlers: ((eventType: string, data: any) => void)[] = [];
    private config: WebSocketConfig = DEFAULT_CONFIG;
    private reconnectTimer: NodeJS.Timeout | null = null;
    private queueCleanupTimer: NodeJS.Timeout | null = null;
    private wsUrl: string = '';
    private connectionAttempts: number = 0;
    private maxConnectionAttempts: number = 5;

    constructor(config?: Partial<WebSocketConfig>) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.startQueueCleanup();
    }

    setNavigation(navigation: NavigationRefType) {
        this.navigation = navigation;
    }

    getNavigation() {
        return this.navigation;
    }

    private startQueueCleanup() {
        // Clean expired messages every 10 seconds
        this.queueCleanupTimer = setInterval(() => {
            this.cleanupExpiredMessages();
        }, 10000);
    }

    private cleanupExpiredMessages() {
        const now = Date.now();
        const initialLength = this.messageQueue.length;
        
        this.messageQueue = this.messageQueue.filter(queuedMessage => {
            return (now - queuedMessage.timestamp) <= this.config.messageTTL;
        });

        const removedCount = initialLength - this.messageQueue.length;
        if (removedCount > 0) {
            console.log(`🧹 Cleaned up ${removedCount} expired messages from queue`);
        }
    }

    private addToQueue(event: any): boolean {
        // Check queue size limit
        if (this.messageQueue.length >= this.config.maxQueueSize) {
            // Remove oldest message to make room
            const removed = this.messageQueue.shift();
            console.warn('⚠️ Queue full, removed oldest message:', removed?.event);
        }

        // Add new message with metadata
        const queuedMessage: QueuedMessage = {
            event,
            timestamp: Date.now(),
            retryCount: 0
        };

        this.messageQueue.push(queuedMessage);
        return true;
    }

    private processMessageQueue() {
        const now = Date.now();
        const messagesToProcess = [...this.messageQueue];
        this.messageQueue = [];

        for (const queuedMessage of messagesToProcess) {
            // Skip expired messages
            if ((now - queuedMessage.timestamp) > this.config.messageTTL) {
                console.warn('⏰ Skipping expired message:', queuedMessage.event);
                continue;
            }

            // Try to send message
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                try {
                    this.ws.send(JSON.stringify(queuedMessage.event));
                    console.log(`📤 Queue message sent:`, queuedMessage.event);
                } catch (error) {
                    // Re-queue if failed and under retry limit
                    if (queuedMessage.retryCount < this.config.maxRetries) {
                        queuedMessage.retryCount++;
                        this.messageQueue.push(queuedMessage);
                        console.warn('🔄 Message send failed, re-queued:', error);
                    } else {
                        console.error('❌ Message dropped after max retries:', queuedMessage.event);
                    }
                }
            } else {
                // Connection lost, re-queue message
                if (queuedMessage.retryCount < this.config.maxRetries) {
                    this.messageQueue.push(queuedMessage);
                }
            }
        }
    }

    private attemptReconnect() {
        if (this.reconnectTimer || this.connectionAttempts >= this.maxConnectionAttempts) {
            return;
        }

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this.connectionAttempts++;
            
            console.log(`🔄 Attempting reconnection ${this.connectionAttempts}/${this.maxConnectionAttempts}`);
            
            if (this.wsUrl) {
                // Restore handlers before reconnecting
                const handlers = [...this.messageHandlers];
                this.connect(this.wsUrl, handlers[0]); // Use first handler as primary
            }
        }, this.config.reconnectDelay);
    }

    public connect(wsUrl: string, messageHandler: (eventType: string, data: any) => void) {
        this.wsUrl = wsUrl;
        
        // Close existing connection if any
        if (this.ws) {
            this.ws.close();
        }

        this.ws = new WebSocket(wsUrl);
        
        // Clear or add message handler
        if (!this.messageHandlers.includes(messageHandler)) {
            this.messageHandlers.push(messageHandler);
        }

        this.ws.onopen = () => {
            console.log("✅ WebSocket connection established!");
            this.isConnected = true;
            this.connectionAttempts = 0; // Reset connection attempts on successful connection

            // Clear any pending reconnect timer
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }

            // Process queued messages with optimized handling
            this.processMessageQueue();
        };

        this.ws.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.messageHandlers.forEach(handler => {
                    try {
                        handler(message.event, message);
                    } catch (error) {
                        console.error('❌ Error in message handler:', error);
                    }
                });
            } catch (error) {
                console.error('❌ Failed to parse WebSocket message:', error);
            }
        };

        this.ws.onclose = (event) => {
            console.log(`🔌 WebSocket connection closed (code: ${event.code}, reason: ${event.reason})`);
            this.isConnected = false;
            
            // Attempt reconnection if not intentionally closed
            if (event.code !== 1000 && event.code !== 1001) {
                this.attemptReconnect();
            }
        };

        this.ws.onerror = (error) => {
            console.error("❌ WebSocket error occurred:", error);
            this.isConnected = false;
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
            this.addToQueue(event);
            console.log(`📤 ${eventType} 이벤트 큐에 저장:`, event);
            return;
        }

        try {
            this.ws.send(JSON.stringify(event));
            console.log(`📤 ${eventType} 이벤트 즉시 전송:`, event);
        } catch (error) {
            // If immediate send fails, add to queue
            this.addToQueue(event);
            console.warn(`⚠️ ${eventType} 전송 실패, 큐에 저장:`, error);
        }
    }

    disconnect() {
        // Clear timers
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.queueCleanupTimer) {
            clearInterval(this.queueCleanupTimer);
            this.queueCleanupTimer = null;
        }

        // Close WebSocket connection
        if (this.ws) {
            this.ws.close(1000, 'Intentional disconnect'); // Normal closure
            this.ws = null;
        }

        // Reset state
        this.isConnected = false;
        this.connectionAttempts = 0;
        this.wsUrl = '';
        
        // Clear message queue to prevent memory leaks
        this.messageQueue = [];
        
        console.log('🔌 WebSocket service disconnected and cleaned up');
    }

    // Performance monitoring methods
    getQueueStats() {
        const now = Date.now();
        const expiredCount = this.messageQueue.filter(msg => 
            (now - msg.timestamp) > this.config.messageTTL
        ).length;

        return {
            queueSize: this.messageQueue.length,
            maxQueueSize: this.config.maxQueueSize,
            expiredMessages: expiredCount,
            isConnected: this.isConnected,
            connectionAttempts: this.connectionAttempts,
            queueUtilization: (this.messageQueue.length / this.config.maxQueueSize) * 100
        };
    }

    // Health check method
    isHealthy(): boolean {
        const stats = this.getQueueStats();
        return (
            this.isConnected &&
            stats.queueUtilization < 80 && // Queue not too full
            stats.expiredMessages === 0 && // No expired messages
            this.connectionAttempts < 3 // Not repeatedly failing to connect
        );
    }

    // Update configuration dynamically
    updateConfig(newConfig: Partial<WebSocketConfig>) {
        this.config = { ...this.config, ...newConfig };
        console.log('🔧 WebSocket configuration updated:', this.config);
    }
}

export const webSocketService = new WebSocketService();
