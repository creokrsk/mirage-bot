import 'dotenv/config';
import bwipjs from 'bwip-js';

import { Bot, GrammyError, HttpError, InputFile, Keyboard, Context } from 'grammy';
import { Message } from 'grammy/types';
// require('dotenv').config();
// const bwipjs = require('bwip-js');

// const { Bot, GrammyError, HttpError, InputFile } = require('grammy');
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

// const bot = new Bot(process.env.BOT_API_KEY);
const bot = new Bot(process.env.BOT_API_KEY as string);

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
  {
    command: 'getphone',
    description: 'отправить номер телефона',
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

const keyboard = new Keyboard().requestContact('Отправить контакт').resized();

bot.command('getphone', async (ctx) => {
  await ctx.reply('Пожалуйста, отправьте свой контакт', {
    reply_markup: keyboard,
  });
});

bot.on('message:contact', async (ctx) => {
  const phoneNumber = ctx.message.contact.phone_number;
  console.log(ctx.msg);
  await ctx.reply(`Ваш номер телефона: ${phoneNumber}`);
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
  await ctx.reply(`Ваш Id: ${ctx.from?.id}`);
});

// bot.hears('barcode', async (ctx) => {
//   const generateBarcode = async (text: string, barcodeType = 'code128') => {
//   try {
//     const { buffer: arrayBuffer } = bwipjs.toBuffer({
//       bcid: barcodeType, // Тип штрихкода (например, code128, code39, ean13)
//       text: text,
//       scale: 3,
//       height: 15,
//       includetext: true,
//       textxalign: 'center',
//       padding: 10,
//     });
//     const buffer = Buffer.from(arrayBuffer);
//     return buffer;
//   } catch (err) {
//     console.error(err);
//     return 'Ошибка при генерации штрихкода';
//   }
// };

// bot.hears('barcode', async (ctx) => {
bot.command('barcode', async (ctx) => {
  const generateBarcode = async (
    text: string,
    barcodeType: string = 'code128'
  ): Promise<Buffer | null> => {
    try {
      const result = await bwipjs.toBuffer({
        bcid: barcodeType,
        text,
        scale: 3,
        height: 15,
        includetext: true,
        textxalign: 'center',
        padding: 10,
      });

      if (result && result.buffer) {
        return Buffer.from(result.buffer);
      } else {
        return null;
      }
    } catch (err) {
      console.error(err);
      return null;
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
    return ctx.from?.id === 25711166;
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
