let puntos=0;
document.querySelectorAll('.hotspot').forEach(h=>{
 h.addEventListener('click',()=>{
   const zona=h.dataset.zona;
   puntos+=50;
   document.getElementById('score').textContent='⭐ '+puntos+' pts';
   const p=document.getElementById('panel');
   p.innerHTML='<h3>'+zona+'</h3><p>Mini misión en '+zona+'</p><button onclick="cerrar()">Cerrar</button>';
   p.classList.remove('oculto');
 });
});
function cerrar(){document.getElementById('panel').classList.add('oculto')}