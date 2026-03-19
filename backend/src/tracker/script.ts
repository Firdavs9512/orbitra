export const trackingScript = `(function(){
'use strict';
var s=document.currentScript;
var id=s&&s.getAttribute('data-site');
var api=s&&(s.getAttribute('data-api')||s.src.replace(/\\/track\\.js.*/,''));
if(!id||!api)return;

var vid=localStorage.getItem('_orb_vid');
if(!vid){vid=r()+r();localStorage.setItem('_orb_vid',vid)}
var sid=sessionStorage.getItem('_orb_sid');
if(!sid){sid=r()+r();sessionStorage.setItem('_orb_sid',sid)}

function r(){return Math.random().toString(36).substring(2,10)}

function send(type,detail){
var d=JSON.stringify({
trackingId:id,visitorId:vid,sessionId:sid,
type:type,path:location.pathname,title:document.title,
referrer:document.referrer,detail:detail||'',
timestamp:new Date().toISOString(),screenWidth:screen.width
});
if(navigator.sendBeacon){navigator.sendBeacon(api+'/api/event',d)}
else{fetch(api+'/api/event',{method:'POST',body:d,headers:{'Content-Type':'application/json'},keepalive:true}).catch(function(){})}
}

send('pageview');

var op=history.pushState;
history.pushState=function(){op.apply(this,arguments);send('pageview')};
window.addEventListener('popstate',function(){send('pageview')});

document.addEventListener('click',function(e){
var t=e.target.closest('a,button,[data-orb-track]');
if(t){send('click',t.textContent.trim().substring(0,100))}
},true);

var ss={};
window.addEventListener('scroll',deb(function(){
var p=Math.round(window.scrollY/(document.documentElement.scrollHeight-window.innerHeight)*100);
[25,50,75,100].forEach(function(t){if(p>=t&&!ss[t]){ss[t]=1;send('scroll',t+'%')}});
},500));

document.addEventListener('submit',function(e){
send('form_submit',e.target.id||e.target.action||'form');
},true);

window.addEventListener('error',function(e){
send('error',e.message+' at '+e.filename+':'+e.lineno);
});

setInterval(function(){send('heartbeat')},30000);

function deb(fn,w){var t;return function(){clearTimeout(t);t=setTimeout(fn,w)}}
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
