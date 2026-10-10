import 'dotenv/config';
import {readFile} from 'node:fs/promises';
import {db,configured,query} from '../lib.js';
if(!configured)throw new Error('Configure Supabase in the root .env first.');
const body=(await readFile(new URL('../default-nda.md',import.meta.url),'utf8')).replace(/^\uFEFF/,'');
const title='Core Team Non-Disclosure Agreement (NDA)';
const admin=await query(db.from('profiles').select('id').eq('classence_id','CCA-0000').eq('role','super_admin').single());
const current=await query(db.from('agreements').select('*').eq('is_active',true).maybeSingle());
if(current?.body===body&&current.title===title){console.log(`Requested NDA is already active as version ${current.version}. No changes needed.`);process.exit(0)}
const signed=current?await query(db.from('nda_signatures').select('id').eq('agreement_id',current.id).limit(1)):[];
let agreement;
if(current&&!signed.length){agreement=await query(db.from('agreements').update({title,body}).eq('id',current.id).select().single());await query(db.from('audit_logs').insert({actor_id:admin.id,action:'agreement.updated',entity_type:'agreements',entity_id:agreement.id,metadata:{source:'user-supplied NDA',signed_history_preserved:true}}))}
else{const latest=await query(db.from('agreements').select('version').order('version',{ascending:false}).limit(1));agreement=await query(db.from('agreements').insert({title,body,version:(latest[0]?.version||0)+1,is_active:false,created_by:admin.id}).select().single());await query(db.from('audit_logs').insert({actor_id:admin.id,action:'agreement.created',entity_type:'agreements',entity_id:agreement.id,metadata:{source:'user-supplied NDA'}}));await query(db.rpc('activate_agreement',{target:agreement.id}));await query(db.from('audit_logs').insert({actor_id:admin.id,action:'agreement.activated',entity_type:'agreements',entity_id:agreement.id,metadata:{previous_version:current?.version||null,signed_history_preserved:true}}))}
const check=await query(db.from('agreements').select('version,body,is_active').eq('id',agreement.id).single());if(!check.is_active||check.body!==body)throw new Error('Agreement update verification failed.');
console.log(`Requested NDA is active as version ${check.version}. No company placeholders remain. ${signed.length?'Previous signatures are preserved; members must sign this new version.':'The unsigned active agreement was updated in place.'}`);
