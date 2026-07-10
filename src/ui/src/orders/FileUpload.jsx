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
    <div>

      <h3>
        Adjuntar documento a orden #{orderId}
      </h3>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />


      <button onClick={uploadFile}>
        Subir documento
      </button>

    </div>
  );
}