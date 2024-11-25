import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private darkModeKey = 'dark-mode';

  constructor() {
    this.loadInitialTheme();
  }

  isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  loadInitialTheme(): void {
    if (this.isBrowser()) {
      const savedTheme = localStorage.getItem(this.darkModeKey);
      if (savedTheme === 'true') {
        this.enableDarkMode();
      } else {
        this.enableLightMode();
      }
    }
  }

  toggleTheme(): void {
    if (this.isBrowser()) {
      const isDarkMode = document.body.classList.toggle('dark-mode');
      localStorage.setItem(this.darkModeKey, String(isDarkMode));
    }
  }

  enableDarkMode(): void {
    if (this.isBrowser()) {
      document.body.classList.add('dark-mode');
      localStorage.setItem(this.darkModeKey, 'true');
    }
  }

  enableLightMode(): void {
    if (this.isBrowser()) {
      document.body.classList.remove('dark-mode');
      localStorage.setItem(this.darkModeKey, 'false');
    }
  }
}
