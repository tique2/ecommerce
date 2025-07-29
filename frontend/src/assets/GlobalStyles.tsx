import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    /* Paleta de colores principal */
    --color-primary: #E53E3E;
    --color-secondary: #3182CE;
    --color-accent: #FFD700;
    --color-success: #38A169;
    --color-warning: #FF8C00;
    
    /* Tonos neutros */
    --color-text: #333333;
    --color-text-light: #666666;
    --color-background: #f8f9fa;
    --color-border: #e2e8f0;
    
    /* Espaciado */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    
    /* Fuentes */
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-md: 1rem;
    --font-size-lg: 1.25rem;
    --font-size-xl: 1.5rem;
    --font-size-xxl: 2rem;
    
    /* Bordes y sombras */
    --border-radius-sm: 4px;
    --border-radius-md: 8px;
    --border-radius-lg: 12px;
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
    
    /* Transiciones */
    --transition-fast: 0.2s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }
  
  body {
    font-family: 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: var(--color-text);
    background-color: var(--color-background);
    line-height: 1.5;
  }
  
  a {
    color: var(--color-secondary);
    text-decoration: none;
  }
  
  button {
    cursor: pointer;
    font-family: inherit;
  }
  
  img {
    max-width: 100%;
    height: auto;
  }
  
  /* Contenedor principal */
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-md);
  }
  
  /* Utilidades para espaciado */
  .mt-1 { margin-top: var(--spacing-sm); }
  .mt-2 { margin-top: var(--spacing-md); }
  .mt-3 { margin-top: var(--spacing-lg); }
  .mb-1 { margin-bottom: var(--spacing-sm); }
  .mb-2 { margin-bottom: var(--spacing-md); }
  .mb-3 { margin-bottom: var(--spacing-lg); }
  
  /* Utilidades para texto */
  .text-center { text-align: center; }
  .text-bold { font-weight: 700; }
  
  /* Utilidades para animaciones */
  .fade-in {
    animation: fadeIn var(--transition-normal);
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  /* Responsive */
  @media (max-width: 1200px) {
    .container {
      max-width: 960px;
    }
  }
  
  @media (max-width: 992px) {
    .container {
      max-width: 720px;
    }
  }
  
  @media (max-width: 768px) {
    .container {
      max-width: 540px;
    }
    
    html {
      font-size: 15px;
    }
  }
  
  @media (max-width: 576px) {
    .container {
      max-width: 100%;
      padding: 0 var(--spacing-sm);
    }
    
    html {
      font-size: 14px;
    }
  }
`;

export default GlobalStyles;
