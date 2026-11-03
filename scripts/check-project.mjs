import { readFile,readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import ejs from 'ejs';

const root=fileURLToPath(new URL('../',import.meta.url));
async function files(folder){const result=[];for(const entry of await readdir(path.join(root,folder),{withFileTypes:true})){const relative=path.join(folder,entry.name);if(entry.isDirectory())result.push(...await files(relative));else result.push(relative);}return result;}
const sourceFiles=(await Promise.all(['server','scripts','tests','views','public'].map(files))).flat();
for(const file of sourceFiles){
  if(/\.(?:js|mjs)$/.test(file)){const result=spawnSync(process.execPath,['--check',path.join(root,file)],{encoding:'utf8',windowsHide:true});if(result.status!==0)throw new Error(result.stderr);}
  if(file.endsWith('.ejs'))ejs.compile(await readFile(path.join(root,file),'utf8'),{filename:path.join(root,file)});
}
const packageJson=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
if(['next','react','react-dom','mysql2'].some(name=>name in packageJson.dependencies))throw new Error('A superseded framework/database dependency remains.');
const pages=sourceFiles.filter(file=>file.startsWith('views'+path.sep+'pages')&&file.endsWith('.ejs')&&!file.endsWith('error.ejs'));
// The saved-products route reuses the catalogue template as a distinct page purpose.
if(pages.length+1!==14)throw new Error('Expected fourteen purposeful page types.');
const manifest=JSON.parse(await readFile(path.join(root,'public/manifest.webmanifest'),'utf8'));
for(const icon of manifest.icons)await readFile(path.join(root,'public',icon.src));
console.log(`Checked JavaScript, ${sourceFiles.filter(file=>file.endsWith('.ejs')).length} EJS templates, 14 page purposes and PWA assets.`);
