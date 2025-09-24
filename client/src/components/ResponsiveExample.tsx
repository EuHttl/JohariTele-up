import React from 'react';
import { useResponsive, useDevice, useMediaQuery } from '../hooks/useResponsive';
import ResponsiveLayout, { ResponsiveContainer, ResponsiveGrid, ResponsiveText } from './ResponsiveLayout';

const ResponsiveExample: React.FC = () => {
  const { currentBreakpoint, isMobile, isTablet, isDesktop } = useResponsive();
  const { isTouch } = useDevice();
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  return (
    <ResponsiveContainer>
      <div className="responsive-example">
        <ResponsiveText
          size={{ mobile: '1.5rem', tablet: '2rem', desktop: '2.5rem' }}
          weight={{ mobile: '600', tablet: '700', desktop: '800' }}
          className="example-title"
        >
          Responsividade Avançada
        </ResponsiveText>

        <ResponsiveText
          size={{ mobile: '0.875rem', tablet: '1rem', desktop: '1.125rem' }}
          className="example-subtitle"
        >
          Demonstração do sistema de responsividade implementado
        </ResponsiveText>

        {/* Device Information */}
        <div className="device-info">
          <h3>Informações do Dispositivo</h3>
          <div className="info-grid">
            <div className="info-item">
              <strong>Breakpoint Atual:</strong> {currentBreakpoint}
            </div>
            <div className="info-item">
              <strong>Mobile:</strong> {isMobile ? 'Sim' : 'Não'}
            </div>
            <div className="info-item">
              <strong>Tablet:</strong> {isTablet ? 'Sim' : 'Não'}
            </div>
            <div className="info-item">
              <strong>Desktop:</strong> {isDesktop ? 'Sim' : 'Não'}
            </div>
            <div className="info-item">
              <strong>Touch:</strong> {isTouch ? 'Sim' : 'Não'}
            </div>
            <div className="info-item">
              <strong>Dark Mode:</strong> {isDarkMode ? 'Sim' : 'Não'}
            </div>
          </div>
        </div>

        {/* Responsive Grid Example */}
        <div className="grid-example">
          <h3>Grid Responsivo</h3>
          <ResponsiveGrid
            columns={{ mobile: 1, tablet: 2, desktop: 3 }}
            gap={{ mobile: '1rem', tablet: '1.5rem', desktop: '2rem' }}
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="grid-item">
                <h4>Item {item}</h4>
                <p>Conteúdo do item {item} que se adapta ao tamanho da tela.</p>
              </div>
            ))}
          </ResponsiveGrid>
        </div>

        {/* Responsive Layout Example */}
        <div className="layout-example">
          <h3>Layout Responsivo</h3>
          <ResponsiveLayout
            mobileLayout="stack"
            tabletLayout="grid"
            desktopLayout="grid"
            columns={{ mobile: 1, tablet: 2, desktop: 3 }}
            spacing={{ mobile: '1rem', tablet: '1.5rem', desktop: '2rem' }}
            padding={{ mobile: '1rem', tablet: '1.5rem', desktop: '2rem' }}
          >
            <div className="layout-item">
              <h4>Card 1</h4>
              <p>Este card se adapta ao layout responsivo.</p>
            </div>
            <div className="layout-item">
              <h4>Card 2</h4>
              <p>Layout muda de stack para grid conforme o dispositivo.</p>
            </div>
            <div className="layout-item">
              <h4>Card 3</h4>
              <p>Espaçamento e padding se ajustam automaticamente.</p>
            </div>
          </ResponsiveLayout>
        </div>

        {/* Responsive Text Example */}
        <div className="text-example">
          <h3>Texto Responsivo</h3>
          <div className="text-samples">
            <ResponsiveText
              size={{ mobile: '0.75rem', tablet: '0.875rem', desktop: '1rem' }}
              weight={{ mobile: '400', tablet: '500', desktop: '600' }}
            >
              Texto pequeno que cresce conforme o dispositivo
            </ResponsiveText>
            
            <ResponsiveText
              size={{ mobile: '1rem', tablet: '1.25rem', desktop: '1.5rem' }}
              weight={{ mobile: '500', tablet: '600', desktop: '700' }}
            >
              Texto médio com peso de fonte responsivo
            </ResponsiveText>
            
            <ResponsiveText
              size={{ mobile: '1.25rem', tablet: '1.5rem', desktop: '2rem' }}
              weight={{ mobile: '600', tablet: '700', desktop: '800' }}
            >
              Texto grande para títulos importantes
            </ResponsiveText>
          </div>
        </div>

        {/* CSS Classes Example */}
        <div className="css-classes-example">
          <h3>Classes CSS Responsivas</h3>
          <div className="classes-demo">
            <div className="hidden-xs block-sm block-md block-lg">
              Visível apenas em telas pequenas e maiores
            </div>
            <div className="hidden-sm block-xs block-md block-lg">
              Visível em telas extra pequenas e médias/grandes
            </div>
            <div className="hidden-md block-xs block-sm block-lg">
              Visível em telas pequenas e grandes
            </div>
            <div className="hidden-lg block-xs block-sm block-md">
              Visível apenas em telas pequenas e médias
            </div>
          </div>
        </div>

        {/* Touch Optimizations */}
        {isTouch && (
          <div className="touch-optimizations">
            <h3>Otimizações para Touch</h3>
            <p>Este conteúdo só aparece em dispositivos touch.</p>
            <div className="touch-buttons">
              <button className="btn btn-primary">Botão Touch</button>
              <button className="btn btn-secondary">Outro Botão</button>
            </div>
          </div>
        )}

        {/* Dark Mode Example */}
        {isDarkMode && (
          <div className="dark-mode-example">
            <h3>Modo Escuro Detectado</h3>
            <p>O sistema detectou que você prefere o modo escuro.</p>
          </div>
        )}
      </div>
    </ResponsiveContainer>
  );
};

export default ResponsiveExample;
