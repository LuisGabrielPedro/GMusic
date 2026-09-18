const checks = [...document.querySelectorAll('.progress-check')];
const progressValue = document.getElementById('progressValue');
const progressText = document.getElementById('progressText');
const resetProgress = document.getElementById('resetProgress');
const sidebar = document.getElementById('sidebar');
const menuButton = document.getElementById('menuButton');
const navLinks = [...document.querySelectorAll('.nav a')];

function updateProgress() {
  const completed = checks.filter((check) => check.checked).length;
  const percentage = checks.length ? Math.round((completed / checks.length) * 100) : 0;
  progressValue.style.width = `${percentage}%`;
  progressText.textContent = `${percentage}%`;
}

checks.forEach((check) => {
  const saved = localStorage.getItem(`gmusic-${check.dataset.key}`);
  check.checked = saved === '1';

  check.addEventListener('change', () => {
    localStorage.setItem(`gmusic-${check.dataset.key}`, check.checked ? '1' : '0');
    updateProgress();
  });
});

resetProgress.addEventListener('click', () => {
  checks.forEach((check) => {
    check.checked = false;
    localStorage.removeItem(`gmusic-${check.dataset.key}`);
  });
  updateProgress();
});

updateProgress();

document.querySelectorAll('.copy-btn').forEach((button) => {
  button.addEventListener('click', async () => {
    const card = button.closest('.code-card');
    const code = card.querySelector('code').innerText;
    const previousText = button.textContent;

    try {
      await navigator.clipboard.writeText(code);
      button.textContent = 'Copiado!';
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
      button.textContent = 'Copiado!';
    }

    window.setTimeout(() => {
      button.textContent = previousText;
    }, 1300);
  });
});

menuButton.addEventListener('click', () => {
  sidebar.classList.toggle('open');
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    sidebar.classList.remove('open');
  });
});

const observedSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${visible.target.id}`);
    });
  },
  { rootMargin: '-18% 0px -68% 0px', threshold: [0, 0.15, 0.4] },
);

observedSections.forEach((section) => observer.observe(section));
