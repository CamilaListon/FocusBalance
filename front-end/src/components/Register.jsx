import { useState } from "react";
import { api } from "../services/api";

const Register = () => {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/usuario", form);
      setMsg("Usuário criado com sucesso!");
    } catch (err) {
      setMsg(err.response?.data?.message);
    }
  };

  return (
    <div className="cadastro-container">
      <h2 className="login-cadastro">Cadastro</h2>

      <div className="formulario-cadastro">
        <form onSubmit={handleSubmit} className="formulario-interno-cadastro">
          <input placeholder="Nome" className="input-cadastro"
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />

          <input placeholder="Email" className="input-cadastro"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <input type="password" placeholder="Senha" className="input-cadastro"
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
          />

          <button>Cadastrar</button>
        </form>

        {msg && <p>{msg}</p>}

        <div className="cadastrar-btn">
          <a href="/">Voltar</a>
        </div>
      </div>
    </div>
  );
};

export default Register;