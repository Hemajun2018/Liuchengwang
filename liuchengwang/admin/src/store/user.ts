import { defineStore } from 'pinia';

export interface UserInfo {
  id: number;
  username: string;
  role: string;
  email?: string;
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null as UserInfo | null,
    token: null as string | null,
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    userRole: (state) => state.userInfo?.role || null,
  },
  
  actions: {
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo;
    },
    
    setToken(token: string) {
      this.token = token;
    },
    
    logout() {
      this.userInfo = null;
      this.token = null;
    },
    
    // 从本地存储加载数据
    loadUserData() {
      try {
        const token = localStorage.getItem('token');
        const userInfoStr = localStorage.getItem('userInfo');
        
        if (token) {
          this.token = token;
        }
        
        if (userInfoStr) {
          this.userInfo = JSON.parse(userInfoStr);
        }
      } catch (error) {
        console.error('加载用户数据失败:', error);
      }
    },
  },
}); 