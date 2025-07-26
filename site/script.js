function toggleTheme() {
  const body = document.body;
  body.classList.toggle('dark');
}

function searchDocs() {
  const term = document.getElementById('search').value.toLowerCase();
  const links = document.querySelectorAll('article nav a');
  links.forEach(a => {
    const text = a.textContent.toLowerCase();
    a.style.display = text.includes(term) ? '' : 'none';
  });
}
