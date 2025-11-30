export default function AuthForm({ title, onSubmit, buttonText }) {
  return (
    <form
      className="auth-form"
      onSubmit={(e) => {
        e.preventDefault();

        const data = Object.fromEntries(new FormData(e.target));

        onSubmit({
          nome: data.nome,
          username: data.username,
          email: data.email,
          password: data.senha,
        });
      }}
    >
      <h2>{title}</h2>

      <input name="nome" placeholder="Nome completo" required />
      <input name="username" placeholder="Nome de usuário" required />
      <input name="email" type="email" placeholder="E-mail" required />
      <input name="senha" type="password" placeholder="Senha" required />

      <button type="submit">{buttonText}</button>
    </form>
  );
}
