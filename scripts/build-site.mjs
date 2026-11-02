// Tạo thư mục tĩnh cho GitHub Pages. Không chứa file game do người dùng sở hữu.
import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const out = path.join(root, '_site');
fs.rmSync(out, {recursive:true, force:true});
fs.mkdirSync(out, {recursive:true});
for (const p of ['index.html','play.html','launcher.html','app.js','favicon.svg','coi-serviceworker.js','LICENSE','NOTICE.md','README.VI.md','trial-eula.txt','runtime','fs','demo','assets','64']) {
  const from=path.join(root,p), to=path.join(out,p);
  if (!fs.existsSync(from)) { console.warn('Thiếu:',p); continue; }
  fs.cpSync(from,to,{recursive:true});
}
fs.writeFileSync(path.join(out,'.nojekyll'),'');
console.log('Static site ready:',out);
