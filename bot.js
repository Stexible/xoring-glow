const TelegramBot = require('node-telegram-bot-api');

// Токен от @BotFather
const TOKEN = process.env.BOT_TOKEN || 'твой_токен_от_botfather';
const bot = new TelegramBot(TOKEN, { polling: true });

const SITE_URL = 'https://stexible.github.io/xoring-glow';

// Команда /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  
  bot.sendMessage(chatId, '🎮 Добро пожаловать в Xoring Glow!', {
    reply_markup: {
      inline_keyboard: [
        // КАЖДАЯ кнопка должна быть в отдельном массиве
        [{ 
          text: '🚀 Играть сейчас', 
          web_app: { url: SITE_URL }
        }],
        [{ 
          text: '📊 Лидерборд', 
          callback_data: 'leaderboard' 
        }],
        [{ 
          text: 'ℹ️ О игре', 
          callback_data: 'about' 
        }]
      ]
    }
  });
});

// Обработчик кнопок
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  
  if (query.data === 'leaderboard') {
    bot.sendMessage(chatId, '🏆 Топ игроков скоро здесь! Следи за обновлениями!');
  } else if (query.data === 'about') {
    bot.sendMessage(chatId, `🎯 Xoring Glow - увлекательная игра!\n\nСсылка для игры: ${SITE_URL}`);
  }
  
  // Ответ на callback (убираем "часики")
  bot.answerCallbackQuery(query.id);
});

// Команда /site
bot.onText(/\/site/, (msg) => {
  bot.sendMessage(msg.chat.id, `🌐 Ссылка на игру: ${SITE_URL}`, {
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Открыть игру', 
          web_app: { url: SITE_URL }
        }]
      ]
    }
  });
});

// Команда /help
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(msg.chat.id, `❓ Помощь по боту:\n\n/site - получить ссылку на игру\n/start - главное меню\n\nИгра: ${SITE_URL}`);
});

console.log('🤖 Бот запущен и готов к работе!');