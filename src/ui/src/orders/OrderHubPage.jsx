import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import CreateOrderForm from './CreateOrderForm';
import OrderHistory from './OrderHistory';
import FileUpload from './FileUpload';
import OrderAttachments from './OrderAttachments';

export default function OrderHubPage({ apiBaseUrl }) {
  const { token, user, logout } = useAuth();

  const [orders, setOrders] = useState([]);

 const [expandedSection, setExpandedSection] = useState({
  type: null,
  orderId: null,
});

  const fetchOrders = async () => {
    if (!token) return;

    const response = await fetch(`${apiBaseUrl}/orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Error fetching orders:', response.status);
      setOrders([]);
      return;
    }

    const data = await response.json();
    setOrders(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const canCreateOrders =
    user?.role === 'admin' || user?.role === 'operator';

  const statusClass = (status) => (status || '').toLowerCase();


  const toggleSection = (type, orderId) => {
  if (
    expandedSection.type === type &&
    expandedSection.orderId === orderId
  ) {
    setExpandedSection({
      type: null,
      orderId: null,
    });
  } else {
    setExpandedSection({
      type,
      orderId,
    });
  }
};

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header-inner">
          <h1>OrderHub</h1>
          <div className="app-header-info">
            <span className="app-header-user">
              {user?.email}
              <span className="app-header-role">{user?.role}</span>
            </span>
            <button className="btn btn-danger btn-sm" onClick={logout}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="orders-header">
          <h2>Órdenes</h2>
          <button className="btn btn-primary" onClick={fetchOrders}>
            ↻ Refrescar
          </button>
        </div>

        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order.id} className="order-card fade-in">
              <div className="order-card-header">
                <span className="order-card-id">Orden #{order.id}</span>
                <span className={`status-badge ${statusClass(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="order-card-body">
                <div className="order-card-row">
                  <span className="order-card-label">Cliente</span>
                  <span className="order-card-value">{order.customerId}</span>
                </div>
                <div className="order-card-row">
                  <span className="order-card-label">Total</span>
                  <span className="order-card-value total">${order.total}</span>
                </div>
              </div>

              <div className="order-card-actions">
                <button 
  className="btn btn-sm"
  onClick={() => toggleSection('history', order.id)}
>
  {expandedSection.type === 'history' &&
   expandedSection.orderId === order.id
    ? '▼ Ocultar historial'
    : '▶ Ver historial'}
</button>

                <button
  className="btn btn-sm"
  onClick={() => toggleSection('attachments', order.id)}
>
  {expandedSection.type === 'attachments' &&
   expandedSection.orderId === order.id
    ? '✕ Ocultar adjuntos'
    : '📂 Ver adjuntos'}
</button>

                <button
  className="btn btn-sm"
  onClick={() => toggleSection('upload', order.id)}
>
  {expandedSection.type === 'upload' &&
   expandedSection.orderId === order.id
    ? '✕ Cancelar'
    : '📎 Adjuntar'}
</button>
              </div>

              {expandedSection.type === 'history' &&
 expandedSection.orderId === order.id && (
  <div className="order-card-expanded fade-in">
    <OrderHistory
      apiBaseUrl={apiBaseUrl}
      token={token}
      selectedOrderId={order.id}
    />
  </div>
)}


{expandedSection.type === 'upload' &&
 expandedSection.orderId === order.id && (
  <div className="order-card-expanded fade-in">
    <FileUpload
      apiBaseUrl={apiBaseUrl}
      token={token}
      orderId={order.id}
      onUploadComplete={() =>
        setExpandedSection({
          type: null,
          orderId: null,
        })
      }
    />
  </div>
)}


{expandedSection.type === 'attachments' &&
 expandedSection.orderId === order.id && (
  <div className="order-card-expanded fade-in">
    <OrderAttachments
      apiBaseUrl={apiBaseUrl}
      token={token}
      orderId={order.id}
    />
  </div>
)}
            </div>
          ))}

          {orders.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <p className="empty-state-text">No hay órdenes disponibles</p>
            </div>
          )}
        </div>

        {canCreateOrders && (
          <CreateOrderForm
            apiBaseUrl={apiBaseUrl}
            token={token}
            onOrderCreated={fetchOrders}
          />
        )}
      </main>
    </div>
  );
}
