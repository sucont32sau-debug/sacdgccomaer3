import * as fs from 'fs';

let content = fs.readFileSync('src/lib/gemini.ts', 'utf8');

const promptReplacement = `O processamento será feito simultaneamente em 2 níveis:
Nível 1 - Análise Individual: Avaliação da UG isoladamente (evolução, tendências, inconsistências, alertas).
Nível 2 - Análise Comparativa com o Grupo: Comparação da UG com as demais do seu grupo institucional, priorizando Organizações Militares de natureza semelhante e observando padrões normais de execução. A comparação com o grupo deverá ocorrer apenas no seu raciocínio interno, servindo como referência para enriquecer as conclusões. Módulo interno comparando comportamentos e identificando desvios.

- A análise principal deve ser apresentada APENAS para a UG foco dos dados principais. A estruturação de saída não deve criar painéis extras para o grupo.
- ESTRUTURA PAINEL 1: linear e verticalizada. Cada linha representa um lançamento individual de custo e um fator de custo específico. O Sistema Estruturante e a UG Beneficiada se repetem nas linhas. Você DEVE OBRIGATORIAMENTE agrupar mentalmente e consolidar todas as linhas pertencentes ao mesmo Sistema Organizacional.
- ESTRUTURA PAINEL 2: linear simplificada. A coluna "DetaCusto DH — R$" NO PAINEL 2 NÃO REPRESENTA VALOR FINANCEIRO (DINHEIRO). Ela representa QUANTITATIVO DE MILITARES vinculados ao Sistema Organizacional.
- ESTRUTURA PAINEL 3: linear e verticalizada. Cada linha associa uma Natureza de Despesa Detalhada (NDD) a um Sistema Organizacional. Agrupe Naturezas de Despesa e Sistemas.
- ESTRUTURA PAINEL 4: linear e histórica. Séries temporais para Itens de Custo. Agrupe registros e identifique oscilações bruscas.
- PROCESSAMENTO EM LOTE E ESTRUTURAS BAGUNÇADAS: Ignore cabeçalhos repetidos e fragilidades visuais.
- EXPLICAÇÃO DIDÁTICA: Explique QUAIS foram os achados e O QUE SIGNIFICAM na prática.

A plataforma deve identificar automaticamente: Código da UG, Nome da UG, Ano de referência, Mês de referência.

REFERENCIAL NORMATIVO E METODOLÓGICO:
Sua análise deverá utilizar como referencial teórico, conceitual e operacional os normativos internos do COMAER:
- Módulo 19 – Apropriação de Custos;
- Módulo 22 – Extração de Dados do Tesouro Gerencial.

Você deverá considerar que o modelo de custos do COMAER está estruturado com base nos Sistemas Organizacionais e Estruturantes, utilizando Subcentros de Custos no formato XX.YY.ZZ (XX = Sistema, YY = Atividade, ZZ = Fator). Avalie se a apropriação dos custos é compatível com a estrutura definida pelo COMAER, com a missão da OM, com o sistema ao qual o recurso foi vinculado e com a atividade desempenhada, baseando as conclusões em evidências, coerência sistêmica e rastreabilidade dos lançamentos.`;

const originalPromptPart = `O processamento será feito simultaneamente em 2 níveis:
Nível 1 - Análise Individual: Avaliação da UG isoladamente (evolução, tendências, inconsistências, alertas).
Nível 2 - Análise Comparativa com o Grupo: Comparação da UG com as demais do seu grupo institucional (identificar comportamentos fora da curva, boas práticas, desvios e padrões). A comparação com o grupo deverá ocorrer apenas no seu raciocínio interno, servindo como referência para enriquecer as conclusões, alertas, diagnósticos e recomendações nos textos gerados. Sempre responda (dentro da análise dos painéis): Esta UG apresenta comportamento semelhante às demais? Está acima/abaixo da média? Há anomalias ou boas práticas?

DIRETRIZES GERAIS E ESTRUTURA DA BASE DE DADOS:
- A análise principal deve ser apresentada APENAS para a UG foco dos dados principais. A estruturação de saída não deve criar painéis extras para o grupo.
- ESTRUTURA PAINEL 1: linear e verticalizada. Cada linha representa um lançamento individual de custo e um fator de custo específico. O Sistema Estruturante e a UG Beneficiada se repetem nas linhas. Você DEVE OBRIGATORIAMENTE agrupar mentalmente e consolidar todas as linhas pertencentes ao mesmo Sistema Organizacional.
- ESTRUTURA PAINEL 2: linear simplificada. A coluna "DetaCusto DH — R$" NO PAINEL 2 NÃO REPRESENTA VALOR FINANCEIRO (DINHEIRO). Ela representa QUANTITATIVO DE MILITARES vinculados ao Sistema Organizacional.
- ESTRUTURA PAINEL 3: linear e verticalizada. Cada linha associa uma Natureza de Despesa Detalhada (NDD) a um Sistema Organizacional. Agrupe Naturezas de Despesa e Sistemas.
- ESTRUTURA PAINEL 4: linear e histórica. Séries temporais para Itens de Custo. Agrupe registros e identifique oscilações bruscas.
- PROCESSAMENTO EM LOTE E ESTRUTURAS BAGUNÇADAS: Ignore cabeçalhos repetidos e fragilidades visuais.
- EXPLICAÇÃO DIDÁTICA: Explique QUAIS foram os achados e O QUE SIGNIFICAM na prática.

A plataforma deve identificar automaticamente: Código da UG, Nome da UG, Ano de referência, Mês de referência.`;

content = content.replace(originalPromptPart.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&'), promptReplacement);

const originalAnalysisLogic = `Dessa forma:
1. ANÁLISE INTERNA PAINEL 1 (Distribuição dos Custos): Raciocínio sobre apropriação e coerência institucional, verificações de GAPs, etc.
2. ANÁLISE INTERNA PAINEL 2 (Comportamento Temporal): Raciocínio sobre a força de trabalho militar e suas tendências/erros.
3. ANÁLISE INTERNA PAINEL 3 (Comparação Institucional): Raciocínio cruzando NDDs e o comportamento médio do grupo da UG.
4. ANÁLISE INTERNA PAINEL 4 (Consistência Contábil): Raciocínio sobre séries históricas, ausência de contratos, picos.

Toda inconsistência, desvio, anomalia, oportunidade de melhoria ou comportamento relevante identificado pelos módulos internos deve ser convertido automaticamente em um Alerta de Criticidade na matriz alertasDeCriticidade.
Os alertas devem ser objetivos, curtos e orientados à tomada de decisão.
Cada alerta no array deve ser um objeto com:
- titulo
- origemAnalise (array com as origens: "Painel 1 – Distribuição dos Custos", "Painel 2 – Comportamento Temporal", "Painel 3 – Comparação Institucional", "Painel 4 – Consistência Contábil")
- evidencia
- impacto
- acaoRecomendada`;

const newAnalysisLogic = `Dessa forma:
1. ANÁLISE INTERNA PAINEL 1 (Distribuição dos Custos): Raciocínio sobre apropriação e coerência institucional, verificações de GAPs, adequação ao formato XX.YY.ZZ, etc.
2. ANÁLISE INTERNA PAINEL 2 (Comportamento Temporal): Raciocínio sobre a força de trabalho militar e suas tendências/erros.
3. ANÁLISE INTERNA PAINEL 3 (Comparação Institucional): Raciocínio cruzando NDDs, Subcentros de Custo e o comportamento médio do grupo.
4. ANÁLISE INTERNA PAINEL 4 (Consistência Contábil): Raciocínio sobre séries históricas, ausência de apropriações esperadas, divergências entre fatores de custo.

Toda inconsistência, desvio, anomalia, oportunidade de melhoria ou comportamento relevante identificado pelos módulos internos deve ser convertido automaticamente em um Alerta de Criticidade na matriz alertasDeCriticidade.
Para a geração de Alertas de Criticidade, considere estritamente as diretrizes do Módulo 19 e Módulo 22:
- Apropriações incompatíveis com o Sistema Organizacional ou Estruturante informado;
- Utilização inadequada de Subcentros de Custos (XX.YY.ZZ);
- Concentração atípica de recursos em determinadas atividades;
- Ausência de apropriações esperadas para determinado sistema;
- Divergências entre custos de pessoal, materiais, serviços, depreciação e amortização;
- Inconsistências entre o setor beneficiado e o subcentro utilizado;
- Possíveis distorções na representação dos custos institucionais (baseado em normais de Execução e Demonstrativo Gerencial de Custos DGC).

Os alertas devem ser objetivos, curtos e orientados à tomada de decisão.
Cada alerta no array deve ser um objeto com:
- titulo
- origemAnalise (array com as origens: "Painel 1 – Distribuição dos Custos", "Painel 2 – Comportamento Temporal", "Painel 3 – Comparação Institucional", "Painel 4 – Consistência Contábil")
- evidencia
- impacto
- acaoRecomendada`;

content = content.replace(originalAnalysisLogic.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&'), newAnalysisLogic);

fs.writeFileSync('src/lib/gemini.ts', content);
