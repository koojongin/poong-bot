import mongoose from 'mongoose';

const { MONGODB_USER, MONGODB_PASSWORD } = process.env;

const uri = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@poong-bot.qa9xp.mongodb.net/poong-bot?retryWrites=true&w=majority`;

async function initDatabase() {
  return 1;
}

export {
  initDatabase,
};
