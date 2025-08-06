import { useState, useEffect } from 'react';

interface Request {
  id: number;
  customer: string;
  products: string[];
  interestedSuppliers: string[];
  status?: 'approved' | 'rejected' | null;
}

interface ProductType {
  id: number;
  name: string;
}

export default function SupplierPage() {
  const [allRequests, setAllRequests] = useState<Request[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [productFilters, setProductFilters] = useState<string[]>([]);
  const [interests, setInterests] = useState<Record<number, boolean | null>>({});
  const [allProductTypes, setAllProductTypes] = useState<ProductType[]>([]);

  const STORAGE_KEY_CUSTOMER_REQUESTS = 'customer-order-requests';
  const STORAGE_KEY_STATUSES = 'customer-request-statuses';

  // 1. Ürün tiplerini JSON’dan çek
  useEffect(() => {
    async function fetchProductTypes() {
      try {
        const res = await fetch('http://localhost:3001/product-types'); 
        if (!res.ok) throw new Error('API fetch hatası');
        const data: ProductType[] = await res.json();
        setAllProductTypes(data);
      } catch (error) {
        console.error('Ürün tipleri yüklenirken hata:', error);
        setAllProductTypes([]);
      }
    }
    fetchProductTypes();
  }, []);
  

  // 2. Talepleri localStorage’dan oku (ürün isimleri ürün tiplerine göre eşlenecek)
  useEffect(() => {
    const storedRequests = localStorage.getItem(STORAGE_KEY_CUSTOMER_REQUESTS);
    const storedStatuses = localStorage.getItem(STORAGE_KEY_STATUSES);

    let statusData: Record<number, 'approved' | 'rejected' | null> = {};
    if (storedStatuses) {
      try {
        statusData = JSON.parse(storedStatuses);
      } catch {}
    }

    if (storedRequests) {
      try {
        const customerRequests = JSON.parse(storedRequests) as {
          id: number;
          products: { productId: number; quantity: number }[];
          interestedSuppliers: string[];
        }[];

        // Ürün id -> isim map
        const productMap: Record<number, string> = {};
        allProductTypes.forEach(p => {
          productMap[p.id] = p.name;
        });

        // Talepleri ürün isimlerine göre eşle
        const requests: Request[] = customerRequests.map(r => ({
          id: r.id,
          customer: `Müşteri ${r.id}`,
          products: r.products.map(p => productMap[p.productId] || 'Bilinmeyen Ürün'),
          interestedSuppliers: r.interestedSuppliers,
          status: statusData[r.id] || null,
        }));

        setAllRequests(requests);
        setFilteredRequests(requests);
        setInterests(
          Object.fromEntries(
            Object.entries(statusData).map(([key, value]) => [
              Number(key),
              value === 'approved' ? true : value === 'rejected' ? false : null,
            ])
          )
        );
      } catch {
        setAllRequests([]);
        setFilteredRequests([]);
      }
    } else {
      setAllRequests([]);
      setFilteredRequests([]);
    }
  }, [allProductTypes]); // allProductTypes değişince tekrar çalışsın

  // 3. Filtreleme
  useEffect(() => {
    if (productFilters.length === 0) {
      setFilteredRequests(allRequests);
    } else {
      setFilteredRequests(
        allRequests.filter(req =>
          req.products.some(p => productFilters.includes(p))
        )
      );
    }
  }, [productFilters, allRequests]);

  const toggleInterest = (id: number, value: boolean) => {
    setInterests(prev => ({ ...prev, [id]: value }));

    const storedStatuses = localStorage.getItem(STORAGE_KEY_STATUSES);
    let statusData: Record<number, 'approved' | 'rejected' | null> = {};
    if (storedStatuses) {
      try {
        statusData = JSON.parse(storedStatuses);
      } catch {}
    }
    statusData[id] = value ? 'approved' : 'rejected';
    localStorage.setItem(STORAGE_KEY_STATUSES, JSON.stringify(statusData));

    setAllRequests(prev =>
      prev.map(r => (r.id === id ? { ...r, status: statusData[id] } : r))
    );
  };

  const handleFilterChange = (product: string, checked: boolean) => {
    if (checked) {
      setProductFilters(prev => [...prev, product]);
    } else {
      setProductFilters(prev => prev.filter(p => p !== product));
    }
  };

  return (
    <div className="container">
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 32 }} role="img" aria-label="truck">
          🚚
        </span>
        Tedarikçi Paneli
      </h1>

      <section className="section">
        <h2>Ürün Tiplerine Göre Filtrele</h2>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {allProductTypes.map(product => (
            <label
              key={product.id}
              style={{ userSelect: 'none', fontSize: 18, cursor: 'pointer' }}
            >
              <input
                type="checkbox"
                checked={productFilters.includes(product.name)}
                onChange={e => handleFilterChange(product.name, e.target.checked)}
                style={{ marginRight: 8, cursor: 'pointer' }}
              />
              {product.name}
            </label>
          ))}
        </div>
      </section>


      <section className="section">
        <h2>Filtrelenmiş Talepler</h2>
        {filteredRequests.length === 0 ? (
          <p>Seçilen ürün tipine göre uygun talep bulunamadı.</p>
        ) : (
          filteredRequests.map(req => {
            const interest = interests[req.id];
            return (
              <div
                key={req.id}
                className="order-card"
                style={{
                  marginBottom: 20,
                  padding: 20,
                  borderRadius: '1rem',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
                }}
              >
                <p
                  style={{
                    fontWeight: '700',
                    fontSize: 20,
                    marginBottom: 8,
                    color: '#1e3a8a',
                  }}
                >
                  Talep ID: {req.id} - {req.customer}
                </p>
                <p style={{ marginBottom: 8, fontSize: 17, color: '#374151' }}>
                  Ürünler: {req.products.join(', ')}
                </p>
                <p
                  style={{
                    marginBottom: 12,
                    fontStyle: 'italic',
                    color: '#6b7280',
                    fontSize: 16,
                  }}
                >
                  İlgilenen Tedarikçiler: {req.interestedSuppliers.join(', ') || 'Henüz yok'}
                </p>

                {req.status && (
                  <p
                    style={{
                      fontWeight: '700',
                      fontSize: 18,
                      color: req.status === 'approved' ? '#16a34a' : '#b91c1c',
                      marginBottom: 12,
                    }}
                  >
                    {req.status === 'approved' ? 'Talep Onaylandı' : 'Talep Reddedildi'}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => toggleInterest(req.id, true)}
                    style={{
                      cursor: 'pointer',
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: interest === true ? '#16a34a' : '#2563eb',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: 18,
                      transition: 'background-color 0.3s',
                    }}
                    title="İlgileniyorum"
                  >
                    ✅
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleInterest(req.id, false)}
                    style={{
                      cursor: 'pointer',
                      padding: '8px 16px',
                      borderRadius: 8,
                      border: 'none',
                      backgroundColor: interest === false ? '#b91c1c' : '#dc2626',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: 18,
                      transition: 'background-color 0.3s',
                    }}
                    title="İlgilenmiyorum"
                  >
                    ❎
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
