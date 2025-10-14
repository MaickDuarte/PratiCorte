import { Link, NavLink } from "react-router-dom";
import { handleLogout } from "../config/auth";
import { useLocation } from "react-router-dom";

export const NavBar = props => {
    const location = useLocation();
    const isConfiguracoesActive = location.pathname.startsWith("/configuracoes");
    
    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-white fixed-top w-100 shadow-sm border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
                <div className="container-fluid px-4">
                    <NavLink to="/home" className="navbar-brand d-flex align-items-center" style={{ 
                        fontSize: 'var(--font-size-xl)', 
                        fontWeight: 'var(--font-weight-bold)', 
                        color: 'var(--primary-color)',
                        textDecoration: 'none'
                    }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
                            borderRadius: 'var(--radius-md)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 'var(--spacing-sm)',
                            color: 'white',
                            fontSize: 'var(--font-size-sm)',
                            fontWeight: 'var(--font-weight-bold)'
                        }}>
                            P
                        </div>
                        PratiCorte
                    </NavLink>
                    
                    <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation" style={{ boxShadow: 'none' }}>
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <NavLink to="/home" className={({ isActive }) => `nav-link px-3 py-2 rounded-3 ${isActive ? "active" : ""}`} style={({ isActive }) => ({
                                    color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                                    fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                                    backgroundColor: isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                                    transition: 'all var(--transition-fast)',
                                    textDecoration: 'none'
                                })}>
                                    <i className="fas fa-home me-2"></i>
                                    Home
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/historico" className={({ isActive }) => `nav-link px-3 py-2 rounded-3 ${isActive ? "active" : ""}`} style={({ isActive }) => ({
                                    color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                                    fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                                    backgroundColor: isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                                    transition: 'all var(--transition-fast)',
                                    textDecoration: 'none'
                                })}>
                                    <i className="fas fa-history me-2"></i>
                                    Histórico
                                </NavLink>
                            </li>
                            <li className="nav-item">
                                <NavLink to="/relatorios" className={({ isActive }) => `nav-link px-3 py-2 rounded-3 ${isActive ? "active" : ""}`} style={({ isActive }) => ({
                                    color: isActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                                    fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                                    backgroundColor: isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                                    transition: 'all var(--transition-fast)',
                                    textDecoration: 'none'
                                })}>
                                    <i className="fas fa-chart-bar me-2"></i>
                                    Relatórios
                                </NavLink>
                            </li>
                        </ul>
                        
                        <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
                            <li className="nav-item dropdown">
                                <button className={`nav-link dropdown-toggle px-3 py-2 rounded-3 border-0 ${isConfiguracoesActive ? "active" : ""}`} 
                                        type="button" 
                                        data-bs-toggle="dropdown" 
                                        aria-expanded="false"
                                        style={{
                                            color: isConfiguracoesActive ? 'var(--primary-color)' : 'var(--text-secondary)',
                                            fontWeight: isConfiguracoesActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
                                            backgroundColor: isConfiguracoesActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                                            transition: 'all var(--transition-fast)',
                                            background: 'none'
                                        }}>
                                    <i className="fas fa-cog me-2"></i>
                                    Configurações
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0" style={{ 
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--neutral-200)',
                                    minWidth: '200px'
                                }}>
                                    <li>
                                        <Link to="/configuracoes/estabelecimento" className="dropdown-item d-flex align-items-center py-2" style={{ 
                                            color: 'var(--text-primary)',
                                            textDecoration: 'none',
                                            transition: 'all var(--transition-fast)'
                                        }}>
                                            <i className="fas fa-building me-3"></i>
                                            Estabelecimento
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/configuracoes/usuarios" className="dropdown-item d-flex align-items-center py-2" style={{ 
                                            color: 'var(--text-primary)',
                                            textDecoration: 'none',
                                            transition: 'all var(--transition-fast)'
                                        }}>
                                            <i className="fas fa-users me-3"></i>
                                            Usuários
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/configuracoes/horarios" className="dropdown-item d-flex align-items-center py-2" style={{ 
                                            color: 'var(--text-primary)',
                                            textDecoration: 'none',
                                            transition: 'all var(--transition-fast)'
                                        }}>
                                            <i className="fas fa-clock me-3"></i>
                                            Horários
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/configuracoes/servicos" className="dropdown-item d-flex align-items-center py-2" style={{ 
                                            color: 'var(--text-primary)',
                                            textDecoration: 'none',
                                            transition: 'all var(--transition-fast)'
                                        }}>
                                            <i className="fas fa-cut me-3"></i>
                                            Serviços
                                        </Link>
                                    </li>
                                </ul>
                            </li>
                            <li className="nav-item ms-2">
                                <button className="btn btn-outline-danger" onClick={handleLogout} style={{
                                    padding: 'var(--spacing-sm) var(--spacing-lg)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '2px solid var(--error-color)',
                                    color: 'var(--error-color)',
                                    background: 'transparent',
                                    fontWeight: 'var(--font-weight-medium)',
                                    transition: 'all var(--transition-fast)'
                                }}>
                                    <i className="fas fa-sign-out-alt me-2"></i>
                                    Sair
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
            <div style={{ paddingTop: '80px' }}>
                {props.children}
            </div>
        </>
    )
}