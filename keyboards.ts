import { Keyboard, InlineKeyboard } from 'grammy';

export const getphoneKeyboard = new Keyboard()
  .requestContact('Отправить контакт')
  .resized()
  .oneTime();

export const mainKeyboard = new Keyboard()
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

export const timeKeyboard = new InlineKeyboard()
  .text('Отработано в этом месяце всего', 'this-month')
  .row()
  .text('Отработано в этом месяце по дням', 'this-month-days')
  .row()
  .text('Отработано в прошлом месяце', 'previous-month');

export const messageKeyboard = new InlineKeyboard()
  .text('Предложение от сотрудника', 'ideas-from-employees')
  .row()
  .text('Сообщение для исполнительного директора', 'message-dir')
  .row()
  .text('Сообщение для генерального директора', 'message-founder')
  .row()
  // .text('Сообщение для бухгалтера', 'message-accountant')
  // .row()
  .text('Сообщение для директора по развитию', 'message-development-dir')
  .row()
  .text('Просмотр сообщений', 'view-message');

export const messageKeyboardAdmin = new InlineKeyboard()
  .text('Отправить объявление всем сотрудникам', 'message-to-all')
  .row()
  .text('Просмотр сообщений', 'view-message')
  .row()
  .text('Посмотреть список сотрудников', 'view-employees');

export const ideasTypeKeyboard = new InlineKeyboard()
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

export const subdivisionKeyboard = new InlineKeyboard()
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

export const readMessageKeyboard1 = new InlineKeyboard()
  .text('Просмотр предложений', 'read-view-message')
  .row()
  .text('Просмотр сообщений для исполнительного директора', 'read-view-message-dir')
  .row()
  .text('Просмотр сообщений для генерального директора', 'read-view-message-founder')
  .row()
  // .text('Просмотр сообщений для бухгалтера', 'read-view-message-accountant')
  // .row()
  .text('Просмотр сообщений для директора по развитию', 'read-view-development-dir');

export const viewKeyboard1 = new InlineKeyboard()
  .text('Показать обращения', 'view-1')
  .row()
  .text('Сообщения для исполнительного директора', 'view-2')
  .row()
  .text('Сообщения для генерального директора', 'view-3')
  .row()
  // .text('Сообщения для бухгалтера', 'view-4')
  // .row()
  .text('Сообщения для директора по развитию', 'view-5');

export const viewKeyboardFounder = new InlineKeyboard()
  .text('Показать обращения', 'view-1')
  .row()
  .text('Сообщения для генерального директора', 'view-3');

export const viewKeyboardDir = new InlineKeyboard()
  .text('Показать обращения', 'view-1')
  .row()
  .text('Сообщения для исполнительного директора', 'view-2');

export const viewKeyboardDevelopmentDir = new InlineKeyboard()
  .text('Показать обращения', 'view-1')
  .row()
  .text('Сообщения для директора по развитию', 'view-5');

export const viewKeyboardBuh = new InlineKeyboard()
  .text('Показать обращения', 'view-1')
  .row()
  .text('Сообщения для бухгалтера', 'view-4');

export const viewKeyboard3 = new InlineKeyboard().text('Показать обращения', 'view-1').row();

export const viewKeyboard4 = new InlineKeyboard().text('Показать мои сообщения', 'view-0').row();

export const viewKeyboard5 = new InlineKeyboard()
  .text('Показать мои идеи', 'view-6')
  .row()
  .text('Показать сообщения для руководства', 'view-7');

export const alphabetKeyboard = new InlineKeyboard()
  .text('А', 'А-letter')
  .text('Б', 'Б-letter')
  .text('В', 'В-letter')
  .text('Г', 'Г-letter')
  .row()
  .text('Д', 'Д-letter')
  .text('Е', 'Е-letter')
  .text('Ё', 'Ё-letter')
  .text('Ж', 'Ж-letter')
  .row()
  .text('З', 'З-letter')
  .text('И', 'И-letter')
  .text('К', 'К-letter')
  .text('Л', 'Л-letter')
  .row()
  .text('М', 'М-letter')
  .text('Н', 'Н-letter')
  .text('О', 'О-letter')
  .text('П', 'П-letter')
  .row()
  .text('Р', 'Р-letter')
  .text('С', 'С-letter')
  .text('Т', 'Т-letter')
  .text('У', 'У-letter')
  .row()
  .text('Ф', 'Ф-letter')
  .text('Х', 'Х-letter')
  .text('Ц', 'Ц-letter')
  .text('Ч', 'Ч-letter')
  .row()
  .text('Ш', 'Ш-letter')
  .text('Щ', 'Щ-letter')
  .text('Ы', 'Ы-letter')
  .text('Э', 'Э-letter')
  .row()
  .text('Ю', 'Ю-letter')
  .text('Я', 'Я-letter');

export const blockOrFireUserKeyboard = new InlineKeyboard()
  .text('Разблокировать/Заблокировать', 'block-unblock')
  .row()
  .text('Уволить/Отменить увольнение', 'fire-unfire')
  .row()
  .text('Выйти из меню', 'block-fire-cancel');

export const blockUserKeyboard = new InlineKeyboard()
  .text('Разблокировать', 'block-false')
  .text('Заблокировать', 'block-true');

export const fireUserKeyboard = new InlineKeyboard()
  .text('Отметить как работающего ', 'fire-false')
  .row()
  .text('Отметить как уволенного', 'fire-true');
