import {useEffect,useRef} from 'react';
const variants={primary:'bg-brand-600 text-white hover:bg-brand-700',secondary:'bg-white text-brand-700 border border-brand-200 hover:bg-brand-50',danger:'bg-white text-danger border border-danger hover:bg-red-50',dangerSolid:'bg-danger text-white',link:'text-brand-600 hover:text-brand-700 underline-offset-2 hover:underline'};
export function Button({variant='primary',className='',...props}){return <button className={`${variant==='link'?'':'h-9 px-4 rounded text-sm'} transition-colors duration-100 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`} {...props}/>}
const field='h-9 w-full border border-brand-200 rounded px-3 bg-white text-ink focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-300';
function Field({kind='input',label,error,className='',...props}){const Tag=kind;return <label className="block space-y-1 text-[13px] text-ink">{label&&<span>{label}</span>}<Tag className={`${field} ${kind==='textarea'?'h-24 py-2':''} ${className}`} {...props}/>{error&&<span className="text-xs text-danger">{error}</span>}</label>}
export const Input=p=><Field {...p}/>;export const Textarea=p=><Field kind="textarea" {...p}/>;export const Select=p=><Field kind="select" {...p}/>;
export function Pill({children}){let text=String(children).toLowerCase();return <span className={`inline-block border border-brand-200 bg-brand-50 rounded px-2 py-0.5 text-xs ${/active|signed|sent|delivered|granted|open|valid/.test(text)&&!/inactive|unsigned|not signed|invalid/.test(text)?'text-success':/failed|revoked|suspended|denied|cancelled|invalid/.test(text)?'text-danger':/pending|invited|upcoming|outdated/.test(text)?'text-warning':'text-brand-700'}`}>{children}</span>}
export function Table({headers,rows=[],loading,emptyText='No records yet.'}){return <div className="overflow-x-auto border border-brand-200 rounded"><table className="w-full text-[13px]"><thead className="bg-brand-100 text-brand-800 text-left"><tr>{headers.map(x=><th className="px-4 py-2 font-semibold" key={x}>{x}</th>)}</tr></thead><tbody>{loading||!rows.length?<tr><td className="p-6 text-muted" colSpan={headers.length}>{loading?'Loading...':emptyText}</td></tr>:rows.map((row,i)=><tr key={i} className="h-10 border-b border-brand-200 hover:bg-brand-50">{row.map((x,j)=><td key={j} className="px-4 py-2">{x}</td>)}</tr>)}</tbody></table></div>}
export function Notice({children}){return <div className="border border-brand-200 bg-brand-50 rounded p-4 space-y-2">{children}</div>}
export function Tabs({tabs,value,onChange}){return <div className="flex gap-6 border-b border-brand-200">{tabs.map(t=><button key={t} onClick={()=>onChange(t)} className={`pb-2 ${t===value?'font-semibold text-brand-700 border-b-2 border-brand-600':'text-muted'}`}>{t}</button>)}</div>}
export function StatBox({number,label}){return <div className="border border-brand-200 rounded p-4"><div className="text-2xl font-semibold text-brand-800">{number}</div><div className="text-xs text-muted">{label}</div></div>}
const modalStack=[];
export function Modal({title,children,onClose,footer,large,dirty=false}){
 const ref=useRef();
 const latest=useRef({onClose,dirty});
 // Keep current close rules without repeating mount-time focus setup.
 useEffect(()=>{latest.current={onClose,dirty}},[onClose,dirty]);
 useEffect(()=>{
  const panel=ref.current;
  const previous=document.activeElement;
  modalStack.push(panel);
  const selector='button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]';
  (panel.querySelector('input:not(:disabled),textarea:not(:disabled),select:not(:disabled)')||panel.querySelector(selector)||panel).focus();
  function key(event){
   if(modalStack.at(-1)!==panel||event.defaultPrevented)return;
   if(event.key==='Escape'&&!latest.current.dirty){event.preventDefault();latest.current.onClose();return}
   if(event.key==='Tab'){
    const elements=[...panel.querySelectorAll(selector)].filter(el=>!el.closest('[hidden]'));
    const first=elements[0],last=elements.at(-1);
    if(!first){event.preventDefault();panel.focus();return}
    if(event.shiftKey&&(document.activeElement===first||!panel.contains(document.activeElement))){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&(document.activeElement===last||!panel.contains(document.activeElement))){event.preventDefault();first.focus()}
   }
  }
  document.addEventListener('keydown',key);
  return()=>{
   document.removeEventListener('keydown',key);
   const wasTop=modalStack.at(-1)===panel;
   const index=modalStack.indexOf(panel);if(index!==-1)modalStack.splice(index,1);
   if(wasTop&&previous?.isConnected)previous.focus();
  };
 },[]);
 return <div className="fixed inset-0 bg-brand-950/60 flex items-center justify-center p-4 z-40" onMouseDown={e=>{if(e.target===e.currentTarget&&!dirty)onClose()}}><div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={`bg-white rounded border border-brand-200 w-full ${large?'max-w-[640px]':'max-w-[480px]'} p-6 max-h-[90vh] overflow-y-auto`}><div className="flex justify-between border-b border-brand-200 pb-4 mb-4"><h2 className="text-base font-semibold text-brand-800">{title}</h2><Button variant="link" onClick={onClose}>Close</Button></div><div className="space-y-4">{children}</div>{footer&&<div className="flex justify-end gap-2 mt-6">{footer}</div>}</div></div>
}
export function Toast({message,onClose}){useEffect(()=>{const t=setTimeout(onClose,4000);return()=>clearTimeout(t)},[message,onClose]);return message&&<div role="status" className="fixed top-4 left-1/2 -translate-x-1/2 bg-white border border-brand-200 rounded px-4 py-2 z-50 text-brand-800">{message}</div>}
export function SidePanel({children,onClose}){return <aside className="w-full md:w-[400px] bg-white border-l border-brand-200 p-6 fixed right-0 inset-y-0 overflow-y-auto z-30"><Button variant="link" onClick={onClose}>Close</Button><div className="space-y-4 mt-4">{children}</div></aside>}
