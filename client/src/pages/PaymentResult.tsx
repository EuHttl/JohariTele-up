import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { subscriptionService } from '../services/subscriptionService';
import '../styles/payment-result.css';

const PaymentResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    checkPaymentStatus();
  }, []);

  const checkPaymentStatus = async () => {
    try {
      setLoading(true);
      
      // Aguardar um pouco para o webhook processar
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const billingInfo = await subscriptionService.getCurrentSubscription();
      setSubscription(billingInfo);
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error);
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = searchParams.get('success') === 'true';
  const isCanceled = searchParams.get('canceled') === 'true';

  if (loading) {
    return (
      <div className="payment-result loading">
        <div className="payment-result-container">
          <Loader className="w-12 h-12 animate-spin text-purple-600" />
          <h2>Processando pagamento...</h2>
          <p>Aguarde enquanto confirmamos seu pagamento.</p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="payment-result success">
        <div className="payment-result-container">
          <CheckCircle className="w-16 h-16 text-green-500" />
          <h1>Pagamento Aprovado!</h1>
          <p>Sua assinatura foi ativada com sucesso.</p>
          
          {subscription?.subscription && (
            <div className="subscription-details">
              <h3>Detalhes da Assinatura</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="label">Plano:</span>
                  <span className="value">{subscription.subscription.plan?.name}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Ciclo:</span>
                  <span className="value">
                    {subscription.subscription.billing_cycle === 'monthly' ? 'Mensal' : 'Anual'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Status:</span>
                  <span className="value status active">Ativo</span>
                </div>
                {subscription.subscription.expires_at && (
                  <div className="detail-item">
                    <span className="label">Próximo pagamento:</span>
                    <span className="value">
                      {new Date(subscription.subscription.expires_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="action-buttons">
            <button 
              onClick={() => navigate('/app/usage')}
              className="btn primary"
            >
              Ver Uso da Assinatura
            </button>
            <button 
              onClick={() => navigate('/app/dashboard')}
              className="btn secondary"
            >
              Ir para Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isCanceled) {
    return (
      <div className="payment-result canceled">
        <div className="payment-result-container">
          <XCircle className="w-16 h-16 text-red-500" />
          <h1>Pagamento Cancelado</h1>
          <p>Você cancelou o processo de pagamento.</p>
          <p>Nenhuma cobrança foi realizada.</p>
          
          <div className="action-buttons">
            <button 
              onClick={() => navigate('/app/plans')}
              className="btn primary"
            >
              Escolher Plano Novamente
            </button>
            <button 
              onClick={() => navigate('/app/dashboard')}
              className="btn secondary"
            >
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Caso padrão - redirecionar para planos
  useEffect(() => {
    navigate('/app/plans');
  }, [navigate]);

  return null;
};

export default PaymentResult;
