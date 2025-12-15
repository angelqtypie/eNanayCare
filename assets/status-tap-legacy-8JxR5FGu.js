System.register(["./index-legacy-CSIClVcW.js","jspdf","jspdf-autotable"],function(e,t){"use strict";var n,r,s,o,i;return{setters:[e=>{n=e.r,r=e.f,s=e.b,o=e.w,i=e.s},null,null],execute:function(){
/*!
             * (C) Ionic http://ionicframework.com - MIT License
             */
e("startStatusTap",()=>{const e=window;e.addEventListener("statusTap",()=>{n(()=>{const t=e.innerWidth,n=e.innerHeight,a=document.elementFromPoint(t/2,n/2);if(!a)return;const u=r(a);u&&new Promise(e=>s(u,e)).then(()=>{o(async()=>{u.style.setProperty("--overflow","hidden"),await i(u,300),u.style.removeProperty("--overflow")})})})})})}}});
