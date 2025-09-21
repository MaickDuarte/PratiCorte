import React from 'react';
import AppRoutes from './config/routes';
import "flatpickr/dist/flatpickr.min.css";

class App extends React.Component {
  render() {
      return (
          <div className="main-container">
            <AppRoutes />
          </div>
      )
  }
}

export { App }