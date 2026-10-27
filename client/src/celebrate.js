// Throws a handful of paper confetti from a point on the screen (used after buying a book).
// The pieces are plain elements added to the page and removed when their animation ends.
const COLOURS = ['#e2603f', '#f2b134', '#2a9d8f', '#b5476b', '#4a6fa5', '#fff6e6'];

export function celebrate(x = window.innerWidth / 2, y = window.innerHeight / 2) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  for (let i = 0; i < 36; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti';
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 180;
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.background = COLOURS[i % COLOURS.length];
    piece.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
    piece.style.setProperty('--dy', `${Math.sin(angle) * distance - 120}px`);
    piece.style.setProperty('--spin', `${Math.random() * 720 - 360}deg`);
    piece.addEventListener('animationend', () => piece.remove());
    document.body.appendChild(piece);
  }
}
