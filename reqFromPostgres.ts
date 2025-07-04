import { Pool, QueryResult } from 'pg';

// if (process.env.VERSION === 'dev') {
//   const pool = new Pool({
//     user: 'creo',
//     host: 'localhost',
//     database: 'mirage',
//     password: '',
//     port: 5432,
//   });
// }

// if (process.env.VERSION === 'prod') {
//   const pool = new Pool({
//     user: 'mirage_bot',
//     host: 'localhost',
//     database: 'mirage',
//     password: 'password',
//     port: 5432,
//   });
// }

const commonConfig = {
  host: 'localhost',
  database: 'mirage',
  port: 5432,
};

let pool: Pool;

switch (process.env.VERSION) {
  case 'dev':
    pool = new Pool({
      user: 'creo',
      password: '',
      ...commonConfig,
    });
    break;
  case 'prod':
    pool = new Pool({
      user: 'mirage_bot',
      password: 'password',
      ...commonConfig,
    });
    break;
  default:
    console.error('Ошибка: process.env.VERSION не определен или имеет неверное значение.');
    pool = new Pool(commonConfig);
    break;
}

export const query = async (text: string, params?: any[]): Promise<QueryResult<any>> => {
  const client = await pool.connect();
  try {
    const result: QueryResult = await client.query(text, params);
    return result;
  } catch (error) {
    console.error('Ошибка выполнения запроса:', error);
    throw error;
  } finally {
    client.release();
  }
};

export const getUsers = async () => {
  const users = await query('SELECT * FROM users');
  return users;
};

export const getName = async (tgId: number) => {
  console.log(tgId);

  const name = await query(`SELECT name FROM users WHERE tg_id=${tgId}`);
  return name;
};

export const updateUserTgId = async (phoneNumber: string, tgId: number) => {
  try {
    const result: QueryResult = await query('UPDATE users SET tg_id = $1 WHERE phone_number = $2', [
      tgId,
      phoneNumber,
    ]);

    if (result.rowCount === 1) {
      console.log(`tg_id обновлен для пользователя с phoneNumber: ${phoneNumber}`);
    } else {
      console.log(`Пользователь с phoneNumber: ${phoneNumber} не найден`);
    }
  } catch (error) {
    console.error('Ошибка обновления tg_id:', error);
  }
};

export const updateOfferToManagement = async (data: {
  name: string;
  tgId: number;
  subDivision: string;
  ideasType: string;
  idea: string;
  date: Date;
  checked: boolean;
}) => {
  try {
    const formattedDate = data.date.toISOString().slice(0, 10);

    await query(
      `INSERT INTO offers (name, tgId, subdivision, ideastype, idea, date, checked) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        data.name,
        data.tgId,
        data.subDivision,
        data.ideasType,
        data.idea,
        formattedDate,
        data.checked,
      ]
    );
    console.log('Предложение успешно добавлено в базу данных');
  } catch (error) {
    console.error('Ошибка при добавлении предложения в базу данных:', error);
  }
};

export const updateMessageToManagement = async (data: {
  name: string;
  tgId: number;
  destination: string;
  message: string;
  date: Date;
  checked: boolean;
}) => {
  try {
    const formattedDate = data.date.toISOString().slice(0, 10);

    await query(
      `INSERT INTO messages (name, tgId, destination, message, date, checked) VALUES ($1, $2, $3, $4, $5, $6)`,
      [data.name, data.tgId, data.destination, data.message, formattedDate, data.checked]
    );
    console.log('Предложение успешно добавлено в базу данных');
  } catch (error) {
    console.error('Ошибка при добавлении предложения в базу данных:', error);
  }
};

export const getMessages = async (accesTag: string, tgId: number) => {
  console.log(accesTag);
  console.log(tgId);

  if (accesTag === 'view-1') {
    const messages = await query(
      `SELECT name, subdivision, ideastype, idea, date, checked FROM offers`
    );
    return messages;
  }

  if (accesTag === 'view-2') {
    const messages = await query(
      `SELECT name, message, date, destination FROM messages WHERE destination=$1`,
      ['message-dir']
    );
    return messages;
  }

  if (accesTag === 'view-3') {
    const messages = await query(
      `SELECT name, message, date, destination FROM messages WHERE destination=$1`,
      ['message-founder']
    );
    return messages;
  }

  if (accesTag === 'view-4') {
    const messages = await query(
      `SELECT name, message, date, destination FROM messages WHERE destination=$1`,
      ['message-accountant']
    );
    return messages;
  }

  if (accesTag === 'view-5') {
    const messages = await query(
      `SELECT name, message, date, destination FROM messages WHERE destination=$1`,
      ['message-development-dir']
    );
    return messages;
  }

  if (accesTag === 'view-6') {
    const messages = await query(
      `SELECT name, subdivision, ideastype, idea, date, checked FROM offers WHERE tgId=$1`,
      [tgId]
    );
    return messages;
  }

  if (accesTag === 'view-7') {
    const messages = await query(
      `SELECT name, message, date, destination FROM messages WHERE tgId=$1`,
      [tgId]
    );
    return messages;
  }

  // const name = await query(`SELECT name FROM users WHERE tg_id=${tgId}`);
  // return name;
  return;
};

export const getAllTgId = async () => {
  const users = await query('SELECT name, tg_id FROM users');
  return users;
};

export const getUserFromName = async (name: string) => {
  console.log(name);

  const users = await query(`SELECT * FROM users WHERE name=$1`, [name + '\r\n\t\t\t']);
  return users;
};

export const fireUnfireUser = async (name: string, data: boolean) => {
  try {
    const result: QueryResult = await query('UPDATE users SET is_works = $1 WHERE name = $2', [
      data,
      name + '\r\n\t\t\t',
    ]);

    if (result.rowCount === 1) {
      console.log(`столбец is_works обновлен для пользователя с именем: ${name}`);
    } else {
      console.log(`Пользователь с именем: ${name} не найден`);
    }
  } catch (error) {
    console.error('Ошибка обновления сведений о трудоустройстве:', error);
  }
};

export const blockUnblockUser = async (name: string, data: boolean) => {
  try {
    const result: QueryResult = await query('UPDATE users SET blocked = $1 WHERE name = $2', [
      data,
      name + '\r\n\t\t\t',
    ]);

    if (result.rowCount === 1) {
      console.log(`столбец blocked обновлен для пользователя с именем: ${name}`);
    } else {
      console.log(`Пользователь с именем: ${name} не найден`);
    }
  } catch (error) {
    console.error('Ошибка обновления сведений о блокировке пользователя:', error);
  }
};
