import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

interface Characteristic {
  id: number;
  name: string;
}

interface SelfAssessmentStepsProps {
  characteristics: Characteristic[];
  onSave: (selectedCharacteristics: number[]) => void;
  initialSelections?: Record<number, boolean>;
  isLoading?: boolean;
}

interface StepData {
  selectedCharacteristics: number[];
  availableCharacteristics: number[];
}

const SelfAssessmentSteps: React.FC<SelfAssessmentStepsProps> = ({
  characteristics,
  onSave,
  initialSelections = {},
  isLoading = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [stepData, setStepData] = useState<StepData>({
    selectedCharacteristics: [],
    availableCharacteristics: characteristics.map(c => c.id)
  });

  // Inicializar com dados existentes se disponíveis
  useEffect(() => {
    if (Object.keys(initialSelections).length > 0) {
      const selectedIds = Object.entries(initialSelections)
        .filter(([_, selected]) => selected)
        .map(([id, _]) => parseInt(id));
      
      setStepData({
        selectedCharacteristics: selectedIds,
        availableCharacteristics: characteristics.map(c => c.id)
      });
    }
  }, [initialSelections, characteristics]);

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Etapa 1: Seleção Inicial';
      case 2:
        return 'Etapa 2: Escolha 12 características';
      case 3:
        return 'Etapa 3: Reduza para 6 características';
      case 4:
        return 'Etapa 4: Escolha as 3 principais';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Escolha quantas características você deseja considerar. Não há limite mínimo ou máximo.';
      case 2:
        return `Das ${stepData.selectedCharacteristics.length} características selecionadas, escolha exatamente 12 que melhor descrevem você.`;
      case 3:
        return 'Das 12 características escolhidas, selecione as 6 mais importantes para você.';
      case 4:
        return 'Das 6 características restantes, escolha as 3 que mais representam quem você é.';
      default:
        return '';
    }
  };

  const getCurrentCharacteristics = () => {
    switch (currentStep) {
      case 1:
        return characteristics;
      case 2:
      case 3:
      case 4:
        return characteristics.filter(c => stepData.selectedCharacteristics.includes(c.id));
      default:
        return [];
    }
  };

  const getRequiredCount = () => {
    switch (currentStep) {
      case 1:
        return null; // Sem limite
      case 2:
        return 12;
      case 3:
        return 6;
      case 4:
        return 3;
      default:
        return null;
    }
  };

  const getCurrentSelections = () => {
    switch (currentStep) {
      case 1:
        return stepData.selectedCharacteristics;
      case 2:
      case 3:
      case 4:
        return stepData.selectedCharacteristics;
      default:
        return [];
    }
  };

  const handleCharacteristicToggle = (characteristicId: number) => {
    const currentSelections = getCurrentSelections();
    const requiredCount = getRequiredCount();

    if (currentStep === 1) {
      // Primeira etapa: sem limites
      setStepData(prev => ({
        ...prev,
        selectedCharacteristics: prev.selectedCharacteristics.includes(characteristicId)
          ? prev.selectedCharacteristics.filter(id => id !== characteristicId)
          : [...prev.selectedCharacteristics, characteristicId]
      }));
    } else {
      // Outras etapas: respeitar limite
      if (currentSelections.includes(characteristicId)) {
        // Desmarcar
        setStepData(prev => ({
          ...prev,
          selectedCharacteristics: prev.selectedCharacteristics.filter(id => id !== characteristicId)
        }));
      } else {
        // Marcar (se não exceder o limite)
        if (!requiredCount || currentSelections.length < requiredCount) {
          setStepData(prev => ({
            ...prev,
            selectedCharacteristics: [...prev.selectedCharacteristics, characteristicId]
          }));
        }
      }
    }
  };

  const canProceedToNextStep = () => {
    const currentSelections = getCurrentSelections();
    const requiredCount = getRequiredCount();

    if (currentStep === 1) {
      return currentSelections.length > 0;
    }

    return requiredCount ? currentSelections.length === requiredCount : true;
  };

  const handleNextStep = () => {
    if (currentStep < 4 && canProceedToNextStep()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    if (canProceedToNextStep()) {
      onSave(getCurrentSelections());
    }
  };

  const renderProgressBar = () => {
    const progress = (currentStep / 4) * 100;
    
    return (
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem'
        }}>
          {[1, 2, 3, 4].map(step => (
            <div
              key={step}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: step <= currentStep ? '#7c3aed' : 'rgba(124, 58, 237, 0.3)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: '600',
                border: step === currentStep ? '2px solid #c084fc' : 'none'
              }}
            >
              {step < currentStep ? <CheckCircle size={20} /> : step}
            </div>
          ))}
        </div>
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'rgba(124, 58, 237, 0.3)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: '#7c3aed',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
    );
  };

  const renderCharacteristicGrid = () => {
    const currentCharacteristics = getCurrentCharacteristics();
    const currentSelections = getCurrentSelections();
    const requiredCount = getRequiredCount();

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {currentCharacteristics.map((characteristic) => {
          const isSelected = currentSelections.includes(characteristic.id);
          const canSelect = !requiredCount || currentSelections.length < requiredCount || isSelected;

          return (
            <label
              key={characteristic.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '1rem',
                border: `1px solid ${isSelected ? '#7c3aed' : 'rgba(124, 58, 237, 0.3)'}`,
                borderRadius: '12px',
                backgroundColor: isSelected ? 'rgba(124, 58, 237, 0.1)' : 'rgba(17, 24, 39, 0.5)',
                cursor: canSelect ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                opacity: canSelect ? 1 : 0.5
              }}
              onMouseEnter={(e) => {
                if (canSelect) {
                  e.currentTarget.style.borderColor = '#7c3aed';
                  e.currentTarget.style.backgroundColor = isSelected 
                    ? 'rgba(124, 58, 237, 0.2)' 
                    : 'rgba(124, 58, 237, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (canSelect) {
                  e.currentTarget.style.borderColor = isSelected ? '#7c3aed' : 'rgba(124, 58, 237, 0.3)';
                  e.currentTarget.style.backgroundColor = isSelected 
                    ? 'rgba(124, 58, 237, 0.1)' 
                    : 'rgba(17, 24, 39, 0.5)';
                }
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCharacteristicToggle(characteristic.id)}
                disabled={!canSelect}
                style={{
                  marginTop: '2px',
                  height: '16px',
                  width: '16px',
                  accentColor: '#7c3aed',
                  cursor: canSelect ? 'pointer' : 'not-allowed'
                }}
              />
              <span style={{
                fontSize: '0.875rem',
                color: 'white',
                lineHeight: '1.4'
              }}>
                {characteristic.name}
              </span>
            </label>
          );
        })}
      </div>
    );
  };

  const renderSelectionInfo = () => {
    const currentSelections = getCurrentSelections();
    const requiredCount = getRequiredCount();

    if (currentStep === 1) {
      return (
        <div style={{
          padding: '1rem',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: '10px',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={20} color="#c084fc" />
            <span style={{ color: '#c084fc', fontSize: '0.875rem' }}>
              Você selecionou {currentSelections.length} características
            </span>
          </div>
        </div>
      );
    }

    return (
      <div style={{
        padding: '1rem',
        backgroundColor: requiredCount && currentSelections.length === requiredCount 
          ? 'rgba(34, 197, 94, 0.1)' 
          : 'rgba(124, 58, 237, 0.1)',
        border: `1px solid ${requiredCount && currentSelections.length === requiredCount 
          ? 'rgba(34, 197, 94, 0.3)' 
          : 'rgba(124, 58, 237, 0.3)'}`,
        borderRadius: '10px',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {requiredCount && currentSelections.length === requiredCount ? (
            <CheckCircle size={20} color="#86efac" />
          ) : (
            <AlertCircle size={20} color="#c084fc" />
          )}
          <span style={{ 
            color: requiredCount && currentSelections.length === requiredCount ? '#86efac' : '#c084fc',
            fontSize: '0.875rem' 
          }}>
            {currentSelections.length} de {requiredCount} características selecionadas
          </span>
        </div>
      </div>
    );
  };

  const renderNavigationButtons = () => {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={handlePreviousStep}
          disabled={currentStep === 1}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            backgroundColor: currentStep === 1 ? 'rgba(55, 65, 81, 0.3)' : 'rgba(55, 65, 81, 0.5)',
            color: currentStep === 1 ? '#6b7280' : '#9ca3af',
            border: '1px solid rgba(55, 65, 81, 0.3)',
            borderRadius: '10px',
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
          Etapa {currentStep} de 4
        </div>

        {currentStep < 4 ? (
          <button
            onClick={handleNextStep}
            disabled={!canProceedToNextStep()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: !canProceedToNextStep() ? 'rgba(124, 58, 237, 0.3)' : 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: !canProceedToNextStep() ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            Próximo
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={!canProceedToNextStep() || isLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: !canProceedToNextStep() || isLoading ? 'rgba(124, 58, 237, 0.3)' : 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: !canProceedToNextStep() || isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Finalizando...
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Finalizar Autoavaliação
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: 'rgba(17, 24, 39, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '20px',
      border: '1px solid rgba(124, 58, 237, 0.3)',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '600',
          color: 'white',
          marginBottom: '0.5rem'
        }}>
          {getStepTitle()}
        </h3>
        <p style={{
          color: '#9ca3af',
          fontSize: '0.875rem',
          marginBottom: '1rem'
        }}>
          {getStepDescription()}
        </p>
        
        {renderProgressBar()}
      </div>

      {/* Selection Info */}
      {renderSelectionInfo()}

      {/* Characteristics Grid */}
      {renderCharacteristicGrid()}

      {/* Navigation */}
      {renderNavigationButtons()}
    </div>
  );
};

export default SelfAssessmentSteps;
