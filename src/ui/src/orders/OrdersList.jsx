import { useState, useEffect } from 'react';

export function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('orderhub_token');

      const response = await fetch('http://localhost:3000/orders', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar órdenes');
      }

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setError('No se pudieron cargar las órdenes. Revisa tu sesión.');
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <section>
      <h2>Órdenes</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {orders.map((order) => (
        <div key={order.id}>
          {order.id} - {order.customerId} - {order.status}
        </div>
      ))}
    </section>
  );
}