import { JSX, useEffect, useState } from 'react';

// Tip tanımlamaları
type User = {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'customer' | 'supplier';
};

type ProductType = {
  id: number;
  name: string;
};

type RequestRaw = {
  id: number;
  customerId: number;
  products: {
    productTypeId: number;
    quantity: number;
  }[];
  interestedSupplierIds: number[];
};

// Zenginleştirilmiş Request tipi
type Request = {
  id: number;
  customerName: string;
  products: {
    id: number;
    name: string;
    quantity: number;
  }[];
  interestedSuppliers: {
    id: number;
    name: string;
  }[];
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);

  // Modal için state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');

  // Ürün ekleme için yeni ürün adı
  const [newProductName, setNewProductName] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [usersRes, requestsRes, productsRes] = await Promise.all([
          fetch('http://localhost:3001/users'),
          fetch('http://localhost:3001/requests'),
          fetch('http://localhost:3001/product-types'),
        ]);

        const [usersData, requestsData, productsData]: [User[], RequestRaw[], ProductType[]] = await Promise.all([
          usersRes.json(),
          requestsRes.json(),
          productsRes.json(),
        ]);

        setUsers(usersData);
        setProducts(productsData);

        // Talepleri zenginleştir
        const enrichedRequests: Request[] = requestsData.map((req) => {
          const customer = usersData.find((u) => u.id === req.customerId);

          const interestedSuppliers = req.interestedSupplierIds
            .map((sid) => usersData.find((u) => u.id === sid))
            .filter((u): u is User => u !== undefined);

          const products = req.products.map((p) => {
            const prod = productsData.find((pt) => pt.id === p.productTypeId);
            return {
              id: p.productTypeId,
              name: prod ? prod.name : 'Bilinmeyen Ürün',
              quantity: p.quantity,
            };
          });

          return {
            id: req.id,
            customerName: customer ? customer.username : 'Bilinmeyen Müşteri',
            products,
            interestedSuppliers: interestedSuppliers.map((s) => ({
              id: s.id,
              name: s.username,
            })),
          };
        });

        setRequests(enrichedRequests);
      } catch (error) {
        console.error('Veriler alınırken hata oluştu:', error);
      }
    }

    fetchData();
  }, []);

  // Backend'e POST atarak ürün ekleme
  const handleAddProduct = async () => {
    if (!newProductName.trim()) {
      alert('Lütfen ürün adı girin.');
      return;
    }

    try {
      const res = await fetch('http://localhost:3001/product-types', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newProductName.trim() }),
      });

      if (!res.ok) {
        alert('Ürün eklenirken hata oluştu.');
        return;
      }

      const newProduct = await res.json();

      if (newProduct.error) {
        alert(newProduct.error);
        return;
      }

      setProducts((prev) => [...prev, newProduct]);
      setNewProductName('');
    } catch (error) {
      alert('Sunucu ile bağlantı kurulamadı.');
    }
  };

  // Modal içeriği fonksiyonla render ediliyor
  const renderModalContent = () => {
    switch (modalTitle) {
      case 'Tüm Müşteriler':
        return (
          <ul style={{ maxHeight: 300, overflowY: 'auto', paddingLeft: 20 }}>
            {users.filter((u) => u.role === 'customer').map((cust) => (
              <li key={cust.id} style={{ marginBottom: 6, fontSize: 16 }}>
                {cust.username}
              </li>
            ))}
          </ul>
        );

      case 'Tüm Tedarikçiler':
        return (
          <ul style={{ maxHeight: 300, overflowY: 'auto', paddingLeft: 20 }}>
            {users.filter((u) => u.role === 'supplier').map((supp) => (
              <li key={supp.id} style={{ marginBottom: 6, fontSize: 16 }}>
                {supp.username}
              </li>
            ))}
          </ul>
        );

      case 'Tüm Talepler':
        return (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              maxHeight: 400,
              overflowY: 'auto',
              display: 'block',
            }}
          >
            <thead
              style={{
                backgroundColor: '#f3f4f6',
                display: 'table',
                width: '100%',
                tableLayout: 'fixed',
              }}
            >
              <tr>
                <th
                  style={{
                    border: '1px solid #d1d5db',
                    padding: 8,
                    textAlign: 'left',
                    width: '30%',
                  }}
                >
                  Müşteri
                </th>
                <th
                  style={{
                    border: '1px solid #d1d5db',
                    padding: 8,
                    textAlign: 'left',
                    width: '50%',
                  }}
                >
                  Ürünler
                </th>
                <th
                  style={{
                    border: '1px solid #d1d5db',
                    padding: 8,
                    textAlign: 'left',
                    width: '20%',
                  }}
                >
                  İlgilenen Tedarikçiler
                </th>
              </tr>
            </thead>
            <tbody
              style={{
                display: 'block',
                maxHeight: 300,
                overflowY: 'auto',
                width: '100%',
              }}
            >
              {requests.map((req) => (
                <tr
                  key={req.id}
                  style={{
                    display: 'table',
                    width: '100%',
                    tableLayout: 'fixed',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  <td style={{ border: '1px solid #d1d5db', padding: 8 }}>{req.customerName}</td>
                  <td style={{ border: '1px solid #d1d5db', padding: 8 }}>
                    {req.products.map((p) => `${p.name} (${p.quantity})`).join(', ')}
                  </td>
                  <td style={{ border: '1px solid #d1d5db', padding: 8 }}>
                    {req.interestedSuppliers.length > 0
                      ? req.interestedSuppliers.map((s) => s.name).join(', ')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'Tüm Ürünler':
        return (
          <div>
            <ul style={{ maxHeight: 200, overflowY: 'auto', paddingLeft: 20 }}>
              {products.map((prod) => (
                <li key={prod.id} style={{ marginBottom: 6, fontSize: 16 }}>
                  {prod.name}
                </li>
              ))}
            </ul>
            <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                placeholder="Yeni ürün adı"
                style={{
                  padding: 8,
                  fontSize: 16,
                  flex: 1,
                  borderRadius: 4,
                  border: '1px solid #ccc',
                }}
              />
              <button
                onClick={handleAddProduct}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#0369a1',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                Ürün Ekle
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Modal açma fonksiyonu
  const openModal = (type: 'customers' | 'suppliers' | 'requests' | 'products') => {
    setNewProductName(''); // Modal açılırken inputu sıfırla

    let title = '';
    switch (type) {
      case 'customers':
        title = 'Tüm Müşteriler';
        break;
      case 'suppliers':
        title = 'Tüm Tedarikçiler';
        break;
      case 'requests':
        title = 'Tüm Talepler';
        break;
      case 'products':
        title = 'Tüm Ürünler';
        break;
    }

    setModalTitle(title);
    setModalVisible(true);
  };

  return (
    <div className="container" style={{ padding: 20 }}>
      <h1 style={{ fontSize: 32, marginBottom: 32 }}>Yönetici Paneli</h1>

      {/* Özet Kartlar */}
      <section
        className="section"
        style={{
          display: 'flex',
          gap: 24,
          justifyContent: 'center',
          marginBottom: 40,
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 220,
            background: '#e0f2fe',
            borderRadius: '1rem',
            padding: 20,
            boxShadow: '0 6px 18px rgba(14,165,233,0.3)',
            textAlign: 'center',
            cursor: 'pointer',
          }}
          onClick={() => openModal('customers')}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: '#0369a1',
              marginBottom: 12,
            }}
          >
            Tüm Müşteriler
          </h2>
          <p style={{ color: '#0c4a6e' }}>Sisteme kayıtlı müşteri listesini görüntüleyin.</p>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 220,
            background: '#d1fae5',
            borderRadius: '1rem',
            padding: 20,
            boxShadow: '0 6px 18px rgba(34,197,94,0.3)',
            textAlign: 'center',
            cursor: 'pointer',
          }}
          onClick={() => openModal('suppliers')}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: '#166534',
              marginBottom: 12,
            }}
          >
            Tüm Tedarikçiler
          </h2>
          <p style={{ color: '#14532d' }}>Tedarikçileri listeleyin ve durumlarını kontrol edin.</p>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 220,
            background: '#ede9fe',
            borderRadius: '1rem',
            padding: 20,
            boxShadow: '0 6px 18px rgba(139,92,246,0.3)',
            textAlign: 'center',
            cursor: 'pointer',
          }}
          onClick={() => openModal('requests')}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: '#5b21b6',
              marginBottom: 12,
            }}
          >
            Tüm Talepler
          </h2>
          <p style={{ color: '#4c1d95' }}>Talepleri ve ilgili tedarikçileri inceleyin.</p>
        </div>

        <div
          style={{
            flex: 1,
            minWidth: 220,
            background: '#fff4e5',
            borderRadius: '1rem',
            padding: 20,
            boxShadow: '0 6px 18px rgba(234,179,8,0.3)',
            textAlign: 'center',
            cursor: 'pointer',
          }}
          onClick={() => openModal('products')}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: '700',
              color: '#a16207',
              marginBottom: 12,
            }}
          >
            Tüm Ürünler
          </h2>
          <p style={{ color: '#854d0e' }}>Ürünleri görüntüle ve yeni ürün ekle.</p>
        </div>
      </section>

      {/* Kullanıcılar Tablosu */}
      <section className="section">
        <h2>Kullanıcılar</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f3f4f6' }}>
              <tr>
                <th
                  style={{
                    border: '1px solid #d1d5db',
                    padding: 12,
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: 18,
                  }}
                >
                  İsim
                </th>
                <th
                  style={{
                    border: '1px solid #d1d5db',
                    padding: 12,
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: 18,
                  }}
                >
                  Rol
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'default',
                    transition: 'background-color 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                >
                  <td style={{ border: '1px solid #d1d5db', padding: 12, fontSize: 17 }}>
                    {user.username}
                  </td>
                  <td
                    style={{
                      border: '1px solid #d1d5db',
                      padding: 12,
                      fontSize: 17,
                      textTransform: 'capitalize',
                    }}
                  >
                    {user.role}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Talepler Tablosu */}
      <section className="section" style={{ marginTop: 40 }}>
        <h2>Talepler</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f3f4f6' }}>
              <tr>
                <th
                  style={{
                    border: '1px solid #d1d5db',
                    padding: 12,
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: 18,
                  }}
                >
                  Müşteri
                </th>
                <th
                  style={{
                    border: '1px solid #d1d5db',
                    padding: 12,
                    textAlign: 'left',
                    fontWeight: '600',
                    fontSize: 18,
                  }}
                >
                  Ürünler
                </th>
                <th
                  style={{
                    border: '1px solid #d1d5db',
                    padding: 12,
                    fontWeight: '600',
                    fontSize: 18,
                  }}
                >
                  İlgilenen Tedarikçiler
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr
                  key={req.id}
                  style={{
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'default',
                    transition: 'background-color 0.3s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                >
                  <td style={{ border: '1px solid #d1d5db', padding: 12, fontSize: 17 }}>
                    {req.customerName}
                  </td>
                  <td style={{ border: '1px solid #d1d5db', padding: 12, fontSize: 17 }}>
                    {req.products.map((p) => `${p.name} (${p.quantity})`).join(', ')}
                  </td>
                  <td style={{ border: '1px solid #d1d5db', padding: 12, fontSize: 17 }}>
                    {req.interestedSuppliers.length
                      ? req.interestedSuppliers.map((s) => s.name).join(', ')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal */}
      {modalVisible && (
        <div
          onClick={() => setModalVisible(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 24,
              maxWidth: 600,
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 0 12px rgba(0,0,0,0.3)',
            }}
          >
            <h2 style={{ fontSize: 24, marginBottom: 16 }}>{modalTitle}</h2>

            <div>{renderModalContent()}</div>

            <button
              onClick={() => setModalVisible(false)}
              style={{
                marginTop: 24,
                padding: '10px 20px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 16,
              }}
            >
              Kapat
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
