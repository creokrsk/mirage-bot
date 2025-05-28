import xlsx from 'node-xlsx';

const formatVacationDates = (days: number[], year: number) => {
  const months = [
    'Января',
    'Февраля',
    'Марта',
    'Апреля',
    'Мая',
    'Июня',
    'Июля',
    'Августа',
    'Сентября',
    'Октября',
    'Ноября',
    'Декабря',
  ];
  let result = '';
  let currentGroup = [];

  if (days.length === 0) {
    return `на данный момент нет данных об отпуске на ${year}год`;
  }

  for (let i = 0; i < days.length; i++) {
    currentGroup.push(days[i]);

    if (days[i + 1] !== days[i] + 1 || i === days.length - 1) {
      if (currentGroup.length > 0) {
        const startDate = new Date(year, 0, currentGroup[0]);
        const endDate = new Date(year, 0, currentGroup[currentGroup.length - 1]);

        const startMonthName = months[startDate.getMonth()];
        const endMonthName = months[endDate.getMonth()];

        const startDateFormatted = `${startDate.getDate()} ${startMonthName}`;
        const endDateFormatted = `${endDate.getDate()} ${endMonthName}`;

        result += `${startDateFormatted} - ${endDateFormatted}, `;
      }
      currentGroup = [];
    }
  }
  return result.slice(0, -2);
};

export function reqFromXLSX(userName: string, tgId: string) {
  const workSheetsFromFile = xlsx.parse('./db/ГРАФИК ОТПУСКОВ.xlsx');

  const year = parseInt(workSheetsFromFile[0].data[0][0]) || new Date().getFullYear();
  let isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  let foundInd;
  for (let i = 0; i < workSheetsFromFile[0].data.length; i++) {
    const row = workSheetsFromFile[0].data[i];

    if (row && row[0] && row[0].toString().trim() === userName) {
      foundInd = i;
      break;
    }
  }

  if (foundInd) {
    const vacationDays = workSheetsFromFile[0].data[foundInd];
    const months = workSheetsFromFile[0].data[0];
    const days = workSheetsFromFile[0].data[1];
    const filledMonths = [...months];

    let currentMonth = '';
    for (let i = 0; i < months.length; i++) {
      if (months[i]) {
        currentMonth = months[i];
      } else if (currentMonth) {
        filledMonths[i] = currentMonth;
      }
    }

    const vacationDates = [];

    for (let i = 0; i < vacationDays.length; i++) {
      if (vacationDays[i] && typeof vacationDays[i] === 'number') {
        const monthName = filledMonths[i];
        const day = days[i];
        const isVacation = vacationDays[i];

        const vacationDate = { day, monthName };

        if (isVacation) {
          vacationDates.push(vacationDate);
        }
      }
    }

    const vacationDaysArray = [];

    if (isLeap) {
      for (let i = 1; i <= 366; i++) {
        if (vacationDays[i]) {
          vacationDaysArray.push(i);
        }
      }
    } else {
      for (let i = 1; i <= 365; i++) {
        if (vacationDays[i]) {
          vacationDaysArray.push(i);
        }
      }
    }

    const result = formatVacationDates(vacationDaysArray, year);

    return result;
  }
}
