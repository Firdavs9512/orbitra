export const trackingScript = `(function(){
'use strict';
var s=document.currentScript;
var id=s&&s.getAttribute('data-site');
var api=s&&(s.getAttribute('data-api')||s.src.replace(/\\/track\\.js.*/,'').replace(/\\/t\\.js.*/,''));
if(!id||!api)return;

if(navigator.doNotTrack==='1'||window.doNotTrack==='1')return;
if(/bot|crawl|spider|slurp|lighthouse|pagespeed|headless|phantom|puppeteer|prerender/i.test(navigator.userAgent))return;
if(navigator.webdriver)return;

function r(){return Math.random().toString(36).substring(2,10)}
function gs(s,k){try{return s.getItem(k)}catch(e){return null}}
function ss(s,k,v){try{s.setItem(k,v)}catch(e){}}

var vid=gs(localStorage,'_orb_vid');
if(!vid){vid=r()+r();ss(localStorage,'_orb_vid',vid)}
var sid=gs(sessionStorage,'_orb_sid');
if(!sid){sid=r()+r();ss(sessionStorage,'_orb_sid',sid)}

var q=[];
var ft=null;
var MAX=10;
var INTERVAL=3000;

function enqueue(type,detail){
q.push({
visitorId:vid,sessionId:sid,
type:type,path:location.pathname+location.hash,
title:document.title,referrer:document.referrer,
detail:typeof detail==='string'?detail:(detail?JSON.stringify(detail):''),
timestamp:new Date().toISOString(),screenWidth:screen.width
});
if(q.length>=MAX)flush();
else if(!ft)ft=setTimeout(flush,INTERVAL);
}

function flush(){
clearTimeout(ft);ft=null;
if(!q.length)return;
var events=q.splice(0);
var payload=JSON.stringify({trackingId:id,events:events});
if(navigator.sendBeacon){
var ok=navigator.sendBeacon(api+'/api/events',new Blob([payload],{type:'application/json'}));
if(ok)return;
}
_send(payload,0);
}

function _send(payload,attempt){
fetch(api+'/api/events',{method:'POST',body:payload,headers:{'Content-Type':'application/json'},keepalive:true})
.then(function(r){if(!r.ok&&attempt<2)setTimeout(function(){_send(payload,attempt+1)},1000*(attempt+1))})
.catch(function(){if(attempt<2)setTimeout(function(){_send(payload,attempt+1)},1000*(attempt+1))});
}

var lastPath=location.pathname+location.hash;
var scrollState={};

function trackPageview(){
var cur=location.pathname+location.hash;
if(cur===lastPath)return;
lastPath=cur;
scrollState={};
enqueue('pageview');
}

enqueue('pageview');

var _push=history.pushState;
history.pushState=function(){_push.apply(this,arguments);trackPageview()};
var _replace=history.replaceState;
history.replaceState=function(){_replace.apply(this,arguments);trackPageview()};
window.addEventListener('popstate',trackPageview);
window.addEventListener('hashchange',trackPageview);

document.addEventListener('click',function(e){
var t=e.target;
if(t&&t.closest){
t=t.closest('a,button,[data-orb-track]');
if(t){
var label=t.getAttribute('data-orb-track')||t.getAttribute('aria-label')||(t.textContent||'').trim().substring(0,100);
enqueue('click',label);
}
}
},true);

var ticking=false;
window.addEventListener('scroll',function(){
if(!ticking){
ticking=true;
(window.requestAnimationFrame||setTimeout)(function(){
var h=document.documentElement.scrollHeight-window.innerHeight;
if(h>0){
var p=Math.round(window.scrollY/h*100);
[25,50,75,100].forEach(function(t){if(p>=t&&!scrollState[t]){scrollState[t]=1;enqueue('scroll',t+'%')}});
}
ticking=false;
});
}
},{passive:true});

document.addEventListener('submit',function(e){
var f=e.target;
enqueue('form_submit',f.getAttribute('data-orb-track')||f.id||f.action||'form');
},true);

window.addEventListener('error',function(e){
enqueue('error',(e.message||'Error')+' at '+(e.filename||'')+':'+(e.lineno||0));
});

setInterval(function(){
if(document.visibilityState!=='hidden')enqueue('heartbeat');
},30000);

document.addEventListener('visibilitychange',function(){
if(document.visibilityState==='hidden')flush();
});
window.addEventListener('pagehide',flush);

window.orbitra={
track:function(type,detail){
if(typeof type==='string'&&type.length>0){
var d=typeof detail==='string'?detail.substring(0,500):JSON.stringify(detail||'').substring(0,500);
enqueue(type,d);
}
}
};
})()`

export function getTrackingScriptResponse(): Response {
  return new Response(trackingScript, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
