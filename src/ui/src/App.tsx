import { useEffect, useState } from 'react';
type Order = {
  id: string;
  customerId: string;
  total: number;
  status: string;
};

function App() {
   const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [health, setHealth] = useState<string>('Checking...');
  
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
    const response = await fetch(`${apiBaseUrl}/orders`);
    const data = await response.json();
    setOrders(data);
    if (data.length && !selectedOrderId) {
      setSelectedOrderId(data[0].id);
    }
  };
  const handleUpload = async () => {
    if (!selectedFile || !selectedOrderId) {
      setMessage('Debes seleccionar una orden y un archivo.');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('orderId', selectedOrderId);
    try {
      const response = await fetch(`${apiBaseUrl}/files`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setMessage(`Archivo cargado correctamente para la orden ${data.orderId}: ${data.fileName}`);
    } catch (error) {
      console.error(error);
      setMessage('Ocurrió un error al subir el archivo.');
    }
  };
  useEffect(() => {
    fetchOrders();
  }, []);
  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>OrderHub</h1>
      <h2>Órdenes</h2>
      <select
        value={selectedOrderId}
        onChange={(e) => setSelectedOrderId(e.target.value)}
      >
        {orders.map((order) => (
          <option key={order.id} value={order.id}>
            {order.id} - {order.customerId} - {order.status}
          </option>
        ))}
      </select>
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
        <h3>Adjuntos de la orden</h3>
        <p>Orden seleccionada: <strong>{selectedOrderId || 'Ninguna'}</strong></p>
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
        />
        <button onClick={handleUpload} style={{ marginLeft: '1rem' }}>
          Subir archivo
        </button>
        <p style={{ marginTop: '1rem' }}>{message}</p>
      </div>
    </div>
  );
}
export default App;