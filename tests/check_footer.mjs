// Every page uses the same shared footer: one <footer>, same structure, same six links per language.
// Usage: node tests/check_footer.mjs [site-dir ...]   (default: current directory)
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const SKIP=new Set([".git",".github","qa","tests","scripts","node_modules","dist","docs"]);
const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const p=path.join(d,e.name);if(e.isDirectory())return SKIP.has(e.name)?[]:walk(p);return e.name.endsWith(".html")&&!e.name.startsWith("google")?[p]:[]});
const PATHS=["","work.html","site-map.html","status.html","privacy.html"];
let n=0;
for(const dir of (process.argv.slice(2).length?process.argv.slice(2):["."])) for(const file of walk(dir)){
  const h=fs.readFileSync(file,"utf8");n++;
  const footers=h.match(/<footer\b[\s\S]*?<\/footer>/g)||[];
  assert.equal(footers.length,1,`${file}: exactly one footer expected`);
  const f=footers[0];
  assert(f.startsWith('<footer class="qx-footer" data-qx-footer="v2"><div class="qx-footer__inner"><div class="qx-footer__meta"><span class="qx-footer__brand">© 2026 qexus lab'),`${file}: footer must use the shared v2 markup`);
  const lang=h.match(/<html[^>]*lang="([a-z]+)/)[1];const p=lang==="ru"?"":lang+"/";
  const nav=f.match(/<nav class="qx-footer__links"[^>]*>([\s\S]*?)<\/nav>/)[1];
  const hrefs=[...nav.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(hrefs,[...PATHS.map(x=>"https://qexus.github.io/"+p+x),"https://github.com/qexus"],`${file}: footer links differ`);
  assert(h.includes('<link rel="stylesheet" href="https://qexus.github.io/shared/qx-footer.css">\n</head>'),`${file}: shared footer CSS must load last in <head>`);
}
assert(n>0,"No HTML pages found");
console.log(`Identical shared footer verified on ${n} pages.`);
