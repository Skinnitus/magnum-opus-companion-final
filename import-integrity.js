'use strict';
(function(root){
 function preserveUnimportedSessions(localSessions,importedSessions){
  if(!Array.isArray(localSessions)||!Array.isArray(importedSessions))throw Error('Listes de séances invalides');
  for(const [label,rows] of [['locales',localSessions],['importées',importedSessions]]){
   const idsSeen=new Set();
   for(const row of rows){
    if(!row||typeof row.id!=='string'||!row.id.trim())throw Error('Identifiant de séance invalide dans les données '+label);
    if(idsSeen.has(row.id))throw Error('Identifiant de séance dupliqué dans les données '+label+': '+row.id);
    idsSeen.add(row.id);
   }
  }
  const ids=new Set(importedSessions.map(s=>s.id));
  const extras=localSessions.filter(s=>s&&typeof s.id==='string'&&!ids.has(s.id));
  return {sessions:[...importedSessions,...extras].sort((a,b)=>String(a.date).localeCompare(String(b.date))),preserved:extras.length};
 }
 const api={preserveUnimportedSessions};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.MagnumImportIntegrity=api;
})(typeof globalThis!=='undefined'?globalThis:this);
