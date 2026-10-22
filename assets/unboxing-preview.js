/* VINILAZO - preview: scroll-driven unboxing using the currently selected real SVG records. */
(()=>{"use strict";
const box=document.getElementById("cosa"),discs=document.getElementById("discs"),data=document.getElementById("data");
if(!box||!discs||!data)return;
const lang=JSON.parse(data.textContent).lang||"it";
const copy={it:["La confezione prende vita","Nove dischi. Nove emozioni.","Scorri e scopri il contenuto"],es:["La caja cobra vida","Nueve discos. Nueve emociones.","Deslizá para descubrirlo"],fr:["Le coffret prend vie","Neuf disques. Neuf émotions.","Faites défiler pour découvrir"],en:["Watch it unfold","Nine records. Nine emotions.","Scroll to discover what's inside"],de:["Die Box erwacht","Neun Platten. Neun Emotionen.","Scrollen und entdecken"]}[lang];
const section=document.createElement("section");section.id="vz-unboxing-demo";section.className="vz-unboxing-demo";section.innerHTML='<div class="vz-ub-sticky"><div class="vz-ub-heading"><p></p><h2></h2></div><div class="vz-ub-stage" aria-hidden="true"><div class="vz-ub-base"></div><img class="vz-ub-player" src="../assets/img/quadro.webp" alt="" width="576" height="658" loading="lazy"><div class="vz-ub-vinyls"></div><div class="vz-ub-lid">VINILAZO</div></div><div class="vz-ub-prompt"></div></div>';
section.querySelector(".vz-ub-heading p").textContent=copy[0];section.querySelector(".vz-ub-heading h2").textContent=copy[1];section.querySelector(".vz-ub-prompt").textContent=copy[2];box.before(section);
const stage=section.querySelector(".vz-ub-vinyls"),lid=section.querySelector(".vz-ub-lid"),base=section.querySelector(".vz-ub-base"),player=section.querySelector(".vz-ub-player");
const spots=[[-2.2,-.88,-18],[-1.1,-1.55,12],[0,-1.75,-16],[1.13,-1.55,18],[2.2,-.88,-10],[-2.2,.78,14],[-1.05,1.55,-14],[1.12,1.55,18],[2.2,.78,-15]];
let nodes=[],last="",frame=0;
function draw(){
 const originals=[...discs.querySelectorAll(".d svg")].slice(0,9);if(originals.length!==9)return;
 const sig=originals.map(x=>x.innerHTML).join("");if(sig===last)return;last=sig;
 stage.replaceChildren();nodes=originals.map((el,i)=>{
  const item=document.createElement("div");item.className="vz-ub-vinyl";
  const svg=el.cloneNode(true);svg.removeAttribute("class");
  const ids=new Map();svg.querySelectorAll("[id]").forEach(n=>{const old=n.id,nw="vz-ub-"+i+"-"+old;n.id=nw;ids.set(old,nw)});
  svg.querySelectorAll("*").forEach(n=>{for(const attr of ["fill","clip-path","filter","mask","stroke"]){let v=n.getAttribute(attr);if(v)for(const [old,nw] of ids)v=v.replaceAll("url(#"+old+")","url(#"+nw+")");if(v)n.setAttribute(attr,v)}});
  item.append(svg);stage.append(item);return item;
 });update();
}
const clamp=v=>Math.max(0,Math.min(1,v)),ease=v=>1-Math.pow(1-clamp(v),3);
function update(){
 frame=0;const r=section.getBoundingClientRect(),span=Math.max(1,r.height-innerHeight),p=matchMedia("(prefers-reduced-motion: reduce)").matches?1:clamp(-r.top/span);
 const opening=ease((p-.05)/.56),scatter=ease((p-.25)/.7),mobile=innerWidth<650;
 lid.style.transform="translate(-50%,-50%) translateY("+(-opening*(mobile?115:175))+"px) rotateX("+(-opening*35)+"deg) rotateZ("+(opening*7)+"deg)";
 lid.style.opacity=clamp(1-opening*1.4);base.style.opacity=clamp(1-opening*1.3);
 player.style.opacity=clamp((p-.13)*4);player.style.transform="translate(-50%,-50%) scale("+(0.8+opening*.2)+")";
 nodes.forEach((n,i)=>{const [x,y,rot]=spots[i],v=ease((scatter-i*.025)/(1-i*.025));n.style.opacity=clamp(v*2);n.style.transform="translate(-50%,-50%) translate("+(v*x*(mobile?34:53))+"px,"+(v*y*(mobile?34:49))+"px) rotate("+(v*rot)+"deg) scale("+(.5+.5*v)+")"});
 section.style.setProperty("--progress",p.toFixed(3));
}
const schedule=()=>{if(!frame)frame=requestAnimationFrame(update)};
window.addEventListener("scroll",schedule,{passive:true});window.addEventListener("resize",schedule,{passive:true});
new MutationObserver(draw).observe(discs,{childList:true,subtree:true});
draw();schedule();
})();