import { Pool, QueryResult } from 'pg';

const pool = new Pool({
  user: 'creo',
  host: 'localhost',
  database: 'mirage',
  password: '',
  port: 5432,
});

export const query = async (text: string, params?: any[]): Promise<any[]> => {
  const client = await pool.connect();
  try {
    const result: QueryResult = await client.query(text, params);
    return result.rows;
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

// export const getUser = async (data) => {
//   const users = await query('SELECT * FROM users WHERE name='data'');
//   return users;
// };
