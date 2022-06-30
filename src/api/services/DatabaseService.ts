import mongoose from 'mongoose';

async function connect() {
  const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@poong-bot.6v9a0.mongodb.net/poong-bot?retryWrites=true&w=majority`;
  const connection = await mongoose.connect(uri);
  return connection;
}

function bootstrapModels() {
  // fs.readdirSync(models)
  //   .filter((file) => ~file.search(/^[^.].*\.js$/))
  //   .forEach((file) => require(join(models, file)));
}

export { connect };
