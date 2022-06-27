import path from 'path';
import * as dotenv from 'dotenv';

function config() {
  // eslint-disable-next-line no-underscore-dangle
  const __dirname = path.resolve();
  const { parsed } = dotenv.config({ path: path.join(__dirname, '.env') });
  Object.assign(process.env, parsed);
}
config();

export { config };
