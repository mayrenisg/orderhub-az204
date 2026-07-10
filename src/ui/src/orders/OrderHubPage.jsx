import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import CreateOrderForm from './CreateOrderForm';
import OrderHistory from './OrderHistory';
import FileUpload from './FileUpload';

export default function OrderHubPage({ apiBaseUrl }) {
  const { token, user, logout } = useAuth();

  const [orders, setOrders] = useState([]);

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [uploadOrderId, setUploadOrderId] = useState(null);

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

  return (
    <div>
      <header>
        <h1>OrderHub</h1>
        <p>
          {user?.email} ({user?.role})
        </p>

        <button onClick={logout}>
          Cerrar sesión
        </button>
      </header>

      <h2>Órdenes</h2>

      <button onClick={fetchOrders}>
        Refrescar órdenes
      </button>

      {orders.map((order) => (
        <div key={order.id}>
          <p>Orden #{order.id}</p>
          <p>Cliente: {order.customerId}</p>
          <p>Total: ${order.total}</p>
          <p>Estado: <strong>{order.status}</strong></p>

          <button onClick={() => setSelectedOrderId(
            selectedOrderId === order.id ? null : order.id
          )}>
            {selectedOrderId === order.id ? 'Ocultar historial' : 'Ver historial'}
          </button>

          <button onClick={() => setUploadOrderId(
            uploadOrderId === order.id ? null : order.id
          )}>
            {uploadOrderId === order.id ? 'Cancelar' : 'Adjuntar archivo'}
          </button>

          {selectedOrderId === order.id && (
            <OrderHistory
              apiBaseUrl={apiBaseUrl}
              token={token}
              selectedOrderId={selectedOrderId}
            />
          )}

          {uploadOrderId === order.id && (
            <FileUpload
              apiBaseUrl={apiBaseUrl}
              token={token}
              orderId={uploadOrderId}
              onUploadComplete={() => setUploadOrderId(null)}
            />
          )}
        </div>
      ))}

      {canCreateOrders && (
        <CreateOrderForm
          apiBaseUrl={apiBaseUrl}
          token={token}
          onOrderCreated={fetchOrders}
        />
      )}
    </div>
  );
}
