export interface ChecklistItem {
  id: number;
  pergunta: string;
  resposta: 'SIM' | 'NÃO';
  fundamentacaoTecnica: string;
  evidenciasEncontradas: string[];
  impactoPotencial: string;
  recomendacao: string;
}

export interface ChecklistAEC {
  indicadores: {
    total: number;
    comApontamento: number;
    semApontamento: number;
  };
  perguntas: ChecklistItem[];
}

export interface AlertaCriticidade {
  titulo: string;
  origemAnalise: string[];
  evidencia: string;
  impacto: string;
  acaoRecomendada: string;
}

export interface DgcData {
  identificacao: {
    codigoUg: string;
    nomeUg: string;
    anoReferencia: string;
    mesReferencia: string;
  };
  analisePainel1: string;
  analisePainel2: string;
  analisePainel3: string;
  analisePainel4: string;
  alertasDeCriticidade: AlertaCriticidade[];
  checklistAec: ChecklistAEC;
  feedbackUG: string;
}
