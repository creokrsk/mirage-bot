import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  user: 'creo',
  host: 'localhost',
  database: 'mirage',
  password: '',
  port: 5432,
});

// const pool = new Pool({
//   user: 'mirage_bot',
//   host: 'localhost',
//   database: 'mirage',
//   password: 'password',
//   port: 5432,
// });

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

// export const getUser = async (data) => {
//   const users = await query('SELECT * FROM users WHERE name='data'');
//   return users;
// };
