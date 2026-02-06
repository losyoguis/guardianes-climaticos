let guardian=JSON.parse(localStorage.getItem('guardian'))||{zonas:[],logros:[],nivel:1};
function elegirAvatar(a){guardian.avatar=a;guardar();location.href='mapa.html'}
function guardar(){localStorage.setItem('guardian',JSON.stringify(guardian))}
function completarZona(z){if(!guardian.zonas.includes(z)){guardian.zonas.push(z);guardian.logros.push(z);guardian.nivel++}guardar();location.href=z==='energia'?'final.html':'mapa.html'}
function mostrarLogros(){const p=document.getElementById('panelLogros');p.innerHTML='<h2>🏅 Logros</h2>'+guardian.logros.join('<br>');p.classList.remove('oculto')}
function mostrarRanking(){const p=document.getElementById('panelRanking');p.innerHTML='<h2>📊 Progreso</h2><p>Nivel '+guardian.nivel+'</p>';p.classList.remove('oculto')}
document.querySelectorAll('.zona').forEach(z=>z.onclick=()=>{if(z.classList.contains('bloqueada'))return;location.href='zona-'+z.dataset.zona+'.html'});