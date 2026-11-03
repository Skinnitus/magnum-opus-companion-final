'use strict';
(function(root){
function parse(raw){
 if(typeof raw!=='string'||raw.length>8_000_000)throw Error('CSV absent ou trop volumineux');
 raw=raw.replace(/^\uFEFF/,'');if(!raw.trim())throw Error('CSV vide');
 const first=raw.split(/\r?\n/,1)[0];const sep=(first.match(/;/g)||[]).length>=(first.match(/,/g)||[]).length?';':',';
 const rows=[];let row=[],cell='',quoted=false;
 for(let i=0;i<raw.length;i++){
  const c=raw[i];if(c==='"'){if(quoted&&raw[i+1]==='"'){cell+='"';i++}else quoted=!quoted;}
  else if(c===sep&&!quoted){row.push(cell);cell='';}
  else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&raw[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';}
  else cell+=c;
 }
 if(quoted)throw Error('CSV invalide : guillemet non fermé');row.push(cell);if(row.some(x=>x.trim()))rows.push(row);
 if(!rows.length)throw Error('CSV vide');const width=rows[0].length;
 if(rows.some((r,i)=>i>0&&r.length!==width))throw Error('CSV incohérent : nombre de colonnes variable');
 if(rows.length>20001)throw Error('CSV trop volumineux : plus de 20 000 activités');
 return {headers:rows[0].map(x=>x.trim()),rows:rows.slice(1),separator:sep};
}
const api={parse};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.MagnumActivityCsv=api;
})(typeof globalThis!=='undefined'?globalThis:this);
