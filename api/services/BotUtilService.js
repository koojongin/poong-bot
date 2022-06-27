import * as c from '../commands/index.js';

const getCommandsInstance = () => c.commands;

const numberToDayString = (_number) => {
  const number = +_number;
  let dayOfWeek;
  switch (number) {
    default:
      dayOfWeek = '';
      break;
    case 0:
      dayOfWeek = '일';
      break;
    case 1:
      dayOfWeek = '월';
      break;
    case 2:
      dayOfWeek = '화';
      break;
    case 3:
      dayOfWeek = '수';
      break;
    case 4:
      dayOfWeek = '목';
      break;
    case 5:
      dayOfWeek = '금';
      break;
    case 6:
      dayOfWeek = '토';
      break;
    case 7:
      dayOfWeek = '일';
      break;
  }
  return dayOfWeek;
};

export {
  getCommandsInstance, numberToDayString,
};
