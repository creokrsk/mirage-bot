import { importXMLData } from './importXmlToPostgres';
import { query, getUsers } from './reqFromPostgres';
// import { importXMLData } from '.importXMLData';

const runImport = async () => {
  await importXMLData();
};

// runImport();

const runReqUsers = async () => {
  try {
    const users = await getUsers();
    console.log(users);

    // const newUserName = 'John Doe';
    // await query('INSERT INTO users (name) VALUES ($1)', [newUserName]);
    // console.log(`Пользователь ${newUserName} добавлен`);
  } catch (error) {
    console.error('Произошла ошибка:', error);
  }
};

runReqUsers();

const getUserName = async (nameToFind: string) => {
  try {
    const users = await query('SELECT * FROM users WHERE name = $1', [nameToFind]);

    if (users.length > 0) {
      console.log('Найденные пользователи:', users);
    } else {
      console.log(`Пользователь с именем ${nameToFind} не найден`);
    }
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
  }
};

getUserName('Тарасенко Алена\r\n\t\t\t');
