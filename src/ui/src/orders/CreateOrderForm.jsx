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
    <form className="form-section" onSubmit={handleSubmit}>
      <div className="form-section-title">Crear nueva orden</div>

      <div className="form-section-body">
        <div className="form-row">
          <label className="form-label" htmlFor="order-customer">Cliente</label>
          <input
            id="order-customer"
            className="form-input"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="Nombre del cliente"
          />
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="order-total">Total</label>
          <input
            id="order-total"
            className="form-input"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            placeholder="0.00"
            type="number"
            step="0.01"
            min="0"
          />
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="order-status">Estado</label>
          <select
            id="order-status"
            className="form-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" type="submit">Crear orden</button>
      </div>
    </form>
  );
}
