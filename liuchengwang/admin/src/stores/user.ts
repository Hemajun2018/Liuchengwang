import { defineStore } from 'pinia';
import type { User, UserRole } from '../types/api';

interface UserState {
  token: string | null;
  userInfo: User | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: localStorage.getItem('token'),
    userInfo: null
  }),
  
  getters: {
    isLoggedIn(): boolean {
      return !!this.token;
    },
    
    userRole(): UserRole | null {
      return this.userInfo?.role || null;
    }
  },
  
  actions: {
    setToken(token: string) {
      this.token = token;
      localStorage.setItem('token', token);
    },
    
    setUserInfo(userInfo: User) {
      this.userInfo = userInfo;
    },
    
    logout() {
      this.token = null;
      this.userInfo = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
    }
  }
}); 