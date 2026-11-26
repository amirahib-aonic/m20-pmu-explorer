const $=id=>document.getElementById(id),fx=4.118,base=[20.8,30],money=v=>'RM '+v.toFixed(2),price=p=>p.quote*(p.currency==='USD'?fx:1);
const modules=window.modules,compute=modules.filter(p=>p.rail===1),payload=modules.filter(p=>p.rail===2);
let selected=[compute[0],payload[0]];
function size(p){return p.alt&&$('housing').value==='small'?p.alt:p.mm}
function area(p){const [l,w]=size(p);return l*w/100}
const total=(a,b)=>area(a)+area(b),delta=(x,b)=>((x/b-1)*100).toFixed(1)+'%', img=p=>'<img src="'+p.img+'" alt="'+p.model+'">';
function savings(used, original) { return ((original - used) / original * 100).toFixed(1) + '%'; }
function render(){
 $('slots').innerHTML=selected.map((p,i)=>'<div class="slot"><label class="tag" for="s'+i+'">RAIL '+(i+1)+' / '+(i?'PAYLOAD · 84 V':'COMPUTE · 24 V')+'</label><img class="photo" src="'+p.img+'" alt="'+p.model+'"><select id="s'+i+'">'+(i?payload:compute).map(m=>'<option '+(m===p?'selected':'')+'>'+m.model+'</option>').join('')+'</select><div class="facts">'+money(price(p))+' · '+p.amp+' A · '+area(p).toFixed(2)+' cm²<br>'+delta(area(p),base[i])+' vs existing rail</div></div>').join('');
 selected.forEach((_,i)=>$('s'+i).onchange=e=>{selected[i]=modules.find(m=>m.model===e.target.value);render();$('s'+i).focus()});
 const [a,b]=selected,ar=total(a,b);$('result').innerHTML='<small>SELECTED PAIR</small><h3>'+money(price(a)+price(b))+'</h3><div class="metrics">'+[['Total footprint',ar.toFixed(2)+' cm²'],['Vs existing 50.8 cm²',delta(ar,50.8)],['Rated output · R1 / R2',a.amp+' / '+b.amp+' A'],['Tallest module',(Math.max(size(a)[2],size(b)[2])/10).toFixed(2)+' cm']].map(([k,v])=>'<div><small>'+k+'</small><strong>'+v+'</strong></div>').join('')+'</div>'+[a,b].filter(p=>p.flag).map(p=>'<p class="warn">'+p.flag+'</p>').join('');
 const metrics = {
  area: (a,b) => total(a,b),
  price: (a,b) => price(a)+price(b),
  both: (a,b) => 1-total(a,b)/(base[0]+base[1]),
  r1: a => 1-area(a)/base[0],
  r2: (a,b) => 1-area(b)/base[1]
 };
 const metric = metrics[$('metric').value];
 const direction = $('order').value === 'desc' ? -1 : 1;
 const pairs = compute.flatMap(a => payload.map(b => [a,b])).sort((left,right) =>
  direction*(metric(...left)-metric(...right)) ||
  metrics.price(...left)-metrics.price(...right) || total(...left)-total(...right)
 );
 $('rows').innerHTML=pairs.map(([x,y],i)=>'<tr class="'+(x===a&&y===b?'active':'')+'"><td>'+String(i+1).padStart(2,'0')+'</td><td><button class="pair">'+img(x)+img(y)+'<span><b>'+x.model+'</b>'+y.model+'</span></button></td><td><span class="track"><i style="width:'+area(x)*2+'%"></i><em style="width:'+area(y)*2+'%"></em></span>'+total(x,y).toFixed(2)+'</td><td>'+savings(area(x),base[0])+'</td><td>'+savings(area(y),base[1])+'</td><td><b>'+savings(total(x,y),base[0]+base[1])+'</b></td><td>'+money(price(x)+price(y))+'</td><td>'+x.amp+' / '+y.amp+' A</td></tr>').join('');
 [...$('rows').rows].forEach((r,i)=>r.onclick=()=>{selected=pairs[i];render();document.querySelector('#builder').scrollIntoView();$('s0').focus({preventScroll:true})});
 $('cards').innerHTML=modules.map(p=>'<article class="card"><small class="tag">'+(p.rail===1?'COMPUTE':'PAYLOAD')+'</small><img class="photo" src="'+p.img+'" alt="'+p.model+'"><p>'+p.maker+'</p><h3>'+p.model+'</h3><strong>'+money(price(p))+'</strong><div class="facts">'+p.vin+' input · 12 V / '+p.amp+' A output<br>'+size(p).join(' × ')+' mm · '+area(p).toFixed(2)+' cm²<br>'+(p.amp/area(p)).toFixed(3)+' A/cm²'+(p.flag?'<br>'+p.flag:'')+'</div></article>').join('');
}
for (const id of ['housing','metric','order']) $(id).onchange=render;
render();
