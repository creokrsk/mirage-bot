const fs = require('fs');
const { Client } = require('pg');
const xml2js = require('xml2js');

// Настройка подключения к базе данных PostgreSQL
const client = new Client({
  user: 'creo',
  host: 'localhost',
  database: 'mirage',
  password: '',
  port: 5432,
});

client.connect();

// Функция для чтения и парсинга XML-файла
const parseXMLFile = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return reject(err);
      }
      xml2js.parseString(data, (err, result) => {
        if (err) {
          return reject(err);
        }
        // console.log(result);

        resolve(result);
      });
    });
  });
};

const insertDataToPostgres = async (data) => {
  const users = data['Выгрузка'];

  for (const userKey in users) {
    if (users.hasOwnProperty(userKey)) {
      const user = users[userKey][0];
      // console.log(user);
      // console.log(userKey);
      // console.log(users[userKey][0]);
      const name = user.ФИО?.[0]?.ФИО?.[0] || null;
      const phoneNumber = user.НомерТелефона?.[0]?.НомерТелефона?.[0] || null;
      const barcode = user.ШтрихКод?.[0]?.ШтрихКод?.[0] || null;
      const hoursWorked = user.ОтработанныеЧасы?.[0]?.ОтработанныеЧасы?.[0] || null;

      await client.query(
        'INSERT INTO users (user_n, name, phone_number, barcode, hours_worked) VALUES ($1, $2, $3, $4, $5)',
        [userKey, name, phoneNumber, barcode, hoursWorked]
      );
    }
  }
};

const main = async () => {
  console.log('111');

  try {
    console.log('2222');

    const xmlData = await parseXMLFile('./db/ВыгрузкаXML.XML');
    const users = xmlData;
    console.log('33333');

    // const users = xmlData;
    // console.log(users);

    await insertDataToPostgres(users);

    console.log('Data successfully inserted into PostgreSQL');
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.end();
  }
};

main();
