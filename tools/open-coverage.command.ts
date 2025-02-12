import path, { resolve } from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const coverageHtml = process.argv[2];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = resolve(__dirname, `../coverage/${coverageHtml}`);
const start =
  process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open';
exec(`${start} ${url}`);
