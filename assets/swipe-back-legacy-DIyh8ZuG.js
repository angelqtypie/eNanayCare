System.register(["./index-legacy-CSIClVcW.js","jspdf","jspdf-autotable"],function(t,e){"use strict";var n,r,s;return{setters:[t=>{n=t.i,r=t.c,s=t.a},null,null],execute:function(){
/*!
             * (C) Ionic http://ionicframework.com - MIT License
             */
t("createSwipeBackGesture",(t,e,i,o,a)=>{const c=t.ownerDocument.defaultView;let l=n(t);const u=t=>l?-t.deltaX:t.deltaX;return r({el:t,gestureName:"goback-swipe",gesturePriority:101,threshold:10,canStart:r=>(l=n(t),(t=>{const{startX:e}=t;return l?e>=c.innerWidth-50:e<=50})(r)&&e()),onStart:i,onMove:t=>{const e=u(t)/c.innerWidth;o(e)},onEnd:t=>{const e=u(t),n=c.innerWidth,r=e/n,i=(t=>l?-t.velocityX:t.velocityX)(t),o=i>=0&&(i>.2||e>n/2),d=(o?1-r:r)*n;let h=0;if(d>5){const t=d/Math.abs(i);h=Math.min(t,540)}a(o,r<=0?.01:s(0,r,.9999),h)}})})}}});
