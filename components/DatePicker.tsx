'use client';

import { useState, useRef, useEffect } from 'react';

const MESES_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DIAS_SEMANA_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatarParaExibicao(value: string): string {
  if (!value) return '';
  const [y, m, d] = value.split('-').map(Number);
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return value;
  const dia = String(d).padStart(2, '0');
  const mes = String(m).padStart(2, '0');
  return `${dia}/${mes}/${y}`;
}

function gerarDiasDoMes(ano: number, mes: number): (number | null)[] {
  const primeiro = new Date(ano, mes, 1);
  const ultimo = new Date(ano, mes + 1, 0);
  const diaSemanaInicio = primeiro.getDay();
  const totalDias = ultimo.getDate();
  const linhas: (number | null)[] = [];
  for (let i = 0; i < diaSemanaInicio; i++) linhas.push(null);
  for (let d = 1; d <= totalDias; d++) linhas.push(d);
  return linhas;
}

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  label?: string;
  title?: string;
  placeholder?: string;
  className?: string;
};

export function DatePicker({ value, onChange, id, label, title, placeholder = 'Selecione a data', className = '' }: DatePickerProps) {
  const [aberto, setAberto] = useState(false);
  const [mesAtual, setMesAtual] = useState(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      if (!Number.isNaN(y) && !Number.isNaN(m)) return { ano: y, mes: m - 1 };
    }
    const hoje = new Date();
    return { ano: hoje.getFullYear(), mes: hoje.getMonth() };
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setAberto(false);
      }
    };
    const ajustarPosicao = () => {
      if (!containerRef.current || !popoverRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const popover = popoverRef.current;
      
      // Usar fixed positioning (relativo à viewport, não precisa de scroll offset)
      popover.style.position = 'fixed';
      popover.style.top = `${rect.bottom + 8}px`;
      popover.style.left = `${rect.left}px`;
      
      // Aguardar renderização para calcular dimensões corretas
      requestAnimationFrame(() => {
        if (!popoverRef.current) return;
        const popoverRect = popoverRef.current.getBoundingClientRect();
        
        // Ajustar se sair da tela à direita
        if (popoverRect.right > window.innerWidth) {
          popoverRef.current.style.left = `${window.innerWidth - popoverRect.width - 16}px`;
        }
        
        // Ajustar se sair da tela à esquerda
        if (popoverRect.left < 0) {
          popoverRef.current.style.left = '16px';
        }
        
        // Ajustar se sair da tela embaixo (mostrar acima)
        if (popoverRect.bottom > window.innerHeight) {
          const alturaPopover = popoverRect.height;
          popoverRef.current.style.top = `${rect.top - alturaPopover - 8}px`;
        }
      });
    };
    
    ajustarPosicao();
    window.addEventListener('resize', ajustarPosicao);
    window.addEventListener('scroll', ajustarPosicao, true);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', ajustarPosicao);
      window.removeEventListener('scroll', ajustarPosicao, true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [aberto]);

  useEffect(() => {
    if (value && aberto) {
      const [y, m] = value.split('-').map(Number);
      if (!Number.isNaN(y) && !Number.isNaN(m)) setMesAtual({ ano: y, mes: m - 1 });
    }
  }, [value, aberto]);

  const dias = gerarDiasDoMes(mesAtual.ano, mesAtual.mes);
  const hoje = new Date();
  const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

  const selecionarDia = (dia: number) => {
    const valor = `${mesAtual.ano}-${String(mesAtual.mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    onChange(valor);
    setAberto(false);
  };

  const anterior = () => {
    if (mesAtual.mes === 0) setMesAtual({ ano: mesAtual.ano - 1, mes: 11 });
    else setMesAtual({ ano: mesAtual.ano, mes: mesAtual.mes - 1 });
  };

  const proximo = () => {
    if (mesAtual.mes === 11) setMesAtual({ ano: mesAtual.ano + 1, mes: 0 });
    else setMesAtual({ ano: mesAtual.ano, mes: mesAtual.mes + 1 });
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-slate-400 mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        id={id}
        title={title}
        onClick={() => setAberto((o) => !o)}
        className="w-full rounded-lg bg-slate-700/50 border border-slate-600 text-white px-3 py-2 text-sm text-left focus:ring-2 focus:ring-sky-500 focus:border-transparent hover:border-slate-500 transition-colors flex items-center justify-between gap-2"
      >
        <span className={value ? '' : 'text-slate-500'}>{value ? formatarParaExibicao(value) : placeholder}</span>
        <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {aberto && (
        <div
          ref={popoverRef}
          className="fixed z-[9999] min-w-[280px] rounded-xl border border-slate-600 bg-slate-800 shadow-2xl overflow-hidden"
          role="dialog"
          aria-label="Calendário"
        >
          <div className="p-3 border-b border-slate-700 flex items-center justify-between">
            <button
              type="button"
              onClick={anterior}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Mês anterior"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-white font-semibold text-sm">
              {MESES_PT[mesAtual.mes]} {mesAtual.ano}
            </span>
            <button
              type="button"
              onClick={proximo}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              aria-label="Próximo mês"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="p-3">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DIAS_SEMANA_PT.map((d) => (
                <div key={d} className="text-center text-slate-500 text-xs font-medium py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {dias.map((dia, i) => {
                if (dia === null) return <div key={`e-${i}`} />;
                const valorDia = `${mesAtual.ano}-${String(mesAtual.mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
                const selecionado = value === valorDia;
                const ehHoje = hojeStr === valorDia;
                return (
                  <button
                    key={valorDia}
                    type="button"
                    onClick={() => selecionarDia(dia)}
                    className={`
                      w-8 h-8 rounded-lg text-sm font-medium transition-colors
                      ${selecionado ? 'bg-sky-500 text-white hover:bg-sky-600' : ''}
                      ${!selecionado && ehHoje ? 'bg-slate-600 text-white hover:bg-slate-500' : ''}
                      ${!selecionado && !ehHoje ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : ''}
                    `}
                  >
                    {dia}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
