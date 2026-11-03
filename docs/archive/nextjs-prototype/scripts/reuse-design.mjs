import { readFile,writeFile } from 'node:fs/promises';
const html=await readFile(new URL('../dist/index.html',import.meta.url),'utf8');
const icons=html.match(/<svg class="icon-sprite"[\s\S]*?<\/defs><\/svg>/)?.[0];
let hero=html.match(/<section class="hero"[\s\S]*?<\/section>/)?.[0];
if(!icons || !hero)throw new Error('Original marketplace artwork is missing.');
hero=hero.replaceAll('src="assets/','src="/assets/').replaceAll('href="assets/','href="/assets/').replace('href="#marketplace"','href="/products"').replace('<button class="hero-sell" data-action="sell">','<a class="hero-sell" href="/seller/products/new">').replace('Start selling<svg><use href="#i-up-right"/></svg></button>','Start selling<svg aria-hidden="true"><use href="#i-up-right"/></svg></a>').replace('<div class="hero-art">','<div class="hero-art"><canvas id="hero-three" aria-hidden="true"></canvas>');
await writeFile(new URL('../views/partials/icons.ejs',import.meta.url),icons);
await writeFile(new URL('../views/partials/hero.ejs',import.meta.url),hero);
