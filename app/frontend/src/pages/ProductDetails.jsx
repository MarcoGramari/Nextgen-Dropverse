import React from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";

export default function ProductDetails() {
  const { id } = useParams();
  const [p, setP] = React.useState(null);
  React.useEffect(()=> {
    api.get(`/produtos/${id}`).then(r => setP(r.data)).catch(()=> {});
  }, [id]);

  if (!p) return <div>Carregando...</div>;
  return (
    <div className="product-page card">
      <h1>{p.titulo}</h1>
      <p>{p.descricao}</p>
      <div>Preço: R$ {p.preco?.toFixed(2)}</div>
      <a className="btn" href={`${import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000/api"}/produtos/download/${p.file_path}`}>Download</a>
    </div>
  );
}
