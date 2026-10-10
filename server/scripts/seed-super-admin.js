import 'dotenv/config';import {readFile} from 'node:fs/promises';import {db,configured,query} from '../lib.js';
if(!configured)throw new Error('Paste your Supabase credentials into .env first.');
const {SUPER_ADMIN_EMAIL:email,SUPER_ADMIN_NAME:full_name,SUPER_ADMIN_PASSWORD:password}=process.env;
if(!email||!full_name||!password||password.length<8||!/[0-9]/.test(password))throw new Error('Set SUPER_ADMIN_EMAIL, SUPER_ADMIN_NAME and a password of 8+ characters with a number in .env.');
let profile=await query(db.from('profiles').select('*').eq('classence_id','CCA-0000').maybeSingle());
if(!profile){const {data,error}=await db.auth.admin.createUser({email,password,email_confirm:true});if(error)throw error;profile=await query(db.from('profiles').insert({id:data.user.id,classence_id:'CCA-0000',full_name,email,role:'super_admin',status:'active',activated_at:new Date().toISOString()}).select().single())}
const agreement=await query(db.from('agreements').select('id').eq('version',1).maybeSingle());if(!agreement){const body=await readFile(new URL('../default-nda.md',import.meta.url),'utf8');await query(db.from('agreements').insert({version:1,title:'Core Team Confidentiality and Non-Disclosure Agreement',body,is_active:true,created_by:profile.id}))}
console.log('Ready: log in with CCA-0000 and your SUPER_ADMIN_PASSWORD. Complete organisation details in Admin > Agreements before inviting members.');
