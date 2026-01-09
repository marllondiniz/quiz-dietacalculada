'use client';

import { useState, useCallback, ButtonHTMLAttributes } from 'react';

interface SafeNavigationButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  cooldownMs?: number; // Tempo em ms para bloquear novos cliques (padrão: 800ms)
}

/**
 * Botão com proteção contra duplo clique
 * Previne navegação duplicada ao bloquear cliques consecutivos rápidos
 */
export default function SafeNavigationButton({
  children,
  onClick,
  disabled = false,
  className = '',
  cooldownMs = 800,
  ...restProps
}: SafeNavigationButtonProps) {
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = useCallback(() => {
    // Se já estiver navegando ou o botão estiver desabilitado, ignorar
    if (isNavigating || disabled) {
      console.log('⚠️ Clique ignorado - navegação em andamento ou botão desabilitado');
      return;
    }

    // Bloquear novos cliques
    setIsNavigating(true);
    console.log('🔒 Navegação iniciada - bloqueando novos cliques');

    // Executar a ação
    onClick();

    // Liberar após o cooldown
    setTimeout(() => {
      setIsNavigating(false);
      console.log('🔓 Cooldown finalizado - botão liberado');
    }, cooldownMs);
  }, [isNavigating, disabled, onClick, cooldownMs]);

  return (
    <button
      {...restProps}
      onClick={handleClick}
      disabled={disabled || isNavigating}
      className={className}
      aria-busy={isNavigating}
    >
      {children}
    </button>
  );
}

