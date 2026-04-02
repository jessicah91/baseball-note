const logos={
LOTTE:'https://upload.wikimedia.org/wikipedia/commons/6/6b/Lotte_Giants_logo.svg',
LG:'https://upload.wikimedia.org/wikipedia/commons/3/3c/LG_Twins_logo.svg',
KIA:'https://upload.wikimedia.org/wikipedia/commons/7/7c/Kia_Tigers_logo.svg',
SAMSUNG:'https://upload.wikimedia.org/wikipedia/commons/5/5d/Samsung_Lions_logo.svg',
DOOSAN:'https://upload.wikimedia.org/wikipedia/commons/2/2e/Doosan_Bears_logo.svg',
KT:'https://upload.wikimedia.org/wikipedia/commons/1/1f/KT_Wiz_logo.svg',
SSG:'https://upload.wikimedia.org/wikipedia/commons/0/0c/SSG_Landers_logo.svg',
HANWHA:'https://upload.wikimedia.org/wikipedia/commons/3/3e/Hanwha_Eagles_logo.svg',
NC:'https://upload.wikimedia.org/wikipedia/commons/9/9c/NC_Dinos_logo.svg',
KIWOOM:'https://upload.wikimedia.org/wikipedia/commons/4/4c/Kiwoom_Heroes_logo.svg'
};

function go(id){
document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
document.getElementById(id).classList.add('active');
if(id==='mypage') load();
}

document.getElementById('startBtn').onclick=()=>{
const nick=document.getElementById('nickname').value;
const team=document.getElementById('team').value;
localStorage.setItem('nick',nick);
localStorage.setItem('team',team);
init();
go('home');
}

function init(){
document.getElementById('nickDisplay').innerText=localStorage.getItem('nick');
document.getElementById('logo').src=logos[localStorage.getItem('team')];
}

function save(){
let arr=JSON.parse(localStorage.getItem('notes')||'[]');
arr.push(document.getElementById('text').value);
localStorage.setItem('notes',JSON.stringify(arr));
alert('저장됨');
}

function load(){
let arr=JSON.parse(localStorage.getItem('notes')||'[]');
document.getElementById('list').innerHTML=arr.map(a=>`<div>${a}</div>`).join('');
}

init();
