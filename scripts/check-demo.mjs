import fs from 'node:fs';import path from 'node:path';
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
const files=walk('dist');for(const file of files){if(/\.(?:html|js)$/.test(file)){const text=fs.readFileSync(file,'utf8');if(/eth_requestAccounts|eth_sendTransaction|wallet_switchEthereumChain|live\.html|contract\.json|ethers\.min/.test(text))throw new Error(`Live wallet integration found in demo: ${file}`);}}
for(const required of ['index.html','style.css','app.js','model.js','assets/backnext-logo.svg','assets/backnext-mark.svg'])if(!fs.existsSync('dist/'+required))throw new Error(`Missing ${required}`);
console.log(`Demo-only check passed (${files.length} published files; no live wallet entry points).`);
