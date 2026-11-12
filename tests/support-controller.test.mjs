import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const golden=JSON.parse(fs.readFileSync(new URL('./support-fixture.json',import.meta.url),'utf8'));
test('wallet controller gates funding, blocks account changes, handles rejection and verifies a matching receipt',async()=>{
 const nodes=new Map();function node(id){if(!nodes.has(id))nodes.set(id,{id,hidden:false,disabled:false,open:false,value:'',textContent:'',children:[],classList:{toggle(){}},replaceChildren(){this.children=[];},append(x){this.children.push(x);},querySelectorAll(){return this.children;},addEventListener(){},showModal(){this.open=true;},close(){this.open=false;}});return nodes.get(id);}
 const memory=new Map();let chain='0x1237',balance=10n**20n,gas=10n**18n,account=golden.record.from,sends=0,reject=false;
 const provider={on(){},removeListener(){},async request({method}){if(method==='eth_chainId')return chain;if(['eth_accounts','eth_requestAccounts'].includes(method))return [account];if(method==='eth_sendTransaction'){sends++;if(reject)throw Object.assign(Error('declined'),{code:4001});return golden.record.hash;}throw Error(method);}};
 const original={document:globalThis.document,window:globalThis.window,localStorage:globalThis.localStorage,fetch:globalThis.fetch};
 globalThis.document={getElementById:node,createElement:()=>({disabled:false})};globalThis.window={ethereum:provider,addEventListener(){},dispatchEvent(){}};globalThis.localStorage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
 globalThis.fetch=async(url,options)=>{const {method,params}=JSON.parse(options.body);let result;
 if(method==='eth_chainId')result='0x1237';else if(method==='eth_getCode')result='0x6001';else if(method==='eth_getBalance')result='0x'+gas.toString(16);else if(method==='eth_gasPrice')result='0x1';else if(method==='eth_estimateGas')result='0xc350';else if(method==='eth_getTransactionReceipt')result={...golden.receipt,blockNumber:'0x10'};else if(method==='eth_getTransactionByHash')result=golden.tx;else if(method==='eth_getBlockByNumber')result={hash:golden.tx.blockHash};else if(method==='eth_call'){const data=params[0].data;result=data==='0x313ce567'?'0x12':data.startsWith('0x70a08231')?'0x'+balance.toString(16):'0x'+(1n).toString(16).padStart(64,'0');}else throw Error(method);
 return {ok:true,json:async()=>({result})};};
 try{
  await import('../dist/support/support.js');await new Promise(r=>setTimeout(r,0));
  balance=0n;await node('wallet-list').children[0].onclick();assert.equal(node('review').disabled,true);assert.equal(node('funding').hidden,false);
  balance=10n**20n;gas=0n;await node('refresh').onclick();assert.equal(node('review').disabled,true);
  gas=10n**18n;chain='0x1';await node('refresh').onclick();assert.equal(node('review').disabled,true);assert.equal(node('switch').hidden,false);
  chain='0x1237';await node('refresh').onclick();assert.equal(node('review').disabled,false);
  node('amount').value='1.25';await node('support-form').onsubmit({preventDefault(){}});assert.equal(node('review-dialog').open,true);assert.equal(sends,0);
  account='0x2222222222222222222222222222222222222222';await node('send').onclick();assert.equal(sends,0);assert.match(node('status').textContent,/account changed/i);
  account=golden.record.from;await node('refresh').onclick();await node('support-form').onsubmit({preventDefault(){}});reject=true;await node('send').onclick();assert.match(node('status').textContent,/declined/);assert.equal(memory.size,0);
  reject=false;await node('support-form').onsubmit({preventDefault(){}});await node('send').onclick();assert.equal(JSON.parse(memory.values().next().value).state,'verified');assert.equal(node('copy').hidden,false);assert.match(node('status').textContent,/Verified/);
 }finally{await new Promise(r=>setTimeout(r,750));Object.assign(globalThis,original);}
});
