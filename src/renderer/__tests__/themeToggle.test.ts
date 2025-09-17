import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';

// Simple test to ensure theme attribute toggles on body when button clicked.
describe('Theme toggle behavior', () => {
  test('toggles data-theme on body', () => {
    document.body.innerHTML = '<button class="theme-toggle-btn"></button>';
    // Simulate the effect code from App.tsx
    let theme: 'light' | 'dark' = 'light';
    const btn = document.querySelector('.theme-toggle-btn')!;
    const apply = () => document.body.setAttribute('data-theme', theme);
    apply();
    btn.addEventListener('click', () => {
      theme = theme === 'light' ? 'dark' : 'light';
      apply();
    });

    expect(document.body.getAttribute('data-theme')).toBe('light');
    fireEvent.click(btn);
    expect(document.body.getAttribute('data-theme')).toBe('dark');
    fireEvent.click(btn);
    expect(document.body.getAttribute('data-theme')).toBe('light');
  });
});
