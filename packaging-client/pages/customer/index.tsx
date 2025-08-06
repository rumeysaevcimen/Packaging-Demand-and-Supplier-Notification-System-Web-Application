import { useState, useEffect } from 'react';

interface ProductType {
  id: number;
  name: string;
}

interface OrderRequest {
  id: number;
  products: { productId: number; quantity: number }[];
  interestedSuppliers: string[];
}

export default function CustomerPage() {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [orderRequests, setOrderRequests] = useState<OrderRequest[]>([]);
  const [newOrder, setNewOrder] = useState<{ productId: number; quantity: number }[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<OrderRequest | null>(null);

  // Approval/Rejection status (stored with localStorage)
  const [requestStatuses, setRequestStatuses] = useState<Record<number, 'approved' | 'rejected' | null>>({});

  // LocalStorage keys
  const STORAGE_KEY_REQUESTS = 'customer-order-requests';
  const STORAGE_KEY_STATUSES = 'customer-request-statuses';

  // Fixed product types
  useEffect(() => {
    async function fetchProductTypes() {
      try {
        const res = await fetch('http://localhost:3001/product-types');
        if (!res.ok) throw new Error('Ürün tipleri alınamadı');
        const data: ProductType[] = await res.json();
        setProductTypes(data);
      } catch (err) {
        console.error(err);
        
        setProductTypes([
          { id: 1, name: 'Karton Koli' },
          { id: 2, name: 'Poşet' },
          { id: 3, name: 'Şişe' },
          { id: 4, name: 'Kutu' },
        ]);
      }
    }
    fetchProductTypes();
  }, []);

  // Read requests and states from localStorage at the beginning
  useEffect(() => {
    const storedRequests = localStorage.getItem(STORAGE_KEY_REQUESTS);
    if (storedRequests) {
      try {
        setOrderRequests(JSON.parse(storedRequests));
      } catch {
        setOrderRequests([]);
      }
    } else {
      // Beginning data
      setOrderRequests([
        {
          id: 101,
          products: [
            { productId: 1, quantity: 100 },
            { productId: 2, quantity: 200 },
          ],
          interestedSuppliers: ['Ahmet Yılmaz', 'Ayşe Demir', 'Mehmet Kaya'],
        },
        {
          id: 102,
          products: [
            { productId: 3, quantity: 50 },
            { productId: 4, quantity: 150 },
          ],
          interestedSuppliers: ['Ali K.', 'Fatma G.'],
        },
      ]);
    }

    const storedStatuses = localStorage.getItem(STORAGE_KEY_STATUSES);
    if (storedStatuses) {
      try {
        setRequestStatuses(JSON.parse(storedStatuses));
      } catch {
        setRequestStatuses({});
      }
    }
  }, []);

  // save to localStorage when orderRequests changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(orderRequests));
  }, [orderRequests]);

  // save to localStorage when requestStatuses change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STATUSES, JSON.stringify(requestStatuses));
  }, [requestStatuses]);

  // Find the name from product id
  const getProductName = (id: number) => productTypes.find(p => p.id === id)?.name || 'Bilinmiyor';

  // Name masking
  const maskName = (name: string) => {
    const parts = name.split(' ');
    return parts
      .map(part => {
        if (part.length <= 2) return part;
        return part.slice(0, 2) + '*'.repeat(part.length - 2);
      })
      .join(' ');
  };

  // New product row
  const addProductToNewOrder = () => {
    setNewOrder([...newOrder, { productId: productTypes[0]?.id || 0, quantity: 1 }]);
  };

  // Update product type in new product
  const updateProductInNewOrder = (index: number, productId: number) => {
    const newArr = [...newOrder];
    newArr[index].productId = productId;
    setNewOrder(newArr);
  };

  // Update quantity in new product
  const updateQuantityInNewOrder = (index: number, quantity: number) => {
    const newArr = [...newOrder];
    newArr[index].quantity = quantity > 0 ? quantity : 1;
    setNewOrder(newArr);
  };

  // Save new request
  const saveNewOrder = async () => {
    if (newOrder.length === 0) {
      alert('En az bir ürün eklemelisiniz.');
      return;
    }

    const hasInvalidQuantity = newOrder.some(item => item.quantity <= 0);
    if (hasInvalidQuantity) {
      alert('Adetler pozitif sayı olmalı.');
      return;
    }

    // Generate new id
    const newId = orderRequests.length > 0 ? Math.max(...orderRequests.map(o => o.id)) + 1 : 1;

    const newRequest: OrderRequest = {
      id: newId,
      products: newOrder,
      interestedSuppliers: [],
    };

    // Update local state
    setOrderRequests([newRequest, ...orderRequests]);
    setNewOrder([]);

    try {
      await fetch('http://localhost:3001/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      });
      alert('Talebiniz başarıyla oluşturuldu!');
    } catch (err) {
      console.error('Talep backend’e gönderilemedi:', err);
      alert('Talebiniz kaydedildi ancak sunucuya gönderilemedi.');
    }
  };

  return (
    <div className="container">
      <h1>🧾 Müşteri Paneli</h1>

      {/* Product Types and New Demand */}
      <section className="section">
        <h2>Ürün Türleri</h2>
        <ul className="list-disc">
          {productTypes.map(pt => (
            <li key={pt.id}>{pt.name}</li>
          ))}
        </ul>

        <h3>Yeni Sipariş Talebi Oluştur</h3>
        {newOrder.length === 0 && <p>Lütfen yeni talep oluşturmak için "Ürün Ekle" butonuna tıklayın.</p>}
        {newOrder.map((item, idx) => (
          <div key={idx} className="product-row" style={{ marginBottom: '8px' }}>
            <select
              className="product-select"
              value={item.productId}
              onChange={e => updateProductInNewOrder(idx, Number(e.target.value))}
              style={{ marginRight: '8px', padding: '4px' }}
            >
              {productTypes.map(pt => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))}
            </select>
            <input
              className="product-quantity"
              type="number"
              min={1}
              value={item.quantity}
              onChange={e => updateQuantityInNewOrder(idx, Number(e.target.value))}
              style={{ width: '60px', marginRight: '8px', padding: '4px' }}
            />
            <button
              className="btn btn-danger"
              onClick={() => setNewOrder(newOrder.filter((_, i) => i !== idx))}
              style={{ padding: '4px 8px' }}
            >
              Kaldır
            </button>
          </div>
        ))}
        <button className="btn" onClick={addProductToNewOrder} style={{ marginTop: '8px' }}>
          Ürün Ekle
        </button>
        <br />
        <br />
        <button className="btn" onClick={saveNewOrder}>
          Talebi Kaydet
        </button>
      </section>

      {/* Order Requests List */}
      <section className="section" style={{ marginTop: '32px' }}>
        <h2>Sipariş Taleplerim</h2>
        {orderRequests.length === 0 ? (
          <p>Henüz sipariş talebiniz yok.</p>
        ) : (
          orderRequests.map(req => {
            const status = requestStatuses[req.id];
            return (
              <div
                key={req.id}
                className="order-card"
                onClick={() => setSelectedRequest(req)}
                title="Talep Detayını Görüntüle"
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '12px',
                  cursor: 'pointer',
                  backgroundColor: '#fafafa',
                }}
              >
                <p className="order-id" style={{ fontWeight: '600' }}>
                  Talep ID: {req.id}
                </p>
                <ul className="order-products" style={{ marginLeft: '16px' }}>
                  {req.products.map((p, i) => (
                    <li key={i}>
                      {getProductName(p.productId)} — {p.quantity} adet
                    </li>
                  ))}
                </ul>
                <p className="order-suppliers" style={{ marginTop: '8px' }}>
                  İlgilenen tedarikçi sayısı: {req.interestedSuppliers.length}
                </p>

                {/* Status message */}
                {status ? (
                  <p
                    style={{
                      fontWeight: '700',
                      fontSize: '18px',
                      color: status === 'approved' ? '#16a34a' : '#b91c1c',
                      marginTop: '8px',
                    }}
                  >
                    {status === 'approved' ? 'Talebiniz Onaylandı' : 'Talebiniz Reddedildi'}
                  </p>
                ) : null}
              </div>
            );
          })
        )}
      </section>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedRequest(null)}
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
            zIndex: 999,
          }}
        >
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%',
            }}
          >
            <h3>Talep Detayları - ID {selectedRequest.id}</h3>
            <h4>Ürünler:</h4>
            <ul>
              {selectedRequest.products.map((p, i) => (
                <li key={i}>
                  {getProductName(p.productId)} — {p.quantity} adet
                </li>
              ))}
            </ul>
            <h4>İlgilenen Tedarikçiler:</h4>
            <ul>
              {selectedRequest.interestedSuppliers.map((name, i) => (
                <li key={i}>{maskName(name)}</li>
              ))}
            </ul>
            <button
              className="modal-close-btn"
              onClick={() => setSelectedRequest(null)}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: '#0369a1',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
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
