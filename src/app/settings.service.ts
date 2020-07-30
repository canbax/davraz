import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  constructor() { }

  getToken(): string {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getUrl(): string {
    return localStorage.getItem('url');
  }

  setUrl(url: string): void {
    localStorage.setItem('url', url);
  }

  getSecret(): string {
    return localStorage.getItem('secret');
  }

  setSecret(url: string): void {
    localStorage.setItem('secret', url);
  }
}
