export default function parseNotes(notes) {
  if (notes.data === null) { return ''; }
  const tmp = document.createElement('div');
  tmp.innerHTML = notes.data.value;
  return tmp.textContent || tmp.innerText || '';
}
