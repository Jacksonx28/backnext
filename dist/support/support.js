import {CHAIN_ID,RPC,EXPLORER,TOKEN,RECIPIENT,REQUEST_ID,HASH,ADDRESS,parseAmount,formatAmount,makeTransfer,verifyTransfer} from './policy.js';
const $=id=>document.getElementById(id), STORE='backnext-direct-support-v1';
let selected=null,account=null,busy=false,ready=false,review=null,record=null,epoch=0;
const wallets=new Map();
const status=(message,error=false)=>{$('status').textContent=message;$('status').classList.toggle('error',error);};
const friendly=e=>e?.code===4001?'Request declined in your wallet.':e?.code===-32002?'Open your wallet: a request is already waiting.':String(e?.message||e).slice(0,350);
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function rpc(method,params=[]) {
 const response=await fetch(RPC,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error('Robinhood RPC is unavailable. Try again; do not resend a pending payment.');
 const body=await response.json();if(body.error)throw Error(body.error.message||'Network request failed.');return body.result;
}
const call=data=>rpc('eth_call',[{to:TOKEN,data},'latest']);
async function verifyNetwork(){if(BigInt(await rpc('eth_chainId'))!==BigInt(CHAIN_ID))throw Error('The RPC returned the wrong network. Payments are disabled.');}
async function verifyToken(){await verifyNetwork();const [code,decimals]=await Promise.all([rpc('eth_getCode',[TOKEN,'latest']),call('0x313ce567')]);if(!code||code==='0x'||BigInt(decimals)!==18n)throw Error('WIF token verification failed. Payments are disabled.');}
function save(){try{localStorage.setItem(STORE,JSON.stringify(record));}catch{status('Browser storage is unavailable. Save the transaction link before leaving this page.',true);}}
function blocked(){return record && !['verified','reverted'].includes(record.state);}
function updateButtons(){ $('review').disabled=busy||!ready||!account||!!blocked();$('disconnect').disabled=busy;$('refresh').disabled=busy;$('switch').disabled=busy;for(const b of $('wallet-list').querySelectorAll('button'))b.disabled=busy;$('check').disabled=busy;$('amount').disabled=busy;$('consent').disabled=busy; }
function renderActivity(){
 $('activity').hidden=!record;if(!record){updateButtons();return;}
 $('tx-link').href=EXPLORER+'/tx/'+record.hash;$('tx-link').textContent=record.hash;
 const messages={pending:'Submitted — not yet verified. Do not pay again while this is pending.',verified:'Confirmed and verified: the exact WIF transfer was found on Robinhood Chain.',reverted:'Transaction reverted. No successful backing was recorded.',unverified:'Could not verify this payment. Check the explorer before taking further action.'};
 $('receipt-state').textContent=messages[record.state]||messages.pending;
 $('receipt-detail').textContent=`${formatAmount(record.amount)} $wif · from ${record.from} · request ${REQUEST_ID}. The request association is recorded by this site, not enforced by a smart contract.`;
 $('copy').hidden=record.state!=='verified';updateButtons();
}
function resetReview(){review=null;if($('review-dialog').open)$('review-dialog').close();}
function changed(){epoch++;ready=false;resetReview();updateButtons();if(!busy)refresh().catch(e=>status(friendly(e),true));else status('Wallet account or network changed. Check the transaction status before continuing.',true);}
function removeListeners(){selected?.removeListener?.('accountsChanged',changed);selected?.removeListener?.('chainChanged',changed);selected?.removeListener?.('disconnect',changed);}
function walletChoices(){
 if(window.ethereum?.request&&!Array.from(wallets.values()).some(x=>x.provider===window.ethereum))wallets.set('injected',{provider:window.ethereum,name:window.ethereum.isRabby?'Rabby':window.ethereum.isMetaMask?'MetaMask':'Browser wallet'});
 $('wallet-list').replaceChildren();for(const item of wallets.values()){const b=document.createElement('button');b.type='button';b.textContent='Connect '+item.name;b.disabled=busy;b.onclick=()=>connect(item.provider);$('wallet-list').append(b);}
 if(!wallets.size){const p=document.createElement('p');p.className='fine';p.textContent='Open this page in the browser where Rabby or MetaMask is installed, or in an EVM wallet’s browser. QR pairing is not included in this pilot.';$('wallet-list').append(p);}
}
window.addEventListener('eip6963:announceProvider',event=>{const d=event.detail;if(d?.provider?.request&&typeof d.info?.uuid==='string'){wallets.set(d.info.uuid,{provider:d.provider,name:String(d.info.name||'Wallet').slice(0,50)});walletChoices();}});
async function connect(provider){if(busy)return;busy=true;updateButtons();try{await provider.request({method:'eth_requestAccounts'});removeListeners();selected=provider;epoch++;for(const event of ['accountsChanged','chainChanged','disconnect'])selected.on?.(event,changed);await refresh();}catch(e){status(friendly(e),true);}finally{busy=false;updateButtons();}}
async function walletCheck(expected){
 if(!selected)throw Error('Connect your wallet first.');
 const chain=await selected.request({method:'eth_chainId'});if(BigInt(chain)!==BigInt(CHAIN_ID))throw Error('Switch your wallet to Robinhood Chain mainnet (4663).');
 const accounts=await selected.request({method:'eth_accounts'});if(!accounts[0]||accounts[0].toLowerCase()!==expected.toLowerCase())throw Error('Your account changed. Connect again and review a new payment.');
}
async function refresh(){
 const version=++epoch;ready=false;updateButtons();if(!selected)return;
 const [accounts,chain]=await Promise.all([selected.request({method:'eth_accounts'}),selected.request({method:'eth_chainId'})]);if(version!==epoch)return;
 account=accounts[0]||null;$('wallet').textContent=account||'No wallet connected.';$('disconnect').hidden=!account;$('refresh').hidden=!account;$('switch').hidden=!account||BigInt(chain)===BigInt(CHAIN_ID);$('balances').textContent='';$('funding').hidden=true;
 if(!account){status('Connect a supporter wallet to continue.');return;}
 if(BigInt(chain)!==BigInt(CHAIN_ID)){status('Connected to a different network. Switch to Robinhood Chain mainnet.');return;}
 await verifyToken();const [balance,eth]=await Promise.all([call('0x70a08231'+account.slice(2).padStart(64,'0')),rpc('eth_getBalance',[account,'latest'])]);if(version!==epoch)return;
 $('balances').textContent=`Available: ${formatAmount(BigInt(balance))} $wif · ${formatAmount(BigInt(eth))} ETH for gas`;
 $('funding').hidden=BigInt(balance)>0n;
 if(account.toLowerCase()===RECIPIENT){status('You connected the creator’s receiving wallet. A separate supporter wallet must make the payment.');return;}
 if(BigInt(eth)===0n){status('Add ETH on Robinhood Chain for the network fee, then refresh balances.');return;}
 if(BigInt(balance)===0n){status('You have gas, but no $wif. Use the token link below, then return and refresh.');return;}
 ready=true;status(blocked()?'A payment is awaiting verification. Check its confirmation below.':'Ready. Enter an amount to review; connecting has not authorized any payment.');updateButtons();
}
async function preflight(from,amount){
 const version=epoch;await walletCheck(from);await verifyToken();const tx=makeTransfer(from,amount);
 const balance=BigInt(await call('0x70a08231'+from.slice(2).padStart(64,'0')));if(balance<amount)throw Error('Not enough WIF for this amount.');
 const [result,estimate,price,eth]=await Promise.all([rpc('eth_call',[tx,'latest']),rpc('eth_estimateGas',[tx]),rpc('eth_gasPrice'),rpc('eth_getBalance',[from,'latest'])]);
 if(!/^0x[0-9a-fA-F]{64}$/.test(result)||BigInt(result)!==1n)throw Error('The token transfer simulation did not succeed. Nothing was sent.');
 const fee=BigInt(estimate)*BigInt(price);if(BigInt(eth)<fee*12n/10n)throw Error('Not enough ETH for the estimated fee plus a small buffer. Add gas and try again.');
 await walletCheck(from);if(version!==epoch)throw Error('Wallet changed while checking. Review again.');return {tx,fee};
}
$('support-form').onsubmit=async event=>{event.preventDefault();if(busy||blocked())return;busy=true;updateButtons();try{const amount=parseAmount($('amount').value.trim()),from=account;status('Checking your balance and simulating the exact transfer…');const {fee}=await preflight(from,amount);review={from,amount,version:epoch};$('review-from').textContent=from;$('review-amount').textContent=formatAmount(amount)+' $wif';$('review-fee').textContent='Approximately '+formatAmount(fee)+' ETH. Your wallet shows the final estimate.';$('review-dialog').showModal();status('Review the recipient and amount before opening your wallet.');}catch(e){status(friendly(e),true);}finally{busy=false;updateButtons();}};
$('cancel').onclick=resetReview;
$('review-dialog').addEventListener('cancel',e=>{if(busy)e.preventDefault();else review=null;});
$('send').onclick=async()=>{
 if(busy||!review||blocked())return;const snapshot=review;busy=true;updateButtons();$('send').disabled=true;$('cancel').disabled=true;let submitted=false;
 try{
  if(snapshot.version!==epoch)throw Error('Wallet changed. Review again.');
  const {tx}=await preflight(snapshot.from,snapshot.amount);
  status('Review the payment in your wallet. Only you can approve it.');
  const hash=await selected.request({method:'eth_sendTransaction',params:[tx]});
  if(!HASH.test(hash))throw Error('Wallet did not return a valid transaction hash. Check wallet activity before retrying.');
  submitted=true;record={hash,from:snapshot.from,amount:snapshot.amount.toString(),request:REQUEST_ID,state:'pending'};save();renderActivity();resetReview();status('Payment submitted. Waiting for its receipt—do not submit again.');
  await checkConfirmation(true);
 }catch(e){status(friendly(e)+(submitted?' Use Check confirmation to retry verification.':''),true);}finally{busy=false;$('send').disabled=false;$('cancel').disabled=false;resetReview();updateButtons();}
};
async function checkConfirmation(wait=false){
 if(!record)return;const current={...record};await verifyNetwork();
 for(let i=0;i<(wait?24:1);i++){
  const [receipt,tx]=await Promise.all([rpc('eth_getTransactionReceipt',[current.hash]),rpc('eth_getTransactionByHash',[current.hash])]);
  if(receipt){
   if(BigInt(receipt.status)===0n){record.state='reverted';save();renderActivity();status('The transaction reverted. No backing was recorded.',true);return;}
   try{verifyTransfer(tx,receipt,current);const block=await rpc('eth_getBlockByNumber',[receipt.blockNumber,false]);if(block?.hash?.toLowerCase()!==receipt.blockHash.toLowerCase())throw Error('Block confirmation changed. Check again.');record.state='verified';save();renderActivity();status('Verified: your WIF reached the creator. Copy the transaction link below.');return;}
   catch(e){record.state='unverified';save();renderActivity();throw e;}
  }
  if(wait)await pause(2500);
 }
 status('Confirmation is still pending. Save the transaction link and check again. Do not pay again.');
}
$('check').onclick=async()=>{if(busy)return;busy=true;updateButtons();try{await checkConfirmation();}catch(e){status(friendly(e),true);}finally{busy=false;updateButtons();}};
$('copy').onclick=async()=>{if(record?.state!=='verified')return;try{await navigator.clipboard.writeText(EXPLORER+'/tx/'+record.hash);status('Verified transaction link copied.');}catch{status('Copy the visible transaction link manually.');}};
$('switch').onclick=async()=>{if(busy||!selected)return;busy=true;updateButtons();try{await selected.request({method:'wallet_switchEthereumChain',params:[{chainId:CHAIN_ID}]});await refresh();}catch(e){status(e?.code===4902?'Add Robinhood Chain mainnet (4663) in your wallet using docs.robinhood.com/chain/connecting, then reconnect.':friendly(e),true);}finally{busy=false;updateButtons();}};
$('refresh').onclick=()=>refresh().catch(e=>status(friendly(e),true));
$('disconnect').onclick=()=>{if(busy)return;removeListeners();selected=null;account=null;ready=false;epoch++;resetReview();$('wallet').textContent='Disconnected.';$('balances').textContent='';$('disconnect').hidden=true;$('refresh').hidden=true;$('switch').hidden=true;$('funding').hidden=true;status('Disconnected from this page. You can also revoke site access in your wallet.');updateButtons();};
$('recipient').textContent=RECIPIENT;$('recipient').href=EXPLORER+'/address/'+RECIPIENT;$('token').textContent=TOKEN;$('token').href=EXPLORER+'/token/'+TOKEN;
try{const saved=JSON.parse(localStorage.getItem(STORE));if(saved&&HASH.test(saved.hash)&&ADDRESS.test(saved.from)&&/^[0-9]+$/.test(saved.amount)&&saved.request===REQUEST_ID){makeTransfer(saved.from,BigInt(saved.amount));record={...saved,state:'pending'};}}catch{}
walletChoices();window.dispatchEvent(new Event('eip6963:requestProvider'));setTimeout(walletChoices,700);renderActivity();
verifyToken().then(()=>status('Network and WIF token checked. Connect a supporter wallet to begin.')).catch(e=>status(friendly(e),true));
if(record)checkConfirmation().catch(e=>status(friendly(e),true));
