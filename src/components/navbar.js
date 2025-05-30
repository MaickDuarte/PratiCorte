import { Link, NavLink } from "react-router-dom";
import { handleLogout } from "../config/auth";
import { useLocation } from "react-router-dom";

export const NavBar = props => {
    const location = useLocation();
    const isConfiguracoesActive = location.pathname.startsWith("/configuracoes");
    
    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top w-100">
                <div className="container-fluid">
                    <NavLink to="/home" className="navbar-brand">
                        PratiCorte
                    </NavLink>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <NavLink to="/home" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                                Home
                            </NavLink>
                            <NavLink to="/historico" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                                Historico
                            </NavLink>
                            <NavLink to="/relatorios" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                                Relatórios
                            </NavLink>
                        </ul>
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li className="nav-item dropdown">
                            <button className={`nav-link dropdown-toggle${isConfiguracoesActive ? " active" : ""}`} type="button"data-bs-toggle="dropdown" aria-expanded="false">
                                Configurações
                            </button>
                                <ul className="dropdown-menu">
                                    <Link to="/configuracoes/estabelecimento" className="dropdown-item">
                                        Estabelecimento
                                    </Link>
                                    <Link to="/configuracoes/usuarios" className="dropdown-item">
                                        Usuários
                                    </Link>
                                    <Link to="/configuracoes/horarios" className="dropdown-item">
                                        Horários
                                    </Link>
                                    <Link to="/configuracoes/servicos" className="dropdown-item">
                                        Serviços
                                    </Link>
                                </ul>
                            </li>
                            <button className="btn btn-outline-danger ms-2" onClick={handleLogout}>Sair</button>
                        </ul>
                    </div>
                </div>
            </nav>
            <div className="pt-5 mt-5">
                {props.children}
            </div>
        </>
    )
}