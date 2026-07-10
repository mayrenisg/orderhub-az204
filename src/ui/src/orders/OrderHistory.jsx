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
    <section className="order-history">
      <h3 className="order-history-title">Historial de la orden</h3>
      {events.length === 0 ? (
        <p className="order-history-empty">No hay eventos registrados</p>
      ) : (
        <div className="order-history-timeline">
          {events.map((event) => (
            <div key={event.id} className="order-history-event">
              <div className="order-history-dot">
                <div className="order-history-dot-inner" />
              </div>
              <div className="order-history-content">
                <div className="order-history-type">{event.type}</div>
                <div className="order-history-date">{event.createdAt}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
