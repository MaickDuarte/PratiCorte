import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { Login, Register } from "../view/conta/loginAndRegister";
import { Home } from "../view/home/home";
import { auth } from "../config/firebase";
import { Establishment } from "../view/configurar/establishment";
import { OpeningHours } from "../view/configurar/openingHours";
import { Services } from "../view/configurar/services";
import { Reports } from "../view/relatorios/reports";
import { History } from "../view/historico/history";
import { UserTerms } from "../view/configurar/termosDeUso";
import { Users } from "../view/configurar/users";
import { ClientAppointment } from "../view/publica/appointment";

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const user = auth.currentUser
      setIsAuthenticated(!!user)
    };
    checkUser()
  }, [])

  if (isAuthenticated === null) {
    return <div></div>;
  }

  return isAuthenticated ? children : <Navigate to="/" />;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<div className="center-container"><Login /></div>} />
    <Route path="/criar-conta" element={<div className="center-container"><Register /></div>} />

    {/* ROTAS PRIVADAS */}
    <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
    <Route path="/historico" element={<PrivateRoute><History /></PrivateRoute>} />
    <Route path="/relatorios" element={<PrivateRoute><Reports /></PrivateRoute>} />
    <Route path="/configuracoes/estabelecimento" element={<PrivateRoute><Establishment /></PrivateRoute>} />
    <Route path="/configuracoes/horarios" element={<PrivateRoute><OpeningHours /></PrivateRoute>} />
    <Route path="/configuracoes/servicos" element={<PrivateRoute><Services /></PrivateRoute>} />
    <Route path="/configuracoes/usuarios" element={<PrivateRoute><Users /></PrivateRoute>} />

    {/* ROTA PÚBLICA */}
    <Route path="/estabelecimento/:id/marcar" element={<ClientAppointment />}/>

    <Route path="/termos-de-uso" element={<div className="center-container"><UserTerms /></div>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
)

export default AppRoutes
