// Every canonical page needs share metadata, structured data and sane title/description.
// Usage: node tests/check_seo_meta.mjs [site-dir ...]   (default: current directory)
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const SKIP=new Set([".git",".github","qa","tests","scripts","node_modules","dist","docs"]);
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const p=path.join(d,e.name);if(e.isDirectory())return SKIP.has(e.name)?[]:walk(p);return e.name.endsWith(".html")&&!e.name.startsWith("google")?[p]:[]});
let n=0;
for(const dir of (process.argv.slice(2).length?process.argv.slice(2):["."])) for(const file of walk(dir)){
  const h=fs.readFileSync(file,"utf8");n++;
  for(const key of ["og:title","og:description","og:url","og:image","og:type"]) assert(h.includes(`property="${key}"`),`${file}: missing ${key}`);
  assert(h.includes('name="twitter:card" content="summary_large_image"'),`${file}: twitter card`);
  const ld=h.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert(ld,`${file}: missing JSON-LD`); JSON.parse(ld[1]);
  const title=h.match(/<title>([\s\S]*?)<\/title>/)[1];
  assert(!/^Урок \d\d :/.test(title),`${file}: French spacing in Ukrainian title`);
  const desc=h.match(/<meta\s+name="description"\s+content="([^"]*)"/)[1];
  assert(desc.length>=70&&desc.length<=170,`${file}: description length ${desc.length}`);
}
assert(n>0,"No HTML pages found");
console.log(`SEO metadata and JSON-LD verified on ${n} pages.`);
