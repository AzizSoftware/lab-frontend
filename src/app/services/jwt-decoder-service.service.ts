import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JwtDecoderService {
  decodeToken(token: string | null): any {
    if (!token) {
      console.warn('⚠️ No token found in localStorage');
      return null;
    }
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      console.log('✅ Decoded JWT payload:', decoded);
      return decoded;
    } catch (e) {
      console.error('❌ Error decoding JWT token:', e);
      return null;
    }
  }

  getRoleFromToken(): string | null {
    const token = localStorage.getItem('authToken'); // Changed from 'jwtToken'
    const payload = this.decodeToken(token);
    const role = payload?.role || null;
    console.log('🎭 Extracted Role:', role);
    return role;
  }

  getEmailFromToken(): string | null {
    const token = localStorage.getItem('authToken'); // Changed from 'jwtToken'
    const payload = this.decodeToken(token);
    const email = payload?.sub || null; // Changed from 'email' to 'sub' to match JwtUtil
    console.log('📧 Extracted Email:', email);
    return email;
  }

  getUserIdFromToken(): string | null {
    const token = localStorage.getItem('authToken'); // Changed from 'jwtToken'
    const payload = this.decodeToken(token);
    const userId = payload?.sub || null; // Use 'sub' as a fallback, since backend doesn't include userId
    console.log('🆔 Extracted User ID:', userId);
    return userId;
  }
}