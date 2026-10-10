import test from 'node:test';import assert from 'node:assert/strict';import {accessReason,safeMeeting} from './access.js';import {makePDF,renderAgreement} from './pdf.js';
const now=Date.parse('2026-10-10T12:00:00Z'),profile={status:'active'},meeting={status:'scheduled',access_opens_at:'2026-10-10T11:00:00Z',access_expires_at:'2026-10-10T13:00:00Z',meet_url:'https://meet.google.com/private'};
test('access granted only when every condition holds',()=>assert.equal(accessReason(profile,meeting,{},false,now),null));
for(const [name,p,m,s,r,n,expected] of [['unsigned',profile,meeting,null,false,now,'NDA required'],['suspended',{status:'suspended'},meeting,{},false,now,'Account is not active'],['cancelled',profile,{...meeting,status:'cancelled'},{},false,now,'Meeting cancelled'],['revoked',profile,meeting,{},true,now,'Access revoked'],['early',profile,meeting,{},false,now-7200000,'Access window has not opened'],['expired',profile,meeting,{},false,now+7200000,'Access window expired']])test(`denies ${name}`,()=>assert.equal(accessReason(p,m,s,r,n),expected));
test('meeting serialization cannot expose URL',()=>{assert.equal(Object.hasOwn(safeMeeting(meeting),'meet_url'),false)});
test('agreement fills all supported values',()=>assert.equal(renderAgreement('{{full_name}} - {{reference}}',{full_name:'Ada',reference:'123'}),'Ada - 123'));
test('generates a valid multipage signed PDF',async()=>{const image=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64');const pdf=await makePDF({agreement:{body:('Confidential information remains protected.\n').repeat(150),version:1},profile:{classence_id:'CCA-0001',email:'ada@example.com'},details:{full_name:'Ada'},image,id:'reference',signedAt:'2026-10-10T12:00:00Z'});assert.equal(pdf.subarray(0,4).toString(),'%PDF')});
import {ndaInput} from './nda-input.js';
const ndaBase={agreement_id:'00000000-0000-4000-8000-000000000001',full_name:'Ada',phone:'08012345678',signature_method:'drawn',signature:'data:image/png;base64,example',accepted:true};
test('NDA accepts omitted, blank and short optional role/address fields',()=>{
 for(const fields of [{},{position:'',address:''},{position:'QA',address:'A'}]){
  const result=ndaInput.parse({...ndaBase,...fields});assert.equal(result.position,fields.position||'');assert.equal(result.address,fields.address||'');
 }
});
test('optional NDA fields retain limits and acceptance remains required',()=>{
 assert.equal(ndaInput.safeParse({...ndaBase,address:'a'.repeat(2001)}).success,false);
 assert.equal(ndaInput.safeParse({...ndaBase,position:'a'.repeat(501)}).success,false);
 assert.equal(ndaInput.safeParse({...ndaBase,accepted:false}).success,false);
});
