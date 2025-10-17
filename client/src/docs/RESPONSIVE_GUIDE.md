# Guia de Responsividade Avançada

Este guia explica como usar o sistema de responsividade avançada implementado no projeto Janela de Johari.

## 📱 Sistema de Responsividade

### Breakpoints Definidos

```typescript
const breakpoints = {
  xs: 320,   // Mobile Extra Small
  sm: 480,   // Mobile Small  
  md: 768,   // Tablet
  lg: 1024,  // Desktop
  xl: 1440,  // Large Desktop
}
```

### Hooks Disponíveis

#### 1. `useResponsive()`
Hook principal para detectar breakpoints e características do dispositivo.

```typescript
import { useResponsive } from '../hooks/useResponsive';

const MyComponent = () => {
  const { 
    currentBreakpoint, 
    isMobile, 
    isTablet, 
    isDesktop,
    windowSize 
  } = useResponsive();

  return (
    <div>
      <p>Breakpoint atual: {currentBreakpoint}</p>
      <p>É mobile: {isMobile ? 'Sim' : 'Não'}</p>
    </div>
  );
};
```

#### 2. `useDevice()`
Detecta características específicas do dispositivo.

```typescript
import { useDevice } from '../hooks/useResponsive';

const MyComponent = () => {
  const { isTouch, isLandscape } = useDevice();

  return (
    <div>
      {isTouch && <p>Dispositivo touch detectado</p>}
      {isLandscape && <p>Modo paisagem</p>}
    </div>
  );
};
```

#### 3. `useMediaQuery()`
Hook para queries CSS personalizadas.

```typescript
import { useMediaQuery } from '../hooks/useResponsive';

const MyComponent = () => {
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <div>
      {isDarkMode && <p>Modo escuro ativo</p>}
      {isReducedMotion && <p>Movimento reduzido</p>}
    </div>
  );
};
```

## 🎨 Componentes Responsivos

### ResponsiveLayout
Layout que se adapta automaticamente ao dispositivo.

```typescript
import ResponsiveLayout from '../components/ResponsiveLayout';

<ResponsiveLayout
  mobileLayout="stack"      // Layout para mobile
  tabletLayout="grid"       // Layout para tablet
  desktopLayout="grid"      // Layout para desktop
  columns={{
    mobile: 1,
    tablet: 2,
    desktop: 3
  }}
  spacing={{
    mobile: '1rem',
    tablet: '1.5rem',
    desktop: '2rem'
  }}
>
  <div>Conteúdo 1</div>
  <div>Conteúdo 2</div>
  <div>Conteúdo 3</div>
</ResponsiveLayout>
```

### ResponsiveContainer
Container que se adapta ao tamanho da tela.

```typescript
import { ResponsiveContainer } from '../components/ResponsiveLayout';

<ResponsiveContainer
  maxWidth={{
    mobile: '100%',
    tablet: '720px',
    desktop: '1200px'
  }}
  padding={{
    mobile: '1rem',
    tablet: '1.5rem',
    desktop: '2rem'
  }}
>
  <h1>Conteúdo Responsivo</h1>
</ResponsiveContainer>
```

### ResponsiveGrid
Grid que se adapta ao número de colunas.

```typescript
import { ResponsiveGrid } from '../components/ResponsiveLayout';

<ResponsiveGrid
  columns={{
    mobile: 1,
    tablet: 2,
    desktop: 4
  }}
  gap={{
    mobile: '1rem',
    tablet: '1.5rem',
    desktop: '2rem'
  }}
>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
  <div>Item 4</div>
</ResponsiveGrid>
```

### ResponsiveText
Texto que se adapta ao tamanho da fonte.

```typescript
import { ResponsiveText } from '../components/ResponsiveLayout';

<ResponsiveText
  size={{
    mobile: '0.875rem',
    tablet: '1rem',
    desktop: '1.125rem'
  }}
  weight={{
    mobile: '400',
    tablet: '500',
    desktop: '600'
  }}
>
  Texto que se adapta ao dispositivo
</ResponsiveText>
```

## 🎯 Classes CSS Responsivas

### Visibilidade Responsiva

```css
/* Visível apenas em mobile */
.hidden-xs { display: none; }
.block-xs { display: block; }

/* Visível apenas em tablet */
.hidden-sm { display: none; }
.block-sm { display: block; }

/* Visível apenas em desktop */
.hidden-md { display: none; }
.block-md { display: block; }

/* Visível apenas em large desktop */
.hidden-lg { display: none; }
.block-lg { display: block; }
```

### Grid Responsivo

```css
/* Grid que se adapta automaticamente */
.responsive-grid {
  display: grid;
  gap: var(--space-md);
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
```

### Spacing Responsivo

```css
/* Espaçamento que se adapta */
.p-mobile-0 { padding: 0; }
.p-mobile-1 { padding: var(--space-xs); }
.p-mobile-2 { padding: var(--space-sm); }
.p-mobile-3 { padding: var(--space-md); }

.m-mobile-0 { margin: 0; }
.m-mobile-1 { margin: var(--space-xs); }
.m-mobile-2 { margin: var(--space-sm); }
.m-mobile-3 { margin: var(--space-md); }
```

## 📱 Media Queries Avançadas

### Mobile First
```css
/* Base styles para mobile */
.component {
  padding: 1rem;
  font-size: 0.875rem;
}

/* Tablet */
@media (min-width: 768px) {
  .component {
    padding: 1.5rem;
    font-size: 1rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .component {
    padding: 2rem;
    font-size: 1.125rem;
  }
}
```

### Touch Devices
```css
/* Otimizações para touch */
@media (hover: none) and (pointer: coarse) {
  .btn {
    min-height: 44px;
    min-width: 44px;
  }
  
  /* Remove hover effects */
  .card:hover {
    transform: none;
  }
}
```

### High DPI Displays
```css
/* Otimização para telas Retina */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .logo {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}
```

### Reduced Motion
```css
/* Respeita preferência de movimento reduzido */
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    animation: none;
    transition: none;
  }
}
```

### Dark Mode
```css
/* Suporte a modo escuro */
@media (prefers-color-scheme: dark) {
  .component {
    background: #1a1a2e;
    color: #e2e8f0;
  }
}
```

## 🚀 Melhores Práticas

### 1. Mobile First
Sempre comece com estilos para mobile e depois adicione breakpoints maiores.

```css
/* ✅ Correto - Mobile First */
.component {
  padding: 1rem;
}

@media (min-width: 768px) {
  .component {
    padding: 1.5rem;
  }
}

/* ❌ Evite - Desktop First */
.component {
  padding: 2rem;
}

@media (max-width: 767px) {
  .component {
    padding: 1rem;
  }
}
```

### 2. Use Hooks para Lógica Complexa
Para lógica complexa de responsividade, use os hooks em vez de CSS puro.

```typescript
// ✅ Correto - Hook para lógica complexa
const MyComponent = () => {
  const { isMobile, isTablet } = useResponsive();
  
  const getColumns = () => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3;
  };

  return (
    <div style={{ gridTemplateColumns: `repeat(${getColumns()}, 1fr)` }}>
      {/* conteúdo */}
    </div>
  );
};
```

### 3. Teste em Diferentes Dispositivos
Sempre teste em diferentes tamanhos de tela e dispositivos.

### 4. Use Touch Targets Adequados
Em dispositivos touch, mantenha targets de pelo menos 44px.

```css
@media (hover: none) and (pointer: coarse) {
  .btn, .link, .interactive-element {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### 5. Otimize para Performance
Use `will-change` e `transform` para animações suaves.

```css
.animated-element {
  will-change: transform;
  transition: transform 0.3s ease;
}

.animated-element:hover {
  transform: translateY(-2px);
}
```

## 🔧 Ferramentas de Desenvolvimento

### Chrome DevTools
- Use o modo responsivo para testar diferentes breakpoints
- Teste touch events com o simulador de dispositivos
- Verifique performance com Lighthouse

### React DevTools
- Use o hook `useResponsive` para debug
- Monitore mudanças de breakpoint em tempo real

### CSS Grid Inspector
- Use as ferramentas de grid do Chrome para visualizar layouts
- Debug problemas de alinhamento e espaçamento

## 📚 Exemplos Práticos

Veja o componente `ResponsiveExample.tsx` para exemplos completos de implementação.

## 🎯 Próximos Passos

1. **PWA (Progressive Web App)**: Implementar funcionalidades offline
2. **App Mobile**: Considerar React Native para app nativo
3. **Acessibilidade**: Melhorar suporte a screen readers
4. **Performance**: Implementar lazy loading e code splitting

---

Este sistema de responsividade garante que a aplicação funcione perfeitamente em todos os dispositivos, desde smartphones até desktops de alta resolução.
