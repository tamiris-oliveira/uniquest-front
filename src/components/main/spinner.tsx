import React from 'react';
import './spinner.css';

/**
 * Um componente de spinner de carregamento simples.
 * Ele é centralizado dentro do seu contêiner pai por padrão.
 */
const Spinner = () => {
  return (
    <div className="spinner-container" aria-label="Carregando">
      <div className="spinner"></div>
    </div>
  );
};

export default Spinner;