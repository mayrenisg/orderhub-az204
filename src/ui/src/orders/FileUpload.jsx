import { useState } from "react";

export default function FileUpload({ apiBaseUrl, token, orderId }) {

  const [file, setFile] = useState(null);

  const uploadFile = async () => {

    if (!file) {
      alert("Selecciona un archivo");
      return;
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append("orderId", orderId);


    const response = await fetch(
      `${apiBaseUrl}/files`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );


    const data = await response.json();

    console.log(data);

    alert("Archivo subido");
  };


  return (
    <div className="file-upload">
      <h3 className="file-upload-title">
        Adjuntar documento a orden #{orderId}
      </h3>

      <div className="file-upload-dropzone">
        <input
          id="file-input"
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ display: 'none' }}
        />
        <label htmlFor="file-input" className="file-upload-dropzone-text" style={{ cursor: 'pointer', display: 'block' }}>
          {file ? (
            <span className="file-upload-name">{file.name}</span>
          ) : (
            'Haz clic para seleccionar un archivo'
          )}
        </label>
      </div>

      <div className="file-upload-actions">
        <button className="btn btn-primary" onClick={uploadFile}>
          Subir documento
        </button>
      </div>
    </div>
  );
}