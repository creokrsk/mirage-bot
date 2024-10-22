require('dotenv').config();
const bwipjs = require('bwip-js');

const { Bot, GrammyError, HttpError, InputFile } = require('grammy');
// const { ReqTodb } = require('./reqtodb');

// const fs = require('fs');
// const xml2js = require('xml2js');

// const parser = new xml2js.Parser();
// const xml = fs.readFileSync('./db/ВыгрузкаXML.XML', 'utf8');

// parser.parseString(xml, (err, result) => {
//   if (err) {
//     console.error(err);
//   } else {
//     const jsonData = result;
//     console.log(jsonData);
//   }
// });

const bot = new Bot(process.env.BOT_API_KEY);

bot.api.setMyCommands([
  {
    command: 'start',
    description: 'Запуск бота',
  },
  {
    command: 'time',
    description: 'Узнать колличество отработанных часов за полседний месяц',
  },
  {
    command: 'barcode',
    description: 'показать штрихкод сотрудника',
  },
]);

bot.command('start', async (ctx) => {
  await ctx.reply('Привет! Это бот ООО Мираж!');
});

bot.command('time', async (ctx) => {
  await ctx.reply('Вы отработали Х часов');
});

bot.command(['money', 'mymoney'], async (ctx) => {
  await ctx.reply('за последний месяц вам будет начисленно Х рублей!');
});

bot.on('message:voice', async (ctx) => {
  await ctx.reply('Голосовые сообщения не поддерживаются');
});

bot.on('message:photo', async (ctx) => {
  await ctx.reply('Бот не поддерживает обработку фотографий');
});

bot.on('message:entities:url', async (ctx) => {
  await ctx.reply('Ссылки не поддерживаются');
});

bot.hears(['ping', 'hi', 'пинг'], async (ctx) => {
  await ctx.reply('pong');
});

bot.hears('ID', async (ctx) => {
  await ctx.reply(`Ваш Id: ${ctx.from.id}`);
});

bot.hears('barcode', async (ctx) => {
  const generateBarcode = async (text, barcodeType = 'code128') => {
    try {
      const { buffer: arrayBuffer } = await bwipjs.toBuffer({
        bcid: barcodeType, // Тип штрихкода (например, code128, code39, ean13)
        text: text,
        scale: 3,
        height: 15,
        includetext: true,
        textxalign: 'center',
        padding: 10,
      });
      const buffer = Buffer.from(arrayBuffer);
      return buffer;
    } catch (err) {
      console.error(err);
      return 'Ошибка при генерации штрихкода';
    }
  };

  const barcodeBuffer = await generateBarcode('1000003105372');

  if (barcodeBuffer) {
    try {
      // console.log(barcodeBuffer);
      const inputFile = new InputFile(barcodeBuffer, 'barcode.png');
      await ctx.replyWithPhoto(inputFile);
      console.log('Штрихкод отправлен успешно');
    } catch (err) {
      // console.error('Ошибка при отправке штрихкода:', err);
      await ctx.reply('Ошибка при отправке штрихкода');
    }
  } else {
    await ctx.reply('Ошибка при генерации штрихкода');
  }
});

bot.on('msg').filter(
  (ctx) => {
    return ctx.from.id === 25711166;
  },
  async (ctx) => {
    await ctx.reply('Hello Alex');
  }
);

bot.on('msg', async (ctx) => {
  console.log(ctx.msg);

  await ctx.reply('Вы пока что не зарегистрированы');
});

bot.catch((error) => {
  const ctx = error.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = error.error;

  if (e instanceof GrammyError) {
    console.error('Error in request', e.description);
  } else if (e instanceof HttpError) {
    console.error('Could not contact Telegram', e);
  } else {
    console.error('Unknown error', e);
  }
});

bot.start();
