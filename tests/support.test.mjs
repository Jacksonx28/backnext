import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';
import {TOKEN,RECIPIENT,CHAIN_ID,TRANSFER_TOPIC,parseAmount,formatAmount,makeTransfer,verifyTransfer} from '../dist/support/policy.js';
const from='0x1111111111111111111111111111111111111111',hash='0x'+'ab'.repeat(32),blockHash='0x'+'cd'.repeat(32),amount=parseAmount('1.25');
const golden=JSON.parse(fs.readFileSync(new URL('./support-fixture.json',import.meta.url),'utf8'));
const calldata=(to,value)=>'0xa9059cbb'+to.slice(2).padStart(64,'0')+value.toString(16).padStart(64,'0');
function fixture(){return structuredClone(golden);}
test('amount handling preserves 18-decimal precision and rejects unsafe inputs',()=>{assert.equal(parseAmount('0.000000000000000001'),1n);assert.equal(formatAmount(amount),'1.25');for(const input of ['0','-1','1e18','NaN','Infinity','1.0000000000000000001',' 1','01','0x10','1,000'])assert.throws(()=>parseAmount(input));});
test('transfer calldata matches ethers ABI and requests no native value or allowance',()=>{const tx=makeTransfer(from,amount);assert.equal(tx.data,golden.tx.input);assert.equal(tx.value,'0x0');assert.equal(tx.chainId,CHAIN_ID);assert.equal(tx.to,TOKEN);assert.equal(TRANSFER_TOPIC,golden.receipt.logs[0].topics[0]);});
test('creator cannot self-back and invalid supporters cannot send',()=>{assert.throws(()=>makeTransfer(RECIPIENT,amount));assert.throws(()=>makeTransfer('0x'+'0'.repeat(40),amount));assert.throws(()=>makeTransfer('fake',amount));});
test('accepts an exact successful transfer with its matching token event',()=>{const f=fixture();assert.equal(verifyTransfer(f.tx,f.receipt,f.record),true);});
test('rejects wrong token, recipient, amount, network, sender and native value',()=>{for(const change of [{to:from},{input:calldata(from,amount)},{input:calldata(RECIPIENT,amount+1n)},{chainId:'0x1'},{from:RECIPIENT},{value:'0x1'}]){const f=fixture();assert.throws(()=>verifyTransfer({...f.tx,...change},f.receipt,f.record));}});
test('rejects reverted, pending, unrelated, inconsistent and missing-event receipts',()=>{for(const change of [{status:'0x0'},{transactionHash:'0x'+'ff'.repeat(32)},{blockHash:'0x'+'00'.repeat(32)},{logs:[]},{to:from}]){const f=fixture();assert.throws(()=>verifyTransfer(f.tx,{...f.receipt,...change},f.record));}const f=fixture();assert.throws(()=>verifyTransfer(f.tx,null,f.record));});
test('rejects forged, removed and wrong-amount token events',()=>{for(const patch of [{address:from},{removed:true},{data:'0x'+(amount+1n).toString(16).padStart(64,'0')},{topics:['0x'+'00'.repeat(32)]}]){const f=fixture();f.receipt.logs[0]={...f.receipt.logs[0],...patch};assert.throws(()=>verifyTransfer(f.tx,f.receipt,f.record));}});
