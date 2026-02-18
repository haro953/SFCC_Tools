// Minimal client-side JS for navigation or analytics.
document.addEventListener('DOMContentLoaded', function(){
  // Import nav.html into nav-container
  const navContainer = document.getElementById('nav-container');
  if (navContainer) {
    fetch('nav.html')
      .then(response => response.text())
      .then(html => {
        navContainer.innerHTML = html;
      })
      .catch(error => console.error('Error loading nav.html:', error));
  }


  const navContainerFooter = document.getElementById('nav-container-footer');
  if (navContainerFooter) {
    fetch('footer.html')
      .then(response => response.text())
      .then(html => {
        navContainerFooter.innerHTML = html;
      })
      .catch(error => console.error('Error loading footer.html:', error));
  }

  // Example: add keyboard shortcut "g p" to go to projects
  let seq = '';
  window.addEventListener('keydown', e=>{
    if(e.key.length===1) seq += e.key.toLowerCase();
    if(seq.endsWith('gp')) location.href = '/projects.html';
    if(seq.length>5) seq = seq.slice(-5);
  });
});