'use strict';
// Conservative, descriptive forecasts: never extrapolate a marathon finish from sparse data.
(function(root){
 function finite(x){if(x===null||x===undefined||x==='')return null;const n=Number(x);return Number.isFinite(n)?n:null}
 function summarize(sessions,asOf){
  const end=asOf||new Date().toLocaleDateString('sv-SE');const start=new Date(end+'T12:00:00');start.setDate(start.getDate()-27);const from=start.toLocaleDateString('sv-SE');
  const completed=(sessions||[]).filter(s=>s&&s.status==='Réalisé'&&!s.rest&&s.date>=from&&s.date<=end);
  const runs=completed.filter(s=>/course|running|footing|fractionn|endurance|sortie longue|marathon/i.test(String(s.title||'')+' '+String(s.type||'')+' '+String(s.category||'')));
  const known=runs.map(s=>finite(s.km)).filter(x=>x!==null&&x>=0);const unknown=runs.length-known.length;
  const total=known.reduce((a,b)=>a+b,0);const longest=known.length?Math.max(...known):null;
  return {from,to:end,runs:runs.length,known:known.length,unknown,km:unknown===0&&known.length?Math.round(total*10)/10:null,documentedKm:known.length?Math.round(total*10)/10:null,longest,weeklyAverage:known.length&&unknown===0?Math.round(total/4*10)/10:null,confidence:unknown?'incomplète':runs.length>=8?'descriptive':'insuffisante'};
 }
 const api={summarize};if(typeof module!=='undefined'&&module.exports)module.exports=api;root.MagnumForecast=api;
})(typeof globalThis!=='undefined'?globalThis:this);
