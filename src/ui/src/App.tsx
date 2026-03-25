import { useEffect, useState } from 'react';
type Order = {
  id: string;
  customerId: string;
  total: number;
  status: string;
};
function App() {
  const [health, setHealth] = useState<string>('Checking...');
  const [orders, setOrders] = useState<Order[]>([]);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const fetchHealth = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/health`);
      const data = await response.json();
      setHealth(data.ok ? 'API OK' : 'API Error');
    } catch {
      setHealth('API unreachable');
    }
  };
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/orders`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchHealth();
    fetchOrders();
  }, []);
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>OrderHub UI</h1>
      <p><strong>Health:</strong> {health}</p>
      <button onClick={fetchOrders}>Refresh Orders</button>
      <ul>
        {orders.map((order) => (
          <li key={order.id}>
            {order.id} - {order.customerId} - ${order.total} - {order.status}
          </li>
        ))}
      </ul>
    </div>
  );
}
export default App;