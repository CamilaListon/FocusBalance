import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/login", { email, senha });

      localStorage.setItem("token", response.data.token);

      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao logar");
    }
  };

  return (
    <div className="login-container">
      <div className="sub-container">
        <h2 className="login-titulo">Login</h2>

        <div className="formulario-login">
          <form onSubmit={handleSubmit} className="formulario-interno">
            <input className="input-login"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <input className="input-login"
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            <button className="entrar-btn">Entrar</button>
          </form>

          {error && <p className="erro">{error}</p>}
          <div className="criar-conta">
            <a href="/register" id="criar-conta-botao">Criar conta</a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;