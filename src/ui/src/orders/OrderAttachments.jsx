import { useEffect, useState } from 'react';

export default function OrderAttachments({ apiBaseUrl, token, orderId }) {
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    if (!orderId) return;

    fetch(`${apiBaseUrl}/orders/${orderId}/attachments`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setAttachments)
      .catch(console.error);
  }, [orderId]);

  return (
    <section className="order-attachments">
      <h3>Archivos adjuntos</h3>

      {attachments.length === 0 ? (
        <p>No hay archivos adjuntos.</p>
      ) : (
        <ul>
          {attachments.map((file) => (
            <li key={file.id}>
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {file.fileName}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}