import { useEffect, useState } from 'react';
export default function OrderHistory({ apiBaseUrl, token, selectedOrderId }) {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    if (!selectedOrderId) return;
    fetch(`${apiBaseUrl}/audit/orders/${selectedOrderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setEvents)
      .catch(console.error);
  }, [selectedOrderId]);
  return (
    <section>
      <h3>Historial de la orden</h3>
      {events.map((event) => (
        <div key={event.id}>
          <strong>{event.type}</strong> - {event.createdAt}
        </div>
      ))}
    </section>
  );
}
