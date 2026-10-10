import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import React,{act,useState} from 'react';
import {transformWithOxc} from 'vite';

test('modal keeps input focus through form changes and preserves keyboard close rules',async()=>{
 const dom=new JSDOM('<!doctype html><html><body><button id="opener">Open</button><div id="root"></div></body></html>',{url:'http://localhost'});
 const saved=new Map();
 for(const [key,value] of Object.entries({window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,Node:dom.window.Node,IS_REACT_ACT_ENVIRONMENT:true})){
  saved.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});
 }
 const source=await readFile(new URL('../src/components/ui/index.jsx',import.meta.url),'utf8');
 const compiled=await transformWithOxc(source,'ui.jsx',{jsx:{runtime:'automatic'}});
 const moduleCode=compiled.code.replaceAll('from "react"',`from ${JSON.stringify(import.meta.resolve('react'))}`).replaceAll('from "react/jsx-runtime"',`from ${JSON.stringify(import.meta.resolve('react/jsx-runtime'))}`);
 let root;
 try{
  const {Modal,Input,Textarea}=await import('data:text/javascript;base64,'+Buffer.from(moduleCode).toString('base64'));
  const {createRoot}=await import('react-dom/client');
  let update,closed=0;
  function Form(){
   const [form,setForm]=useState({name:'',notes:'',dirty:false});update=setForm;
   return React.createElement(Modal,{title:'Edit agreement',dirty:form.dirty,onClose:()=>{closed++}},
    React.createElement(Input,{label:'Name',value:form.name,onChange:e=>setForm({...form,name:e.target.value,dirty:true})}),
    React.createElement(Textarea,{label:'Notes',value:form.notes,onChange:e=>setForm({...form,notes:e.target.value,dirty:true})}));
  }
  const opener=document.getElementById('opener');opener.focus();root=createRoot(document.getElementById('root'));
  await act(async()=>root.render(React.createElement(Form)));
  const input=document.querySelector('input'),textarea=document.querySelector('textarea');
  assert.equal(document.activeElement,input,'initial focus should go to a field');
  textarea.focus();
  for(const notes of ['A','Ag','Agreement']){
   await act(async()=>update({name:'Ada',notes,dirty:true}));
   assert.equal(document.activeElement,textarea,'typing must not move focus to Close');
  }
  textarea.setSelectionRange(2,2);
  await act(async()=>update({name:'Ada Lovelace',notes:'Agreement',dirty:true}));
  assert.equal(document.activeElement,textarea);assert.equal(textarea.selectionStart,2,'unrelated field changes must preserve the caret');
  await act(async()=>document.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true})));
  assert.equal(closed,0,'Escape must respect current unsaved state');
  const close=document.querySelector('button');close.focus();
  await act(async()=>document.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Tab',shiftKey:true,bubbles:true,cancelable:true})));
  assert.equal(document.activeElement,textarea,'Shift+Tab must wrap to the last field');
  await act(async()=>update({name:'Ada Lovelace',notes:'Agreement',dirty:false}));
  await act(async()=>document.dispatchEvent(new window.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true})));
  assert.equal(closed,1,'Escape must use the latest callback and dirty state');
  await act(async()=>root.unmount());root=null;
  assert.equal(document.activeElement,opener,'closing restores focus to the opener');
 }finally{
  if(root)await act(async()=>root.unmount());dom.window.close();
  for(const [key,descriptor] of saved){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key]}
 }
});
