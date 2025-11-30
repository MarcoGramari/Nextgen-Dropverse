export default function ProductForm({ onSubmit, defaultValues = {} }) {
    return (
      <form className="space-y-3" onSubmit={(e) => {
        e.preventDefault();
        const fd = Object.fromEntries(new FormData(e.target));
        fd.preco = parseFloat(fd.preco);
        onSubmit(fd);
      }}>
        <input name="titulo" placeholder="Título" defaultValue={defaultValues.titulo || ""} className="w-full p-2 rounded" required/>
        <textarea name="descricao" placeholder="Descrição" defaultValue={defaultValues.descricao || ""} className="w-full p-2 rounded" required/>
        <input name="categoria" placeholder="Categoria" defaultValue={defaultValues.categoria || ""} className="w-full p-2 rounded" required/>
        <input name="preco" type="number" step="0.01" placeholder="Preço" defaultValue={defaultValues.preco || ""} className="w-full p-2 rounded" required/>
        <input name="vendedor_id" type="number" placeholder="ID do vendedor" defaultValue={defaultValues.vendedor_id || ""} className="w-full p-2 rounded" required/>
        <button className="bg-accent px-4 py-2 rounded">Publicar</button>
      </form>
    );
  }
  