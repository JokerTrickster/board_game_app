// Simple event emitter implementation for React Native
class EventEmitter {
  private listeners: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    console.log(`Event listener added for ${event}`);
  }

  off(event: string, callback: Function) {
    if (!this.listeners[event]) {return;}
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    console.log(`Event listener removed for ${event}`);
  }

  emit(event: string, ...args: any[]) {
    console.log(`Emitting event: ${event}`, args);
    if (!this.listeners[event]) {return;}
    this.listeners[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  }
}

// Create a singleton event emitter instance
const eventEmitter = new EventEmitter();

export default eventEmitter;
