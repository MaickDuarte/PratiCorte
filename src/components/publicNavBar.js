import { NavLink } from "react-router-dom"

export const PublicNavBar = () => {
  return (
    <nav className="navbar bg-white fixed-top w-100 shadow-sm border-bottom" style={{ borderBottom: '1px solid var(--neutral-200)' }}>
      <div className="container-fluid px-4">
        <NavLink to="/" className="navbar-brand d-flex align-items-center" style={{ 
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
      </div>
    </nav>
  )
}
export default PublicNavBar