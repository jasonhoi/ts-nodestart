import fs from 'fs';
import path from 'path';
import url from 'url';

// import custom module (typescript)
import { hello } from './helper.js';
console.log(hello('Bill Gates'));

// recreate path params
const __scriptpath = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__scriptpath);
const __basedir = path.resolve(__dirname, '..');

// read a file
const filePath = path.join(__basedir, 'file.txt');
console.log(fs.readFileSync(filePath, 'utf-8'));
