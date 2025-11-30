import React from "react";

/* Footer que fica no final da page-container; margin-top:auto garante rodapé no fim */
export default function Footer() {
  return (
    <footer className="site-footer">
      <div>© {new Date().getFullYear()} Dropverse — Desenvolvido por Gramari</div>
    </footer>
  );
}
