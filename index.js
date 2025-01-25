const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Разрешаем подключения с любого источника. Измените на ваш домен в продакшене.
    methods: ['GET', 'POST']
  }
});

// Настройка статической папки для фронтенда
app.use(express.static(path.join(__dirname, 'public')));

// Обработка WebSocket соединений
io.on('connection', (socket) => {
  console.log('Клиент подключен:', socket.id);

  // Обработчик для получения видео кадров
  socket.on('video_frame', (data) => {
    // Отправляем полученный кадр всем подключенным клиентам
    io.emit('video_frame', data);
  });

  // Обработчик отключения
  socket.on('disconnect', (reason) => {
    console.log(`Клиент отключен: ${socket.id} по причине: ${reason}`);
  });

  // Обработчик ошибок
  socket.on('error', (err) => {
    console.error('Ошибка сокета:', err);
  });
});

// Обработка ошибок сервера
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  // Обработка ошибок связанных с занятым портом
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

// Обработка события завершения работы сервера
server.on('close', () => {
  console.log('Сервер остановлен');
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});


