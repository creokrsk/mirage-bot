import 'dotenv/config';
import * as bwipjs from 'bwip-js';
import { CronJob } from 'cron';

import { Bot, GrammyError, HttpError, InputFile, Keyboard, InlineKeyboard, Context } from 'grammy';
import { Message } from 'grammy/types';
import { query, getUsers, updateUserTgId } from './reqFromPostgres';
import { updateXMLData } from './importXmlToPostgres';
import { downloadAndReplaceFile } from './ftpDownload';
import { reqFromXLSX } from './reqFromXLSX';

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

async function getWorkedHours(
  tgId: number
): Promise<{ dailyHours: { day: Date; hours: number }[] } | null> {
  try {
    // const hoursResult = await query(
    //   `
    //   // SELECT * FROM worked_hours WHERE tg_id = $1`,
    //   [tgId]
    // );
    const userResult = await query('SELECT user_n FROM users WHERE tg_id = $1', [tgId]);

    if (userResult.rows.length === 0) {
      console.log(`Пользователь с tgId ${tgId} не найден`);
      return null;
    }

    const userN = userResult.rows[0].user_n;

    const hoursResult = await query('SELECT day, hours FROM worked_hours WHERE user_n = $1', [
      userN,
    ]);

    // console.log(hoursResult);

    if (hoursResult.rows.length > 0) {
      const dailyHours = hoursResult.rows;

      // console.log(dailyHours);

      return { dailyHours };
    } else {
      console.log(`Данные о часах для пользователя ${tgId} не найдены`);
      return null;
    }
  } catch (error) {
    console.error('Ошибка при получении данных о часах:', error);
    return null;
  }
}

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
    const result: any = await bwipjs.toBuffer({
      bcid: barcodeType,
      text,
      scale: 3,
      height: 15,
      includetext: true,
      textxalign: 'center',
      padding: 10,
    } as any);

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

function filterDailyHoursByCurrentMonth(
  dailyHours: { day: Date; hours: number }[],
  month: string = 'current'
) {
  const nowDate = new Date();
  let currentMonth;
  if (month === 'current') {
    currentMonth = nowDate.getMonth();
  } else {
    currentMonth = nowDate.getMonth() - 1;
  }
  const currentYear = nowDate.getFullYear();

  return dailyHours.filter((dayData) => {
    const date = new Date(dayData.day);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
}

const bot = new Bot(process.env.BOT_API_KEY as string);

bot.api.setMyCommands([
  {
    command: 'start',
    description: 'Запуск бота',
  },
  {
    command: 'menu',
    description: 'показать меню',
  },
]);

const mainKeyboard = new Keyboard()
  .text('Показать штрихкод')
  .resized()
  .row()
  .text('Узнать колличество отработанных часов')
  .resized()
  .row()
  .text('Остаток средств для столовой')
  .resized()
  .row()
  .text('График отпусков')
  .resized()
  .row()
  .text('Отправить сообщение руководству')
  .resized()
  .row();

bot.command('start', async (ctx) => {
  await ctx.reply(
    'Привет! Это бот ООО Мираж! для полноценной работы вы должны поделиться своим номером телефона, для этого нужно выполнить команду /getphone'
  );
});

const getphoneKeyboard = new Keyboard().requestContact('Отправить контакт').resized().oneTime();

bot.command('getphone', async (ctx) => {
  await ctx.reply('Пожалуйста, отправьте свой контакт', {
    reply_markup: getphoneKeyboard,
  });
});

bot.on('message:contact', async (ctx) => {
  const phoneNumber = ctx.message.contact.phone_number;
  console.log(ctx.msg);
  console.log(ctx.from?.id);

  const formatPhone = formatPhoneNumber(phoneNumber);

  await getUserByPhone(formatPhone);
  await updateUserTgId(formatPhone, ctx.from.id);

  await ctx.reply(`Спасибо! Ваш номер телефона: ${phoneNumber}`, {
    reply_markup: { remove_keyboard: true },
  });
  // await ctx.reply(`Ваш номер телефона: ${phoneNumber}`);
});

bot.command('menu', async (ctx) => {
  await ctx.reply('Выберите один из пунктов меню', {
    reply_markup: mainKeyboard,
  });
});

bot.hears('Показать штрихкод', async (ctx) => {
  if (ctx.update.message) {
    const tgId = ctx.update.message.from.id;
    const userInfo = await getUserByTgId(tgId);
    if (!userInfo) {
      await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
    } else {
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
    }
  } else {
    // await ctx.reply('Эта команда доступна только в личных чатах.');
    await ctx.reply('В данный момент эта команда недоступна.');
  }
});

bot.hears('График отпусков', async (ctx) => {
  if (ctx.update.message) {
    const tgId = ctx.update.message.from.id;
    const userInfo = await getUserByTgId(tgId);
    // console.log(userInfo);

    if (!userInfo) {
      await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
    } else {
      const answer = reqFromXLSX(userInfo[0].name.trim(), userInfo[0].tg_id);
      await ctx.reply(
        `В соответствии с графиком отпусков запланированны следующие отпуска: \r\n${answer}`
      );
    }
  } else {
    // await ctx.reply('Эта команда доступна только в личных чатах.');
    await ctx.reply('В данный момент эта команда недоступна.');
  }
});

// bot.command('time', async (ctx) => {
bot.hears('Узнать колличество отработанных часов', async (ctx) => {
  const timeKeyboard = new InlineKeyboard()
    .text('Отработано в этом месяце всего', 'this-month')
    .row()
    .text('Отработано в этом месяце по дням', 'this-month-days')
    .row()
    .text('Отработано в прошлом месяце', 'previous-month');

  ctx.reply('Выберите какую информкцию об отработаных часах вы хотите узнать', {
    reply_markup: timeKeyboard,
  });
});

// bot.on('callback_query:data', async (ctx) => {
//   console.log(ctx.callbackQuery);
//   await ctx.answerCallbackQuery();
//   if (ctx.callbackQuery.data === 'this-month') {
//     if (ctx.callbackQuery) {
//       const tgId = ctx.callbackQuery.from.id;
//       const userInfo = await getUserByTgId(tgId);
//       if (!userInfo) {
//         await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
//       }

//       await ctx.reply(`Часов отработано в этом месяце: ${userInfo[0].hours_worked}`);
//     } else {
//       // await ctx.reply('Эта команда доступна только в личных чатах.');
//       await ctx.reply('В данный момент эта команда недоступна.');
//     }
//   }
//   if (ctx.callbackQuery.data === 'this-month-days') {
//     if (ctx.callbackQuery) {
//       const tgId = ctx.callbackQuery.from.id;
//       const userInfo = await getUserByTgId(tgId);
//       if (!userInfo) {
//         await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
//       }

//       await ctx.reply('Просмотр отработанных часов по дням пока недоступен');
//     } else {
//       // await ctx.reply('Эта команда доступна только в личных чатах.');
//       await ctx.reply('В данный момент эта команда недоступна.');
//     }
//   }
//   if (ctx.callbackQuery.data === 'previous-month') {
//     if (ctx.callbackQuery) {
//       const tgId = ctx.callbackQuery.from.id;
//       const userInfo = await getUserByTgId(tgId);
//       if (!userInfo) {
//         await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
//       }

//       await ctx.reply('Просмотр отработанных часов в прошедшем месяце пока недоступен');
//     } else {
//       // await ctx.reply('Эта команда доступна только в личных чатах.');
//       await ctx.reply('В данный момент эта команда недоступна.');
//     }
//   }
// });

bot.hears('Остаток средств для столовой', async (ctx) => {
  if (ctx.update.message) {
    const tgId = ctx.update.message.from.id;
    const userInfo = await getUserByTgId(tgId);
    // console.log(userInfo);

    if (!userInfo) {
      await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
    } else {
      const money = userInfo[0].money;

      if (money) {
        try {
          await ctx.reply(`${money.trim()} р.`);
          // console.log('Штрихкод отправлен успешно');
        } catch (err) {
          await ctx.reply('Ошибка при отправке остатка денежных стредств');
        }
      } else {
        await ctx.reply('Ошибка при запросе денежных стредств');
      }
    }
  } else {
    await ctx.reply('В данный момент эта команда недоступна.');
  }
});

bot.hears('Отправить сообщение руководству', async (ctx) => {
  const messageKeyboard = new InlineKeyboard()
    .text('Сообщение для директора', 'message-dir')
    .row()
    .text('Сообщение для учредителя', 'message-founder')
    .row()
    .text('Сообщение для главного бухгалтера', 'message-accountant');

  ctx.reply('Кому вы хотите отправить сообщение?', {
    reply_markup: messageKeyboard,
  });
});

bot.on('callback_query:data', async (ctx) => {
  await ctx.answerCallbackQuery();
  // console.log(ctx.callbackQuery);

  await ctx.answerCallbackQuery();
  if (ctx.callbackQuery.data === 'this-month') {
    if (ctx.callbackQuery) {
      // const tgId = ctx.callbackQuery.from.id;
      // const userInfo = await getUserByTgId(tgId);
      // if (!userInfo) {
      //   await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
      // }

      // await ctx.reply(`Часов отработано в этом месяце: ${userInfo[0].hours_worked}`);
      const tgId = ctx.callbackQuery.from.id;
      // const userData = await getUserByTgId(tgId);
      const userData = await getWorkedHours(tgId);

      if (!userData) {
        await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
        return;
      }

      const { dailyHours } = userData;
      const dailyHoursThisMonth = filterDailyHoursByCurrentMonth(dailyHours);

      // let message = `Сумма отработанных часов за месяц: ${totalHours || 0}\n`;
      let sumHours = 0;

      if (dailyHoursThisMonth && dailyHoursThisMonth.length > 0) {
        // message += 'Отработанные часы по дням:\n';
        dailyHoursThisMonth.forEach((dayData) => {
          if (dayData.hours) {
            sumHours += Number(dayData.hours);
          }
        });
      } else {
        await ctx.reply('Просмотр отработанных часов в этом месяце пока недоступен');
      }

      await ctx.reply(`${Math.round(sumHours * 100) / 100}  часов отработано вэтом месяце`);
    } else {
      // await ctx.reply('Эта команда доступна только в личных чатах.');
      await ctx.reply('В данный момент эта команда недоступна.');
    }
  }
  // if (ctx.callbackQuery.data === 'this-month-days') {
  //   if (ctx.callbackQuery) {
  //     const tgId = ctx.callbackQuery.from.id;
  //     const userInfo = await getUserByTgId(tgId);
  //     if (!userInfo) {
  //       await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
  //     }

  //     await ctx.reply('Просмотр отработанных часов по дням пока недоступен');
  //   } else {
  //     // await ctx.reply('Эта команда доступна только в личных чатах.');
  //     await ctx.reply('В данный момент эта команда недоступна.');
  //   }
  // }
  if (ctx.callbackQuery.data === 'this-month-days') {
    if (ctx.callbackQuery) {
      const tgId = ctx.callbackQuery.from.id;
      // const userData = await getUserByTgId(tgId);
      const userData = await getWorkedHours(tgId);

      if (!userData) {
        await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
        return;
      }

      const { dailyHours } = userData;

      // let message = `Сумма отработанных часов за месяц: ${totalHours || 0}\n`;
      let message = '';

      if (dailyHours && dailyHours.length > 0) {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        let currentMonthWord;
        switch (currentMonth) {
          case 1:
            currentMonthWord = 'январе';
            break;
          case 2:
            currentMonthWord = 'феврале';
            break;
          case 3:
            currentMonthWord = 'марте';
            break;
          case 4:
            currentMonthWord = 'апреле';
            break;
          case 5:
            currentMonthWord = 'мае';
            break;
          case 6:
            currentMonthWord = 'июне';
            break;
          case 7:
            currentMonthWord = 'июле';
            break;
          case 8:
            currentMonthWord = 'августе';
            break;
          case 9:
            currentMonthWord = 'сентябре';
            break;
          case 10:
            currentMonthWord = 'октябре';
            break;
          case 11:
            currentMonthWord = 'ноябре';
            break;
          case 12:
            currentMonthWord = 'декабре';
            break;
        }

        const dailyHoursThisMonth = filterDailyHoursByCurrentMonth(dailyHours);
        if (dailyHoursThisMonth.length === 0) {
          message += `Нет информации об отработанных часах в ${currentMonthWord}, либо ещё не произошло обовление данных\n`;
        } else {
          message += `Отработанные часы по дням в ${currentMonthWord}:\n`;
        }

        dailyHours.forEach((dayData) => {
          if (dayData.day && dayData.hours) {
            const date = new Date(dayData.day);
            const day = date.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();

            if (month === currentMonth && year === currentYear) {
              message += `${day}.${month}.${year}: ${dayData.hours} часов\n`;
              // message += `${dayData.day}: ${dayData.hours} часов\n`;
            }
          }
        });
      } else {
        message += 'Данные о часах по дням отсутствуют.\n';
      }

      await ctx.reply(message);
    } else {
      await ctx.reply('В данный момент эта команда недоступна.');
    }
  }
  if (ctx.callbackQuery.data === 'previous-month') {
    if (ctx.callbackQuery) {
      const tgId = ctx.callbackQuery.from.id;
      const userData = await getWorkedHours(tgId);

      if (!userData) {
        await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
        return;
      }

      const { dailyHours } = userData;
      const dailyHoursThisMonth = filterDailyHoursByCurrentMonth(dailyHours, 'previous');

      // let message = `Сумма отработанных часов за месяц: ${totalHours || 0}\n`;
      let sumHours = 0;

      if (dailyHoursThisMonth && dailyHoursThisMonth.length > 0) {
        // message += 'Отработанные часы по дням:\n';
        dailyHoursThisMonth.forEach((dayData) => {
          if (dayData.hours) {
            sumHours += Number(dayData.hours);
          }
        });
      } else {
        await ctx.reply('Нет данных об отработанных часах за прошлый месяц');
      }

      if (dailyHoursThisMonth.length !== 0) {
        await ctx.reply(`${Math.round(sumHours * 100) / 100}  часов отработано в прошлом месяце`);
      }
    } else {
      await ctx.reply('В данный момент эта команда недоступна.');
    }
  }

  if (ctx.callbackQuery.data === 'message-dir') {
    // await ctx.reply('Эта команда доступна только в личных чатах.');
    await ctx.reply('В данный момент отправка сообщений директору недоступна.');
  }

  if (ctx.callbackQuery.data === 'message-founder') {
    if (ctx.callbackQuery) {
      console.log(ctx.callbackQuery);

      // await ctx.reply('Эта команда доступна только в личных чатах.');
      await ctx.reply('В данный момент отправка сообщений учредителю недоступна.');
    }
  }

  if (ctx.callbackQuery.data === 'message-accountant') {
    if (ctx.callbackQuery) {
      console.log(ctx.callbackQuery);

      // await ctx.reply('Эта команда доступна только в личных чатах.');
      await ctx.reply('В данный момент отправка сообщений главному бухгалтеру недоступна.');
    }
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

bot.on('msg').filter(
  (ctx) => {
    // return ctx.from?.id === 25711166;
    return ctx.from?.id === 2571116;
  },
  async (ctx) => {
    await ctx.reply('Hello Alex');
  }
);

bot.on('msg', async (ctx) => {
  console.log(ctx.msg);

  await ctx.reply(`Данная команда не поддерживается`);
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

if (process.env.VERSION === 'dev') {
  const job = new CronJob(
    '5 * * * * *',
    // '0 3 * * *', // cronTime
    async function () {
      const filePath = './db/ВыгрузкаXML (6).XML';
      // await downloadAndReplaceFile(filePath);
      // await updateXMLData(filePath);

      // console.log('data is updated');
    }, // onTick
    null, // onComplete
    true, // start
    'Asia/Krasnoyarsk' // timeZone
  );
}

if (process.env.VERSION === 'prod') {
  const job = new CronJob(
    '0 3 * * *',
    async function () {
      const filePathUnloading = './db/ВыгрузкаXML.XML';
      const filePathVacationSchedule = './db/ГРАФИК ОТПУСКОВ.xlsx';
      await downloadAndReplaceFile(filePathUnloading);
      await updateXMLData(filePathUnloading);
      await downloadAndReplaceFile(filePathVacationSchedule);
      console.log('data is updated');
    },
    null,
    true,
    'Asia/Krasnoyarsk'
  );
}
