export const api = {
    login: async (body: { username: string; password: string }) => {
      const res = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
  
      if (!res.ok) {
        throw new Error('Giriş yapılamadı');
      }
  
      return res.json();
    },
  };
  