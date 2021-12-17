export default function parseNotes(notes) {
  if (notes === null) { return ''; }
  const tmp = document.createElement('div');
  tmp.innerHTML = notes.value;
  return tmp.textContent || tmp.innerText || '';
}
