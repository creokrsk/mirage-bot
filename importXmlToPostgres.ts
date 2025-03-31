import * as fs from 'fs';
import { Parser } from 'xml2js';
import { Client } from 'pg';

const parseXMLFile = (filePath: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return reject(err);
      }
      new Parser().parseString(data, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  });
};

const updateUserOrInsert = async (data: any) => {
  const client = new Client({
    user: 'mirage_bot',
    host: 'localhost',
    database: 'mirage',
    password: 'password',
    port: 5432,
  });

  // CREATE TABLE users (
  //   user_n VARCHAR(255) PRIMARY KEY,
  //   name TEXT,
  //   phone_number TEXT,
  //   barcode TEXT
  // );

  // CREATE TABLE worked_hours (
  //   id SERIAL PRIMARY KEY,
  //   user_n VARCHAR(255) REFERENCES users(user_n),
  //   day INTEGER,
  //   hours NUMERIC
  // );

  //   ALTER TABLE worked_hours
  // ADD CONSTRAINT unique_user_day UNIQUE (user_n, day);

  await client.connect();

  // try {
  //   const users = data['Выгрузка'];
  //   for (const userKey in users) {
  //     if (users.hasOwnProperty(userKey)) {
  //       const user = users[userKey][0];
  //       const name = user.ФИО?.[0]?.ФИО?.[0] || null;
  //       const phoneNumber = user.НомерТелефона?.[0]?.НомерТелефона?.[0] || null;
  //       const barcode = user.ШтрихКод?.[0]?.ШтрихКод?.[0] || null;
  //       const hoursWorked = user.ОтработанныеЧасы?.[0]?.ОтработанныеЧасы?.[0] || null;

  //       const existsResult = await client.query('SELECT 1 FROM users WHERE user_n = $1', [userKey]);

  try {
    const users = data['Выгрузка'];

    for (const userKey in users) {
      if (users.hasOwnProperty(userKey)) {
        const user = users[userKey][0];
        const name = user.ФИО?.[0]?.ФИО?.[0] || null;
        const phoneNumber = user.НомерТелефона?.[0]?.НомерТелефона?.[0] || null;
        const barcode = user.ШтрихКод?.[0]?.ШтрихКод?.[0] || null;
        // const hoursWorked = user.ОтработанныеЧасы?.[0] || null;

        const existsResult = await client.query('SELECT 1 FROM users WHERE user_n = $1', [userKey]);

        if (existsResult.rows.length > 0) {
          await client.query(
            'UPDATE users SET name = $1, phone_number = $2, barcode = $3 WHERE user_n = $4',
            [name, phoneNumber, barcode, userKey]
          );
          console.log(`Данные пользователя ${userKey} обновлены`);
        } else {
          await client.query(
            'INSERT INTO users (user_n, name, phone_number, barcode) VALUES ($1, $2, $3, $4)',
            [userKey, name, phoneNumber, barcode]
          );
          console.log(`Пользователь ${userKey} добавлен`);
        }

        const workedHoursData = user.ОтработанныеЧасы?.[0] || null;

        if (workedHoursData) {
          const onlyFirstDay =
            Object.keys(workedHoursData).length === 1 && workedHoursData.hasOwnProperty('А01');

          if (onlyFirstDay) {
            await client.query('DELETE FROM worked_hours WHERE user_n = $1', [userKey]);
            console.log(`Таблица worked_hours обнулена для пользователя ${userKey}`);
          }

          for (const dateKey in workedHoursData) {
            if (workedHoursData.hasOwnProperty(dateKey) && dateKey.startsWith('А')) {
              const day = parseInt(dateKey.substring(1));
              // const hours = parseFloat(workedHoursData[dateKey][0] || '0');
              const hours = parseFloat(workedHoursData[dateKey][0]?.replace(',', '.') || '0');

              await client.query(
                'INSERT INTO worked_hours (user_n, day, hours) VALUES ($1, $2, $3) ON CONFLICT (user_n, day) DO UPDATE SET hours = $3',
                [userKey, day, hours]
              );
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
};

export async function updateXMLData(filePath: string = './db/ВыгрузкаXML.XML') {
  try {
    const xmlData = await parseXMLFile(filePath);
    await updateUserOrInsert(xmlData);
  } catch (err) {
    console.error('Error during XML data update:', err);
  }
}
