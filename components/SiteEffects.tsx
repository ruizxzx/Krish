'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function SiteCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const dotEl = dot.current, ringEl = ring.current, labelEl = label.current;
    if (!dotEl || !ringEl || !labelEl) return;

    let x=innerWidth*.5,y=innerHeight*.5,tx=x,ty=y,rx=x,ry=y,vx=0,vy=0,px=x,py=y,frame=0;
    const move=(e:MouseEvent)=>{tx=e.clientX;ty=e.clientY};
    const over=(e:MouseEvent)=>{
      const owner=(e.target as HTMLElement|null)?.closest<HTMLElement>('[data-cursor]');
      const state=owner?.dataset.cursor||'default';
      ringEl.dataset.state=state;
      labelEl.textContent=owner?.dataset.cursorLabel||(state==='project'?'VIEW':state==='drag'?'DRAG':state==='link'?'OPEN':state==='image'?'ZOOM':'');
    };
    const down=()=>{ringEl.dataset.pressed='true';window.setTimeout(()=>{ringEl.dataset.pressed='false'},160)};
    const loop=()=>{
      const dx=tx-px,dy=ty-py;px=tx;py=ty;vx+=(dx-vx)*.2;vy+=(dy-vy)*.2;
      x+=(tx-x)*.22;y+=(ty-y)*.22;rx+=(x-rx)*.1;ry+=(y-ry)*.1;
      const speed=Math.min(Math.hypot(vx,vy),35),angle=Math.atan2(vy,vx)*180/Math.PI,stretch=1+speed*.012;
      dotEl.style.transform=`translate3d(${x}px,${y}px,0) scale(${1+speed*.018})`;
      ringEl.style.transform=`translate3d(${rx}px,${ry}px,0) rotate(${angle}deg) scaleX(${stretch})`;
      frame=requestAnimationFrame(loop);
    };
    addEventListener('mousemove',move,{passive:true});
    addEventListener('mouseover',over,{passive:true});
    addEventListener('mousedown',down,{passive:true});
    frame=requestAnimationFrame(loop);
    return()=>{removeEventListener('mousemove',move);removeEventListener('mouseover',over);removeEventListener('mousedown',down);cancelAnimationFrame(frame)};
  },[]);

  return <><div ref={dot} className="cursor-dot"/><div ref={ring} className="cursor-ring"><span ref={label}>VIEW</span></div></>;
}

export function PageReveal({children}:{children:ReactNode}) {
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const el=root.current;if(!el)return;
    const ctx=gsap.context(()=>{
      if(matchMedia('(prefers-reduced-motion: reduce)').matches){
        gsap.set('[data-reveal],[data-reveal-text],[data-page-intro]',{clearProps:'all'});return;
      }
      gsap.fromTo('[data-page-intro]',{clipPath:'inset(0 0 100% 0)',y:24,opacity:0},{clipPath:'inset(0 0 0% 0)',y:0,opacity:1,duration:1.05,ease:'power4.out',stagger:.07});
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach(item=>gsap.fromTo(item,{y:55,opacity:0},{y:0,opacity:1,duration:.95,ease:'power3.out',scrollTrigger:{trigger:item,start:'top 88%',once:true}}));
      gsap.utils.toArray<HTMLElement>('[data-reveal-text]').forEach(item=>gsap.fromTo(item,{yPercent:105,opacity:0},{yPercent:0,opacity:1,duration:.9,ease:'power4.out',scrollTrigger:{trigger:item,start:'top 90%',once:true}}));
      gsap.utils.toArray<HTMLElement>('[data-line]').forEach(item=>gsap.fromTo(item,{scaleX:0,transformOrigin:'left center'},{scaleX:1,duration:1.1,ease:'power3.inOut',scrollTrigger:{trigger:item,start:'top 92%',once:true}}));
      ScrollTrigger.refresh();
    },el);
    return()=>ctx.revert();
  },[]);
  return <div ref={root} className="page-motion-root">{children}</div>;
}
