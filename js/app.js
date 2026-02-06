let guardian=JSON.parse(localStorage.getItem('guardian'))||{zonas:[],nivel:1};
function elegirAvatar(a){guardian.avatar=a;localStorage.setItem('guardian',JSON.stringify(guardian));location.href='mapa.html';}
function irZona(z){guardian.zonas.push(z);localStorage.setItem('guardian',JSON.stringify(guardian));location.href=z;}
function lanzarConfetti(){alert('🎉 ¡Felicitaciones Guardián Climático!');}
function mostrarAvatarFinal(){if(!guardian.avatar)return;document.getElementById('avatarFinal').innerHTML='<div class="avatar '+guardian.avatar+'"></div>';}
document.addEventListener('DOMContentLoaded',mostrarAvatarFinal);