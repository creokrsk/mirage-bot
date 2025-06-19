import 'dotenv/config';
import * as bwipjs from 'bwip-js';
import { CronJob } from 'cron';

import {
  Bot,
  GrammyError,
  HttpError,
  InputFile,
  Keyboard,
  InlineKeyboard,
  session,
  Context,
  SessionFlavor,
} from 'grammy';
import {
  type Conversation,
  type ConversationFlavor,
  conversations,
  createConversation,
} from '@grammyjs/conversations';
import { Message } from 'grammy/types';
import {
  query,
  getUsers,
  updateUserTgId,
  getName,
  updateMessageToManagement,
  updateOfferToManagement,
  getMessages,
} from './reqFromPostgres';
import { updateXMLData } from './importXmlToPostgres';
import { downloadAndReplaceFile } from './ftpDownload';
import { reqFromXLSX } from './reqFromXLSX';

interface SessionData {
  name: string;
  ideaType: string;
  subdivision: string;
  idea: string;
}

function initial(): SessionData {
  return { name: '', ideaType: '', subdivision: '', idea: '' };
}

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
  .text('Отправить сообщение или предложение руководству')
  .resized()
  .row();

const timeKeyboard = new InlineKeyboard()
  .text('Отработано в этом месяце всего', 'this-month')
  .row()
  .text('Отработано в этом месяце по дням', 'this-month-days')
  .row()
  .text('Отработано в прошлом месяце', 'previous-month');

const messageKeyboard = new InlineKeyboard()
  .text('Предложение от сотрудника', 'ideas-from-employees')
  .row()
  .text('Сообщение для директора', 'message-dir')
  .row()
  .text('Сообщение для учредителя', 'message-founder')
  .row()
  .text('Сообщение для главного бухгалтера', 'message-accountant')
  .row()
  .text('Просмотр сообщений', 'view-message');

const ideasTypeKeyboard = new InlineKeyboard()
  .text('Развитие', 'idea-1')
  .row()
  .text('Административная', 'idea-2')
  .row()
  .text('Продажи', 'idea-3')
  .row()
  .text('Имидж', 'idea-4')
  .row()
  .text('Оптимизация', 'idea-5')
  .row()
  .text('Техническая', 'idea-6')
  .row()
  .text('Комфорт', 'idea-7')
  .row()
  .text('Маркетинг', 'idea-8')
  .row()
  .text('Лояльность', 'idea-9')
  .row()
  .text('Контроль', 'idea-10')
  .row()
  .text('Другое', 'idea-11');

const subdivisionKeyboard = new InlineKeyboard()
  .text('Управление', 'subdivision-1')
  .row()
  .text('Закуп', 'subdivision-2')
  .row()
  .text('Логистика', 'subdivision-3')
  .row()
  .text('Торговля', 'subdivision-4')
  .row()
  .text('Кадры', 'subdivision-5')
  .row()
  .text('АХЧ', 'subdivision-6')
  .row()
  .text('ИТ', 'subdivision-7')
  .row()
  .text('Маркетинг', 'subdivision-8')
  .row()
  .text('Интернет магазин', 'subdivision-9')
  .row()
  .text('Склад', 'subdivision-10')
  .row()
  .text('Другое', 'subdivision-11');

const readMessageKeyboard1 = new InlineKeyboard()
  .text('Просмотр предложений', 'read-view-message')
  .row()
  .text('Просмотр сообщений для директора', 'read-view-message-dir')
  .row()
  .text('Просмотр сообщений для учредителя', 'read-view-message-founder')
  .row()
  .text('Просмотр сообщений для главного бухгалтера', 'read-view-message-accountant');

const viewKeyboard1 = new InlineKeyboard()
  .text('Показать обращения', 'view-1')
  .row()
  .text('Сообщения для директора', 'view-2')
  .row()
  .text('Сообщения для учредителя', 'view-3')
  .row()
  .text('Сообщения для главного бухгалтера', 'view-4');

const viewKeyboard2 = new InlineKeyboard()
  .text('Показать обращения', 'view-1')
  .row()
  .text('Сообщения для главного бухгалтера', 'view-4');

const viewKeyboard3 = new InlineKeyboard().text('Показать обращения', 'view-1').row();

const viewKeyboard4 = new InlineKeyboard().text('Показать мои сообщения', 'view-0').row();

const viewKeyboard5 = new InlineKeyboard()
  .text('Показать мои идеи', 'view-5')
  .row()
  .text('Показать сообщения для руководства', 'view-6');

async function suggestionFromFnEmployee(
  conversation: Conversation,
  ctx: Context,
  userName: { name: string; tgId: number }
) {
  // const { name } = userName;
  const obj = {
    ideasType: '',
    subdivision: '',
    idea: '',
    name: userName.name,
    tgId: userName.tgId,
  };

  await ctx.reply('Выберите тип идеи:', {
    reply_markup: ideasTypeKeyboard,
  });

  const ideaType = await conversation.waitForCallbackQuery([
    'idea-1',
    'idea-2',
    'idea-3',
    'idea-4',
    'idea-5',
    'idea-6',
    'idea-7',
    'idea-8',
    'idea-9',
    'idea-10',
    'idea-11',
  ]);

  switch (ideaType.update.callback_query.data) {
    case 'idea-1':
      obj.ideasType = 'Развитие';
      break;
    case 'idea-2':
      obj.ideasType = 'Административная';
      break;
    case 'idea-3':
      obj.ideasType = 'Продажи';
      break;
    case 'idea-4':
      obj.ideasType = 'Имидж';
      break;
    case 'idea-5':
      obj.ideasType = 'Оптимизация';
      break;
    case 'idea-6':
      obj.ideasType = 'Техническая';
      break;
    case 'idea-7':
      obj.ideasType = 'Комфорт';
      break;
    case 'idea-8':
      obj.ideasType = 'Маркетинг';
      break;
    case 'idea-9':
      obj.ideasType = 'Лояльность';
      break;
    case 'idea-10':
      obj.ideasType = 'Контроль';
      break;
    case 'idea-11':
      obj.ideasType = 'Другое';
      break;
    default:
      obj.ideasType = 'Другое';
      break;
  }

  await ctx.reply('К какому подразделению относится идея:', {
    reply_markup: subdivisionKeyboard,
  });

  const subdivision = await conversation.waitForCallbackQuery([
    'subdivision-1',
    'subdivision-2',
    'subdivision-3',
    'subdivision-4',
    'subdivision-5',
    'subdivision-6',
    'subdivision-7',
    'subdivision-8',
    'subdivision-9',
    'subdivision-10',
    'subdivision-11',
  ]);

  switch (subdivision.update.callback_query.data) {
    case 'subdivision-1':
      obj.subdivision = 'Управление';
      break;
    case 'subdivision-2':
      obj.subdivision = 'Закуп';
      break;
    case 'subdivision-3':
      obj.subdivision = 'Логистика';
      break;
    case 'subdivision-4':
      obj.subdivision = 'Торговля';
      break;
    case 'subdivision-5':
      obj.subdivision = 'Кадры';
      break;
    case 'subdivision-6':
      obj.subdivision = 'АХЧ';
      break;
    case 'subdivision-7':
      obj.subdivision = 'ИТ';
      break;
    case 'subdivision-8':
      obj.subdivision = 'Маркетинг';
      break;
    case 'subdivision-9':
      obj.subdivision = 'Интернет магазин';
      break;
    case 'subdivision-10':
      obj.subdivision = 'Склад';
      break;
    case 'subdivision-11':
      obj.subdivision = 'Другое';
      break;
    default:
      obj.subdivision = 'Другое';
      break;
  }

  await ctx.reply('Опишите подробно вашу идею:');
  const ideaMessage = await conversation.waitFor('message:text');

  obj.idea = ideaMessage.update.message.text;

  await ctx.reply(
    `Ваше предложение:\nТип идеи: ${obj.ideasType}\nПодразделение: ${obj.subdivision}\nИдея: ${obj.idea}`
  );

  await ctx.reply(`Ваша идея принята!`);

  const nowDate = new Date();
  interface DataToReq {
    name: string;
    tgId: number;
    subDivision: string;
    ideasType: string;
    idea: string;
    date: Date;
    checked: boolean;
  }

  const dataToReq = {
    name: obj.name,
    tgId: obj.tgId,
    subDivision: obj.subdivision,
    ideasType: obj.ideasType,
    idea: obj.idea,
    date: nowDate,
    checked: false,
  };
  await updateOfferToManagement(dataToReq);
  return;
}

async function messageDir(
  conversation: Conversation,
  ctx: Context,
  data: { name: string; destination: string; tgId: number }
) {
  console.log(data.name);
  console.log(data.destination);

  await ctx.reply('Опишите подробно ваше сообщение для директора:');
  const ideaMessage = await conversation.waitFor('message:text');

  const messageTxt = ideaMessage.update.message.text;

  await ctx.reply(`Ваше сообщение:\n ${messageTxt}`);

  await ctx.reply(`Ваше обращение принято!`);

  const nowDate = new Date();
  interface DataToReq {
    name: string;
    tgId: number;
    destination: string;
    message: string;
    date: Date;
    checked: boolean;
  }

  const dataToReq = {
    name: data.name,
    tgId: data.tgId,
    destination: data.destination,
    message: messageTxt,
    date: nowDate,
    checked: false,
  };
  await updateMessageToManagement(dataToReq);
  return;
}

async function messageFounder(
  conversation: Conversation,
  ctx: Context,
  data: { name: string; destination: string; tgId: number }
) {
  console.log(data.name);
  console.log(data.destination);

  await ctx.reply('Опишите подробно ваше сообщение для учредителя:');
  const ideaMessage = await conversation.waitFor('message:text');

  // obj.idea = ideaMessage.update.message.text;
  const messageTxt = ideaMessage.update.message.text;

  await ctx.reply(`Ваше сообщение:\n ${messageTxt}`);

  await ctx.reply(`Ваше обращение принято!`);

  const nowDate = new Date();
  interface DataToReq {
    name: string;
    tgId: number;
    destination: string;
    message: string;
    date: Date;
    checked: boolean;
  }

  const dataToReq = {
    name: data.name,
    tgId: data.tgId,
    destination: data.destination,
    message: messageTxt,
    date: nowDate,
    checked: false,
  };
  await updateMessageToManagement(dataToReq);
  return;
}

async function messageAccountant(
  conversation: Conversation,
  ctx: Context,
  data: { name: string; destination: string; tgId: number }
) {
  console.log(data.name);
  console.log(data.destination);

  await ctx.reply('Опишите подробно ваше сообщение для главного бухгалтера:');
  const ideaMessage = await conversation.waitFor('message:text');

  // obj.idea = ideaMessage.update.message.text;
  const messageTxt = ideaMessage.update.message.text;

  await ctx.reply(`Ваше сообщение:\n ${messageTxt}`);

  await ctx.reply(`Ваше обращение принято!`);

  const nowDate = new Date();
  interface DataToReq {
    name: string;
    tgId: number;
    destination: string;
    message: string;
    date: Date;
    checked: boolean;
  }

  const dataToReq = {
    name: data.name,
    tgId: data.tgId,
    destination: data.destination,
    message: messageTxt,
    date: nowDate,
    checked: false,
  };
  await updateMessageToManagement(dataToReq);
  return;
}

async function viewMessage(
  conversation: Conversation,
  ctx: Context,
  // data: Record<string, string>
  data: { access: number; tgId: number }
) {
  console.log(data);

  switch (data.access) {
    case 1:
      await ctx.reply('Какие вопросы вы хотите посомтреть?', {
        reply_markup: viewKeyboard1,
      });

      const view = await conversation.waitForCallbackQuery([
        'view-1',
        'view-2',
        'view-3',
        'view-4',
      ]);

      if (view.update.callback_query.data === 'view-1') {
        // console.log('1');

        const messages = await getMessages(view.update.callback_query.data, data.tgId);
        console.log(messages?.rows);
        await ctx.reply(`Всего обращений зарегистрировано: ${messages?.rowCount}`);
        await ctx.reply(`Список обращений:`);
        for (let i = 0; i < messages?.rowCount || 0; i++) {
          await ctx.reply(
            `Имя: ${messages?.rows[i].name} \n дата обращения: ${messages?.rows[
              i
            ].date.getDate()}-${messages?.rows[i].date.getMonth()}-${messages?.rows[
              i
            ].date.getFullYear()}\n Тип идеи: ${messages?.rows[i].ideastype} \n Подразделение: ${
              messages?.rows[i].subdivision
            } \n Идея: ${messages?.rows[i].idea} \n`
          );
        }
        // name, subdivision, ideastype, idea, date
      }

      if (view.update.callback_query.data === 'view-2') {
        console.log('2');
        const messages = await getMessages(view.update.callback_query.data, data.tgId);
        console.log(messages?.rows);
        await ctx.reply(`Всего сообщений для директора зарегистрировано: ${messages?.rowCount}`);
        await ctx.reply(`Список обращений:`);
        for (let i = 0; i < messages?.rowCount || 0; i++) {
          await ctx.reply(
            `Имя: ${messages?.rows[i].name} \n дата обращения: ${messages?.rows[
              i
            ].date.getDate()}-${messages?.rows[i].date.getMonth()}-${messages?.rows[
              i
            ].date.getFullYear()}\n Вопрос: ${messages?.rows[i].message} \n`
          );
        }
      }
      if (view.update.callback_query.data === 'view-3') {
        console.log(3);
        const messages = await getMessages(view.update.callback_query.data, data.tgId);
        console.log(messages?.rows);
        await ctx.reply(`Всего сообщений для учредителя зарегистрировано: ${messages?.rowCount}`);
        await ctx.reply(`Список обращений:`);
        for (let i = 0; i < messages?.rowCount || 0; i++) {
          await ctx.reply(
            `Имя: ${messages?.rows[i].name} \n дата обращения: ${messages?.rows[
              i
            ].date.getDate()}-${messages?.rows[i].date.getMonth()}-${messages?.rows[
              i
            ].date.getFullYear()}\n Вопрос: ${messages?.rows[i].message} \n`
          );
        }
      }
      if (view.update.callback_query.data === 'view-4') {
        console.log(4);
        const messages = await getMessages(view.update.callback_query.data, data.tgId);
        console.log(messages?.rows);
        await ctx.reply(
          `Всего сообщений для главного бухгалтера зарегистрировано: ${messages?.rowCount}`
        );
        await ctx.reply(`Список обращений:`);
        for (let i = 0; i < messages?.rowCount || 0; i++) {
          await ctx.reply(
            `Имя: ${messages?.rows[i].name} \n дата обращения: ${messages?.rows[
              i
            ].date.getDate()}-${messages?.rows[i].date.getMonth()}-${messages?.rows[
              i
            ].date.getFullYear()}\n Вопрос: ${messages?.rows[i].message} \n`
          );
        }
      }
      break;
    case 2:
      await ctx.reply('Какие вопросы вы хотите посомтреть?', {
        reply_markup: viewKeyboard2,
      });

      const view2 = await conversation.waitForCallbackQuery([
        'view-1',
        // 'view-2',
        // 'view-3',
        'view-4',
      ]);

      if (view2.update.callback_query.data === 'view-1') {
        // console.log('1');

        const messages = await getMessages(view2.update.callback_query.data, data.tgId);
        console.log(messages?.rows);
        await ctx.reply(`Всего обращений зарегистрировано: ${messages?.rowCount}`);
        await ctx.reply(`Список обращений:`);
        for (let i = 0; i < messages?.rowCount || 0; i++) {
          await ctx.reply(
            `Имя: ${messages?.rows[i].name} \n дата обращения: ${messages?.rows[
              i
            ].date.getDate()}-${messages?.rows[i].date.getMonth()}-${messages?.rows[
              i
            ].date.getFullYear()}\n Тип идеи: ${messages?.rows[i].ideastype} \n Подразделение: ${
              messages?.rows[i].subdivision
            } \n Идея: ${messages?.rows[i].idea} \n`
          );
        }
      }

      if (view2.update.callback_query.data === 'view-4') {
        console.log(4);
        const messages = await getMessages(view2.update.callback_query.data, data.tgId);
        console.log(messages?.rows);
        await ctx.reply(
          `Всего сообщений для главного бухгалтера зарегистрировано: ${messages?.rowCount}`
        );
        await ctx.reply(`Список обращений:`);
        for (let i = 0; i < messages?.rowCount || 0; i++) {
          await ctx.reply(
            `Имя: ${messages?.rows[i].name} \n дата обращения: ${messages?.rows[
              i
            ].date.getDate()}-${messages?.rows[i].date.getMonth()}-${messages?.rows[
              i
            ].date.getFullYear()}\n Вопрос: ${messages?.rows[i].message} \n`
          );
        }
      }

      break;
    case 3:
      await ctx.reply('Какие вопросы вы хотите посомтреть?', {
        reply_markup: viewKeyboard3,
      });

      const view3 = await conversation.waitForCallbackQuery([
        'view-1',
        // 'view-2',
        // 'view-3',
        // 'view-4',
      ]);

      if (view3.update.callback_query.data === 'view-1') {
        const messages = await getMessages(view3.update.callback_query.data, data.tgId);
        console.log(messages?.rows);
        await ctx.reply(`Всего обращений зарегистрировано: ${messages?.rowCount}`);
        await ctx.reply(`Список обращений:`);
        for (let i = 0; i < messages?.rowCount || 0; i++) {
          await ctx.reply(
            `Имя: ${messages?.rows[i].name} \n дата обращения: ${messages?.rows[
              i
            ].date.getDate()}-${messages?.rows[i].date.getMonth()}-${messages?.rows[
              i
            ].date.getFullYear()}\n Тип идеи: ${messages?.rows[i].ideastype} \n Подразделение: ${
              messages?.rows[i].subdivision
            } \n Идея: ${messages?.rows[i].idea} \n`
          );
        }
      }
      break;

    case 0:
      await ctx.reply('Какие Обращения вы хотите посомтреть?', {
        reply_markup: viewKeyboard4,
      });
      const view4 = await conversation.waitForCallbackQuery([
        'view-1',
        'view-2',
        'view-3',
        'view-4',
        'view-0',
      ]);
      console.log(view4);
      console.log(data.tgId);
      if (view4.update.callback_query.data === 'view-0') {
        await ctx.reply('Какие Обращения вы хотите посомтреть?', {
          reply_markup: viewKeyboard5,
        });
        const view5 = await conversation.waitForCallbackQuery(['view-5', 'view-6']);

        if (view5.update.callback_query.data === 'view-5') {
          const messages = await getMessages(view5.update.callback_query.data, data.tgId);
          console.log(messages?.rows);
          await ctx.reply(`Всего обращений зарегистрировано: ${messages?.rowCount}`);
          await ctx.reply(`Список обращений:`);
          for (let i = 0; i < messages?.rowCount || 0; i++) {
            await ctx.reply(
              `Имя: ${messages?.rows[i].name} \n дата обращения: ${messages?.rows[
                i
              ].date.getDate()}-${messages?.rows[i].date.getMonth()}-${messages?.rows[
                i
              ].date.getFullYear()}\n Тип идеи: ${messages?.rows[i].ideastype} \n Подразделение: ${
                messages?.rows[i].subdivision
              } \n Идея: ${messages?.rows[i].idea} \n`
            );
          }
        }

        if (view5.update.callback_query.data === 'view-6') {
          const messages = await getMessages(view5.update.callback_query.data, data.tgId);
          console.log(messages?.rows);
          await ctx.reply(
            `Всего сообщений для руководства зарегистрировано: ${messages?.rowCount}`
          );
          await ctx.reply(`Список обращений:`);
          for (let i = 0; i < messages?.rowCount || 0; i++) {
            // await ctx.reply(
            //   `Имя: ${messages?.rows[i].name} \n дата обращения: ${messages?.rows[
            //     i
            //   ].date.getDate()}-${messages?.rows[i].date.getMonth()}-${messages?.rows[
            //     i
            //   ].date.getFullYear()}\n для кого: ${messages?.rows[i].destination} \n Вопрос: ${
            //     messages?.rows[i].message
            //   } \n`
            // );
            await ctx.reply(
              `Имя: ${messages?.rows[i].name} \n дата обращения: ${messages?.rows[
                i
              ].date.getDate()}-${messages?.rows[i].date.getMonth()}-${messages?.rows[
                i
              ].date.getFullYear()} \n Вопрос: ${messages?.rows[i].message} \n`
            );
          }
        }
      }

      break;

    default:
      break;
  }

  return;
}

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
    const userResult = await query('SELECT user_n FROM users WHERE tg_id = $1', [tgId]);

    if (userResult.rows.length === 0) {
      console.log(`Пользователь с tgId ${tgId} не найден`);
      return null;
    }

    const userN = userResult.rows[0].user_n;

    const hoursResult = await query('SELECT day, hours FROM worked_hours WHERE user_n = $1', [
      userN,
    ]);

    if (hoursResult.rows.length > 0) {
      const dailyHours = hoursResult.rows;

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

// type MyContext = Context & SessionFlavor<SessionData>;
// const bot = new Bot<MyContext>(process.env.BOT_API_KEY as string);
const bot = new Bot<ConversationFlavor<Context>>(process.env.BOT_API_KEY as string);

bot.use(session({ initial }));

bot.use(conversations());

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

const suggestionConversation = createConversation(suggestionFromFnEmployee);
bot.use(suggestionConversation);

const messageDirConversation = createConversation(messageDir);
bot.use(messageDirConversation);

const messageFounderConversation = createConversation(messageFounder);
bot.use(messageFounderConversation);

const messageAccountantConversation = createConversation(messageAccountant);
bot.use(messageAccountantConversation);

const view1MessageConversation = createConversation(viewMessage);
bot.use(view1MessageConversation);

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

bot.command('enter', async (ctx) => {
  await ctx.conversation.enter('hello');
});

bot.hears('Показать штрихкод', async (ctx) => {
  if (ctx.update.message) {
    const tgId = ctx.update.message.from.id;
    const userInfo = await getUserByTgId(tgId);
    if (!userInfo) {
      await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
    } else {
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
    await ctx.reply('В данный момент эта команда недоступна.');
  }
});

// bot.command('time', async (ctx) => {
bot.hears('Узнать колличество отработанных часов', async (ctx) => {
  ctx.reply('Выберите какую информкцию об отработаных часах вы хотите узнать', {
    reply_markup: timeKeyboard,
  });
});

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

bot.hears('Отправить сообщение или предложение руководству', async (ctx) => {
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
      const tgId = ctx.callbackQuery.from.id;
      // const userData = await getUserByTgId(tgId);
      const userData = await getWorkedHours(tgId);

      if (!userData) {
        await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
        return;
      }

      const { dailyHours } = userData;
      const dailyHoursThisMonth = filterDailyHoursByCurrentMonth(dailyHours);

      let sumHours = 0;

      if (dailyHoursThisMonth && dailyHoursThisMonth.length > 0) {
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
      await ctx.reply('В данный момент эта команда недоступна.');
    }
  }

  if (ctx.callbackQuery.data === 'this-month-days') {
    if (ctx.callbackQuery) {
      const tgId = ctx.callbackQuery.from.id;
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

      let sumHours = 0;

      if (dailyHoursThisMonth && dailyHoursThisMonth.length > 0) {
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

  if (ctx.callbackQuery.data === 'ideas-from-employees') {
    await ctx.answerCallbackQuery();
    if (ctx.callbackQuery) {
      const tgId = ctx.callbackQuery.from.id;
      const userName = await getName(tgId);
      const name = userName.rows[0].name.trim();
      console.log(name);
      // console.log(ctx.callbackQuery.message?.reply_markup?.inline_keyboard);

      if (!name) {
        await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
        return;
      }
      // ctx.session.name = name;

      await ctx.reply(`Здравствуйте ${name}`);

      const convReq = await ctx.conversation.enter('suggestionFromFnEmployee', { name, tgId });
    }
  }

  if (ctx.callbackQuery.data === 'message-dir') {
    await ctx.answerCallbackQuery();
    if (ctx.callbackQuery) {
      const tgId = ctx.callbackQuery.from.id;
      const userName = await getName(tgId);
      const name = userName.rows[0].name.trim();
      // console.log(name);
      // console.log(ctx.callbackQuery.message?.reply_markup?.inline_keyboard);

      if (!name) {
        await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
        return;
      }
      // ctx.session.name = name;

      await ctx.reply(`Здравствуйте ${name}`);

      const convReq = await ctx.conversation.enter('messageDir', {
        name,
        tgId,
        destination: 'message-dir',
      });
    } else {
      // await ctx.reply('Эта команда доступна только в личных чатах.');
      await ctx.reply('В данный момент отправка сообщений директору недоступна.');
    }
  }

  if (ctx.callbackQuery.data === 'message-founder') {
    await ctx.answerCallbackQuery();
    if (ctx.callbackQuery) {
      const tgId = ctx.callbackQuery.from.id;
      const userName = await getName(tgId);
      const name = userName.rows[0].name.trim();

      if (!name) {
        await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
        return;
      }

      await ctx.reply(`Здравствуйте ${name}`);

      const convReq = await ctx.conversation.enter('messageFounder', {
        name,
        tgId,
        destination: 'message-founder',
      });
    } else {
      // await ctx.reply('Эта команда доступна только в личных чатах.');
      await ctx.reply('В данный момент отправка сообщений учредителю недоступна.');
    }
  }

  if (ctx.callbackQuery.data === 'message-accountant') {
    await ctx.answerCallbackQuery();
    if (ctx.callbackQuery) {
      const tgId = ctx.callbackQuery.from.id;
      const userName = await getName(tgId);
      const name = userName.rows[0].name.trim();

      if (!name) {
        await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
        return;
      }

      await ctx.reply(`Здравствуйте ${name}`);

      const convReq = await ctx.conversation.enter('messageAccountant', {
        name,
        tgId,
        destination: 'message-accountant',
      });
    } else {
      await ctx.reply('В данный момент отправка сообщений главному бухгалтеру недоступна.');
    }
  }

  if (ctx.callbackQuery.data === 'view-message') {
    await ctx.answerCallbackQuery();
    if (ctx.callbackQuery) {
      const tgId = ctx.callbackQuery.from.id;
      const userName = await getName(tgId);
      const name = userName.rows[0].name.trim();

      switch (tgId) {
        case 25711166:
          console.log('12131213');
          const convReq = await ctx.conversation.enter('viewMessage', {
            access: 0,
            tgId,
            // name,
            // destination: 'message-accountant',
          });
          break;

        case 25711164:
          console.log(3333);

          break;

        default:
          const convReq0 = await ctx.conversation.enter('viewMessage', {
            access: 0,
            tgId,
            // name,
            // destination: 'message-accountant',
          });
          console.log('00000');

          break;
      }
      // if (tgId === 25711166) {
      //   await ctx.reply(`Здравствуйте ${name}, какие сообщения вы хотите просмотреть:`, {
      //     reply_markup: readMessageKeyboard1,
      //   });

      //   if (ctx.callbackQuery.data === 'read-view-message') {
      //     // Обработчик для "Показать все"
      //     console.log('1111');

      //     await ctx.answerCallbackQuery();

      //     // ... ваш код для получения и отображения всех сообщений
      //     // const messages = await getAllMessages();
      //     // ... ваш код для отображения messages пользователю
      //   }
      // }

      // if (!name) {
      //   await ctx.reply('Информации о вас отсутствует либо вы не предоставили свой номер телефона');
      //   return;
      // }

      // await ctx.reply(`Здравствуйте ${name}`);

      // const convReq = await ctx.conversation.enter('messageAccountant', {
      //   name,
      //   destination: 'message-accountant',
      // });
    } else {
      await ctx.reply('В данный момент просмотр сообщений недоступен.');
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
    '1 * * * * *',
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
  const job1 = new CronJob(
    '5 15 * * *',
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

  const job2 = new CronJob(
    '5 22 * * *',
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

  const job3 = new CronJob(
    '30 5 * * *',
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
