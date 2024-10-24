import 'dotenv/config';
import bwipjs from 'bwip-js';
import { CronJob } from 'cron';

import { Bot, GrammyError, HttpError, InputFile, Keyboard, Context } from 'grammy';
import { Message } from 'grammy/types';
import { query, getUsers, updateUserTgId } from './reqFromPostgres';
import { updateXMLData } from './importXmlToPostgres';

const getUserByPhone = async (phoneNumber: string) => {
  try {
    const users = await query('SELECT * FROM users WHERE phone_number = $1', [phoneNumber]);
    // console.log(users);

    if (users.rows.length > 0) {
      console.log('Найденные пользователи:', users.rows);
    } else {
      console.log(`Пользователь с номером телефона ${phoneNumber} не найден`);
    }
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
  }
};

const getUserByTgId = async (tgId: number) => {
  try {
    const users = await query('SELECT * FROM users WHERE tg_id = $1', [tgId]);
    // console.log(users);

    if (users.rows.length > 0) {
      // console.log('Найденные пользователи:', users.rows);
      return users.rows;
    } else {
      console.log(`Пользователь с таким Id ${tgId} не найден`);
    }
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
  }
};

function formatPhoneNumber(phoneNumber: string): string {
  if (phoneNumber.length !== 11 && phoneNumber.length !== 12) {
    return phoneNumber;
  }

  if (phoneNumber.length === 12) {
    return `7 (${phoneNumber.slice(2, 5)}) ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(
      8,
      10
    )} ${phoneNumber.slice(10)}\r\n\t\t\t`;
  }

  return `7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(
    7,
    9
  )} ${phoneNumber.slice(9)}\r\n\t\t\t`;
}

async function generateBarcode(
  text: string,
  barcodeType: string = 'code128'
): Promise<Buffer | null> {
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
}

// getUserName('Тарасенко Николай\r\n\t\t\t');
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
  await ctx.reply(
    'Привет! Это бот ООО Мираж! для полноценной работы вы должны поделиться своим номером телефона, для этого нужно выполнить команду /getphone'
  );
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
  console.log(ctx.from?.id);

  const formatPhone = formatPhoneNumber(phoneNumber);

  await getUserByPhone(formatPhone);
  await updateUserTgId(formatPhone, ctx.from.id);
  await ctx.reply(`Ваш номер телефона: ${phoneNumber}`);
});

bot.command('time', async (ctx) => {
  // console.log(ctx);
  if (ctx.update.message) {
    const tgId = ctx.update.message.from.id;
    const userInfo = await getUserByTgId(tgId);
    if (!userInfo) {
      await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
    }

    await ctx.reply(`Вы отработали ${userInfo[0].hours_worked} часов`);
  } else {
    // await ctx.reply('Эта команда доступна только в личных чатах.');
    await ctx.reply('В данный момент эта команда недоступна.');
  }
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
  // const generateBarcode = async (
  //   text: string,
  //   barcodeType: string = 'code128'
  // ): Promise<Buffer | null> => {
  //   try {
  //     const result = await bwipjs.toBuffer({
  //       bcid: barcodeType,
  //       text,
  //       scale: 3,
  //       height: 15,
  //       includetext: true,
  //       textxalign: 'center',
  //       padding: 10,
  //     });

  //     if (result && result.buffer) {
  //       return Buffer.from(result.buffer);
  //     } else {
  //       return null;
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     return null;
  //   }
  // };

  if (ctx.update.message) {
    const tgId = ctx.update.message.from.id;
    const userInfo = await getUserByTgId(tgId);
    if (!userInfo) {
      await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
    }

    // await ctx.reply(`Вы отработали ${userInfo[0].barcode} часов`);
    // const barcodeBuffer = await generateBarcode('1000003105372');
    const barcodeBuffer = await generateBarcode(userInfo[0].barcode);

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
  } else {
    // await ctx.reply('Эта команда доступна только в личных чатах.');
    await ctx.reply('В данный момент эта команда недоступна.');
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

const job = new CronJob(
  '0 3 * * *', // cronTime
  function () {
    const filePath = './db/ВыгрузкаXML.XML';
    updateXMLData(filePath);
    console.log('data is updated');
  }, // onTick
  null, // onComplete
  true, // start
  'Asia/Krasnoyarsk' // timeZone
);
