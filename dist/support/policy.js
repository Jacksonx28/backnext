export const CHAIN_ID = '0x1237';
export const RPC = 'https://rpc.mainnet.chain.robinhood.com';
export const EXPLORER = 'https://robinhoodchain.blockscout.com';
export const TOKEN = '0x5173b8ea6923c2d40267890d45c46a3480954773';
export const RECIPIENT = '0x3622fc18e57d4adea145a4d411fa94c0135435f0';
export const REQUEST_ID = 'portfolio-pilot-1';
export const TITLE = 'A portfolio that helps you land your next client.';
export const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
export const HASH = /^0x[0-9a-fA-F]{64}$/;
export const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const same = (a,b) => typeof a === 'string' && typeof b === 'string' && a.toLowerCase() === b.toLowerCase();
export function parseAmount(value) {
 if (!/^(0|[1-9][0-9]{0,59})(\.[0-9]{1,18})?$/.test(value)) throw Error('Enter a plain positive amount with at most 18 decimal places.');
 const [whole,fraction=''] = value.split('.');
 const amount = BigInt(whole)*10n**18n + BigInt(fraction.padEnd(18,'0'));
 if (amount <= 0n || amount >= 2n**256n) throw Error('Amount is outside the supported range.');
 return amount;
}
export function formatAmount(amount) {
 const n = BigInt(amount), whole = n/10n**18n, fraction = (n%10n**18n).toString().padStart(18,'0').replace(/0+$/,'');
 return whole.toString() + (fraction ? '.'+fraction : '');
}
export function transferData(amount) {
 if (typeof amount !== 'bigint' || amount<=0n || amount>=2n**256n) throw Error('Invalid transfer amount.');
 return '0xa9059cbb'+RECIPIENT.slice(2).padStart(64,'0')+amount.toString(16).padStart(64,'0');
}
export function makeTransfer(from,amount) {
 if (!ADDRESS.test(from) || /^0x0{40}$/i.test(from)) throw Error('Invalid supporter address.');
 if (same(from,RECIPIENT)) throw Error('This is the creator’s receiving wallet. Use a separate supporter wallet to back the request.');
 return {from,to:TOKEN,value:'0x0',chainId:CHAIN_ID,data:transferData(amount)};
}
export function verifyTransfer(tx,receipt,record) {
 if (!tx || !receipt) throw Error('Transaction is still pending or unavailable.');
 if (!HASH.test(record.hash) || !same(tx.hash,record.hash) || !same(receipt.transactionHash,record.hash)) throw Error('Transaction hash does not match.');
 if (BigInt(receipt.status)!==1n) throw Error('Transaction reverted. No successful backing was recorded.');
 if (!tx.blockHash || !same(tx.blockHash,receipt.blockHash)) throw Error('Transaction block is not consistent. Check again.');
 if (tx.chainId && BigInt(tx.chainId)!==BigInt(CHAIN_ID)) throw Error('Wrong transaction network.');
 const expected = makeTransfer(record.from,BigInt(record.amount));
 if (!same(tx.from,expected.from) || !same(tx.to,TOKEN) || !same(receipt.to,TOKEN) || BigInt(tx.value)!==0n || !same(tx.input??tx.data,expected.data)) throw Error('Transaction does not match the reviewed WIF payment.');
 const found = receipt.logs?.some(log => !log.removed && same(log.address,TOKEN) && log.topics?.length===3 && same(log.topics[0],TRANSFER_TOPIC) && same(log.topics[1],'0x'+record.from.slice(2).toLowerCase().padStart(64,'0')) && same(log.topics[2],'0x'+RECIPIENT.slice(2).padStart(64,'0')) && /^0x[0-9a-fA-F]{64}$/.test(log.data) && BigInt(log.data)===BigInt(record.amount));
 if (!found) throw Error('No matching WIF Transfer event was found. This is not a verified backing payment.');
 return true;
}
