import { useEffect, useState } from 'react';
import CreateOrderForm from './CreateOrderForm';

export default function OrderHubPage({ apiBaseUrl, user, token, onLogout }) {  const [orders, setOrders] = useState([]);

const fetchOrders = async () => {
  const response = await fetch(`${apiBaseUrl}/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error("Error fetching orders:", response.status);
    setOrders([]);
    return;
  }

  const data = await response.json();
  setOrders(Array.isArray(data) ? data : []);
};

useEffect(() => {
  if (!token) return;

  fetchOrders();
}, [token]);

  const canCreateOrders =
    user?.role === 'admin' || user?.role === 'operator';

  return (
    <div>
      <header>
        <h1>OrderHub</h1>
        <p>{user?.email} ({user?.role})</p>
        <button onClick={onLogout}>Cerrar sesión</button>
      </header>

      <h2>Órdenes</h2>

      {orders.map((order) => (
        <div key={order.id}>
          #{order.id} - {order.customerId} - {order.total} - {order.status}
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