export default function parseNotes(notes) {
  if (!notes) { return ''; }
  const tmp = document.createElement('div');
  tmp.innerHTML = notes.value;
  return tmp.textContent || tmp.innerText || '';
}
