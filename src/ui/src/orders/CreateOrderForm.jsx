import { useState } from 'react';

export default function CreateOrderForm({
  apiBaseUrl,
  token,
  onOrderCreated,
}) {
  const [customerId, setCustomerId] = useState('');
  const [total, setTotal] = useState('');
  const [status, setStatus] = useState('Pending');

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    
  console.log("🔥 TOKEN DESDE PROP:", token);
  
    const response = await fetch(`${apiBaseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customerId,
        total: Number(total),
        status,
      }),
    });

    if (!response.ok) {
      console.error('Error creating order:', response.status);
      return;
    }

    setCustomerId('');
    setTotal('');
    setStatus('Pending');

    onOrderCreated();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Crear nueva orden</h3>

      <input
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
        placeholder="Cliente"
      />

      <input
        value={total}
        onChange={(e) => setTotal(e.target.value)}
        placeholder="Total"
        type="number"
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="Pending">Pending</option>
        <option value="Processing">Processing</option>
        <option value="Completed">Completed</option>
      </select>

      <button type="submit">Crear orden</button>
    </form>
  );
}
