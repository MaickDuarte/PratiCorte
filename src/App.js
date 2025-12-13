import React from 'react';
import AppRoutes from './config/routes';
import "flatpickr/dist/flatpickr.min.css";

class App extends React.Component {
  render() {
    return (
      <div className="main-container d-flex flex-column min-vh-100">
        <div className="flex-grow-1">
          <AppRoutes />
        </div>
        <footer className="text-center py-3 text-muted">
          © 2025 PratiCorte — Todos os direitos reservados
        </footer>
      </div>
    )
  }
}

export { App }
