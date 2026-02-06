let progreso=0;
function ir(id){document.querySelectorAll('.pantalla').forEach(p=>p.classList.remove('activa'));document.getElementById(id).classList.add('activa')}
function completar(){progreso+=20;document.getElementById('progreso').textContent='Progreso: '+progreso+'%';}