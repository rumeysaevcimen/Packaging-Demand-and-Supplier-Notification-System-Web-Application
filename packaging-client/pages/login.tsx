import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const res = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'admin') router.push('/admin');
      else if (data.user.role === 'customer') router.push('/customer');
      else if (data.user.role === 'supplier') router.push('/supplier');
    } else {
      setError(data.message || 'Giriş başarısız.');
    }
  };

  return (
    <Layout title="Giriş Yap">
      <div className="min-h-screen flex flex-row">
       
        <div className="hidden md:flex flex-col justify-center items-center bg-blue-600 text-white w-3/5 p-16">
          <div className="flex flex-col justify-center items-center text-center max-w-xl">
            <img
              src="/logo2.png"
              alt="Paketera Logo"
              className="mb-8"
              style={{ width: '160px', height: '160px', objectFit: 'contain' }}
            />
            <h1 className="text-5xl font-extrabold leading-tight">
              Paketera <br />
              Ambalaj Talep ve Tedarikçi Bildirim Sistemi
            </h1>
          </div>
        </div>

       
        <div className="flex w-2/5 bg-gray-50">
          <div className="flex flex-col justify-center w-full p-16">
            <div className="w-full max-w-md mx-auto bg-white p-10 rounded-xl shadow-lg">
              <h2 className="text-3xl text-center text-gray-800" >Lütfen kullanıcı bilgilerinizi giriniz</h2>
              <input
                type="text"
                placeholder="Kullanıcı Adı"
                className="input mb-4"
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
              <input
                type="password"
                placeholder="Şifre"
                className="input mb-6"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button onClick={handleLogin} className="button w-full">
                Giriş Yap
              </button>
              {error && <p className="text-red-600 mt-4 text-center">{error}</p>}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
