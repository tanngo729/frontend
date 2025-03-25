// src/utils/socketDebugger.js
/**
 * Utility để giúp debug socket.io events
 */

// Danh sách các sự kiện đã lắng nghe
const listeningEvents = new Set();

// Đánh dấu biến để bật/tắt debug 
const DEBUG_SOCKET = true;

/**
 * Thêm debug logging cho các sự kiện Socket.IO 
 * @param {Object} socket - Socket.IO instance
 */
export const debugSocket = (socket) => {
  if (!socket || !DEBUG_SOCKET) return;

  // Lưu lại các phương thức gốc
  const originalOn = socket.on.bind(socket);
  const originalEmit = socket.emit.bind(socket);

  // Override phương thức on để log các events được lắng nghe
  socket.on = (eventName, callback) => {
    listeningEvents.add(eventName);
    console.log(`[Socket] Listening for event: ${eventName}`);

    // Wrap callback để log khi event được triggered
    const wrappedCallback = (...args) => {
      console.log(`[Socket] Received event: ${eventName}`, args);
      return callback(...args);
    };

    return originalOn(eventName, wrappedCallback);
  };

  // Override phương thức emit để log các events được gửi đi
  socket.emit = (eventName, ...args) => {
    console.log(`[Socket] Emitting event: ${eventName}`, args);
    return originalEmit(eventName, ...args);
  };

  // Thêm phương thức để hiển thị tất cả events đang lắng nghe
  socket.showListeningEvents = () => {
    console.log('Currently listening events:', Array.from(listeningEvents));
    return Array.from(listeningEvents);
  };

  console.log('[Socket] Debug mode enabled');
  return socket;
};

/**
 * Connect đến socket.io server với debug mode
 * @param {Function} connectFn - Hàm kết nối socket
 * @returns {Object} - Socket.IO instance với debug
 */
export const connectWithDebug = (connectFn) => {
  try {
    const socket = connectFn();
    return debugSocket(socket);
  } catch (error) {
    console.error('[Socket] Connection error:', error);
    return null;
  }
};

export default {
  debugSocket,
  connectWithDebug
};