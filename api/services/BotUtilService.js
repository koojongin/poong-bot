import * as c from '../commands/index.js';
const getCommandsInstance = function () {
    return c.commands;
}

const numberToDayString = (number) => {
    number = +number;
    let dayOfWeek = "";
    switch (number) {
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
}

export {
    getCommandsInstance, numberToDayString
}
