// Minimal client-side JS for navigation or analytics.
document.addEventListener('DOMContentLoaded', function(){
  // Example: add keyboard shortcut "g p" to go to projects
  let seq = '';
  window.addEventListener('keydown', e=>{
    if(e.key.length===1) seq += e.key.toLowerCase();
    if(seq.endsWith('gp')) location.href = '/projects.html';
    if(seq.length>5) seq = seq.slice(-5);
  });
});