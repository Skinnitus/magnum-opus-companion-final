'use strict';
const AlbaStore=(()=>{
 const KEY='magnum-opus-alba-v2',PRE='magnum-opus-alba-before-restore-v2',HISTORY='magnum-opus-alba-previous-v2';
 const legacy={core:'magnum-opus-companion-data-v1',trail:'magnum-opus-trail-v1',pack:'magnum-opus-pack-log-v1',extras:'magnum-opus-extra-v1',ultimate:'magnum-opus-ultimate-v1'};
 const fresh=()=>({schemaVersion:2,core:{sessions:[],health:[],importedAt:null},trail:{},pack:[],extras:{notes:''},ultimate:{strength:[],equipment:{},decisions:[],preferences:{}},settings:{theme:'auto',order:['next','week','goals','recovery','alerts'],event:'none'},adaptations:{},template:null});
 const obj=x=>x&&typeof x==='object'&&!Array.isArray(x);
 function validate(d){
 if(!obj(d)||!obj(d.core))throw Error('Sauvegarde : structure absente');
 const errors=MagnumValidation.validateImport(d.core);if(errors.length)throw Error(errors.slice(0,5).join(' ; '));
 if(d.core.sessions.length>12000||d.core.health.length>12000)throw Error('Trop de lignes');
 const check=(x,k,max)=>{let v=x[k];if(v===null||v===undefined||v==='')return;if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>max)throw Error(k+' : nombre hors limites')};
 for(const s of d.core.sessions){if(typeof s.title!=='string'||typeof s.rest!=='boolean')throw Error('Séance incomplète');for(const k of ['plannedKm','plannedMinutes','plannedRpe','plannedPackKg','packKg','avgHr','sleep','fatigue'])check(s,k,({sleep:24,fatigue:10,plannedRpe:10,avgHr:250,packKg:60,plannedPackKg:60})[k]||10000);for(const k of ['title','category','notes','shoe','weather'])if(s[k]!=null&&typeof s[k]!=='string')throw Error('Champ séance invalide : '+k)}
 for(const h of d.core.health){check(h,'hrv',1000);check(h,'restHr',250);check(h,'weight',500);if(h.notes!=null&&typeof h.notes!=='string')throw Error('Notes santé invalides')}
 if(!obj(d.trail)||Object.values(d.trail).some(v=>typeof v!=='boolean'))throw Error('Checklist invalide');
 if(!Array.isArray(d.pack)||d.pack.length>10000)throw Error('Portage invalide');for(const p of d.pack){if(!obj(p)||!MagnumValidation.validISODate(p.date))throw Error('Date portage invalide');for(const k of ['km','weight'])if(typeof p[k]!=='number')throw Error('Portage incomplet');for(const k of ['km','weight','ascent','rpe'])check(p,k,({km:100,weight:60,ascent:10000,rpe:10})[k]);}
 if(!obj(d.extras)||typeof(d.extras.notes??'')!=='string'||(d.extras.notes||'').length>200000)throw Error('Notes invalides');
 if(!obj(d.ultimate)||!Array.isArray(d.ultimate.strength)||!Array.isArray(d.ultimate.decisions)||!obj(d.ultimate.equipment))throw Error('Module complémentaire invalide');
 for(const s of d.ultimate.strength){if(!MagnumValidation.validISODate(s.date)||typeof s.minutes!=='number'||typeof s.rpe!=='number')throw Error('Renforcement invalide');check(s,'minutes',240);check(s,'rpe',10)}
 if(!obj(d.settings)||!['light','dark','auto'].includes(d.settings.theme)||!Array.isArray(d.settings.order))throw Error('Préférences invalides');
 const modules=['next','week','goals','recovery','alerts'];if(d.settings.order.length!==5||new Set(d.settings.order).size!==5||d.settings.order.some(k=>!modules.includes(k)))throw Error('Ordre des modules invalide');
 if(!obj(d.adaptations))throw Error('Adaptations invalides');for(const [id,a] of Object.entries(d.adaptations)){if(!d.core.sessions.some(s=>s.id===id)||!obj(a)||typeof a.factor!=='number'||![0,.75].includes(a.factor))throw Error('Adaptation incohérente')}
 if(d.template!==null&&(typeof d.template!=='string'||d.template.length>3000000||!/^[A-Za-z0-9+/=]+$/.test(d.template)))throw Error('Classeur de référence invalide');
 return d;
 }
 function normalize(payload){let d;if(payload.format==='magnum-opus-full-backup'&&[1,2].includes(payload.version)){d=structuredClone(payload.data);}
 else if(Array.isArray(payload.sessions)&&Array.isArray(payload.health)){d={...fresh(),core:structuredClone(payload)}}
 else if(payload.schemaVersion===2&&payload.core)d=structuredClone(payload);else throw Error('Format JSON non reconnu');
 const base=fresh();d={...base,...d,settings:{...base.settings,...d.settings},ultimate:{...base.ultimate,...d.ultimate}};d.schemaVersion=2;
 for(const s of d.core.sessions)if(!('rest'in s))s.rest=/repos/i.test(s.title+' '+s.category);
 return validate(d);
 }
 function load(){const raw=localStorage.getItem(KEY);if(raw!==null)return {data:normalize(JSON.parse(raw)),migrated:false};const d=fresh();let migrated=false;for(const [field,key]of Object.entries(legacy)){const raw=localStorage.getItem(key);if(raw!==null){d[field]=JSON.parse(raw);migrated=true}}d.settings.theme=['light','dark'].includes(localStorage.getItem('magnum-theme'))?localStorage.getItem('magnum-theme'):'auto';return {data:validate(d),migrated};}
 function write(d,{restore=false}={}){validate(d);const raw=JSON.stringify(d);if(raw.length>4000000)throw Error('Sauvegarde trop volumineuse pour le stockage local : exporte les données');const old=localStorage.getItem(KEY);if(old!==null)localStorage.setItem(restore?PRE:HISTORY,old);localStorage.setItem(KEY,raw);if(localStorage.getItem(KEY)!==raw)throw Error('Vérification écriture échouée');return d;}
 const backup=d=>({format:'magnum-opus-full-backup',version:2,createdAt:new Date().toISOString(),data:structuredClone(d)});
 return {KEY,PRE,HISTORY,legacy,fresh,validate,normalize,load,write,backup};
})();
