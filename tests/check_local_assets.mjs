// Every local script, stylesheet and image referenced by published HTML must exist (catches 404s like a removed i18n.js).
// Usage: node tests/check_local_assets.mjs [site-dir ...]
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const SKIP=new Set([".git",".github","qa","tests","scripts","node_modules","dist","docs"]);
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const p=path.join(d,e.name);if(e.isDirectory())return SKIP.has(e.name)?[]:walk(p);return e.name.endsWith(".html")?[p]:[]});
let n=0;const missing=[];
for(const dir of (process.argv.slice(2).length?process.argv.slice(2):["."])) for(const file of walk(dir)){
  const h=fs.readFileSync(file,"utf8");
  for(const m of h.matchAll(/<(?:script|img|link)\b[^>]*?(?:src|href)="([^"#?]+)[^"]*"/g)){
    const ref=m[1]; if(/^(https?:|data:|mailto:|\/\/)/.test(ref)) continue;
    const target=ref.startsWith("/")?path.join(dir,ref):path.join(path.dirname(file),ref);
    n++; if(!fs.existsSync(target)) missing.push(`${file} -> ${ref}`);
  }
}
assert.deepEqual(missing,[],"Missing local assets:\n"+missing.join("\n"));
console.log(`All ${n} local asset references resolve.`);
