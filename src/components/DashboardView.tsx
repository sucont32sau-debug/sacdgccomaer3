import React from 'react';
import Markdown from 'react-markdown';
import { DgcData } from '../types';
import { ShieldCheck, BookOpen, Layers, BarChart3, AlertTriangle, Lightbulb, Target, Activity, FileCheck, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { UGS_LIST } from '../lib/ugs';

interface DashboardViewProps {
  data: DgcData;
}

export function DashboardView({ data }: DashboardViewProps) {
  const [activeTab, setActiveTab] = React.useState<'alertas' | 'aec' | 'feedback'>('alertas');
  const [aecFilter, setAecFilter] = React.useState<'Todos' | 'SIM' | 'NÃO'>('Todos');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 w-full max-w-[1200px] mx-auto">
      
      {/* HEADER INSTITUCIONAL FAB/DIREF */}
      <div className="bg-white border text-center border-slate-200 rounded-lg p-10 shadow-sm relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
           <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
             <path d="M12 2L22 20H2L12 2Z" />
             <path d="M12 6L18.5 17H5.5L12 6Z" fill="white" />
           </svg>
        </div>
        
        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-[#15294E]/5 border border-[#15294E]/10 text-[#15294E] text-xs font-bold tracking-[0.2em] uppercase">
          <FileCheck className="w-4 h-4 text-blue-600" /> Relatório de Análise Institucional
        </div>
        
        <h2 className="text-4xl font-extrabold text-[#15294E] mb-3 tracking-tight">
          {(() => {
             // Tenta buscar o nome real da UG na lista oficial pelo código
             const ugReal = UGS_LIST.find(ug => ug.startsWith(data.identificacao.codigoUg));
             if (ugReal) {
               return ugReal; // Já vem no formato "CODIGO - NOME"
             }
             // Fallback caso não encontre na lista
             const nomeFallback = data.identificacao.nomeUg.split('(')[0].trim();
             return `${data.identificacao.codigoUg} - ${nomeFallback}`;
          })()}
        </h2>
        
        <div className="flex items-center justify-center gap-3 text-slate-500 font-medium">
          <span className="bg-slate-100 px-3 py-1 rounded text-sm">Competência: {data.identificacao.mesReferencia} / {data.identificacao.anoReferencia}</span>
          <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm border border-blue-100 font-semibold">Fonte: SAC-DGC</span>
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={() => setActiveTab('alertas')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${
            activeTab === 'alertas'
              ? 'bg-red-600 text-white shadow-md shadow-red-200'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Alertas de Criticidade
        </button>
        <button
          onClick={() => setActiveTab('aec')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${
            activeTab === 'aec'
              ? 'bg-[#15294E] text-white shadow-md shadow-slate-200'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" />
          Checklist AEC
        </button>
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all ${
            activeTab === 'feedback'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" /> {/* Use MessageCircle or something; but I only know lucide-react has common icons. We can just use the clipboard one if not or omit */}
          Feedback à Unidade Gestora
        </button>
      </div>

      {/* CONTENT AREA */}
      <div>
        {activeTab === 'alertas' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {data.alertasDeCriticidade && data.alertasDeCriticidade.length > 0 ? (
              <div className="bg-white border-2 border-red-100 rounded-xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500" />
                <h3 className="text-xl font-extrabold text-red-800 mb-6 flex items-center gap-3 uppercase tracking-wider">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  Alertas de Criticidade
                </h3>
                <div className="space-y-6">
                  {data.alertasDeCriticidade.map((alerta, index) => (
                    <div key={index} className="bg-red-50/30 border border-red-100 rounded-xl p-6">
                      <h4 className="text-lg font-bold text-red-800 mb-3">{alerta.titulo}</h4>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {alerta.origemAnalise && alerta.origemAnalise.map((origem, i) => (
                          <span key={i} className="px-3 py-1 bg-white text-slate-600 rounded-full text-xs font-bold border border-slate-200 flex items-center gap-1.5">
                            <Layers className="w-3 h-3" /> {origem}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                         <div>
                            <div className="font-bold text-slate-700 uppercase text-xs mb-1">Evidência / Justificativa</div>
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{alerta.evidencia}</p>
                         </div>
                         <div>
                            <div className="font-bold text-slate-700 uppercase text-xs mb-1">Impacto Potencial</div>
                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{alerta.impacto}</p>
                         </div>
                      </div>

                      <div className="mt-5 bg-red-50 p-4 rounded-lg border border-red-100">
                         <div className="font-bold text-red-900 uppercase text-xs mb-1 flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5" /> Ação Recomendada
                         </div>
                         <p className="text-red-800 text-sm leading-relaxed font-medium whitespace-pre-wrap">{alerta.acaoRecomendada}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-green-200 rounded-xl p-12 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-extrabold text-green-800 mb-2">Monitoramento Regular</h3>
                <p className="text-slate-500 max-w-md">Não foram identificados alertas críticos para esta Unidade Gestora neste período.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'aec' && data.checklistAec && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="bg-white border text-center border-slate-200 rounded-lg p-10 shadow-sm relative overflow-hidden">
               <h3 className="text-xl font-extrabold text-[#15294E] mb-6 inline-flex border-b border-[#15294E]/10 pb-4 uppercase tracking-wider">
                  Checklist de Conformidade Institucional (AEC)
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">
                    <div className="text-4xl font-black text-slate-800 mb-1">{data.checklistAec.indicadores.total}</div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Itens Avaliados</div>
                  </div>
                  <div 
                    onClick={() => setAecFilter(aecFilter === 'NÃO' ? 'Todos' : 'NÃO')}
                    className={`bg-green-50 p-6 rounded-xl border border-green-200 shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-green-100 ${aecFilter === 'NÃO' ? 'ring-2 ring-green-500' : ''}`}
                  >
                    <div className="text-4xl font-black text-green-700 mb-1">{data.checklistAec.indicadores.semApontamento}</div>
                    <div className="text-xs font-bold text-green-600 uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4"/> Sem Apontamento (NÃO)</div>
                  </div>
                  <div 
                    onClick={() => setAecFilter(aecFilter === 'SIM' ? 'Todos' : 'SIM')}
                    className={`bg-red-50 p-6 rounded-xl border border-red-200 shadow-sm flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-red-100 ${aecFilter === 'SIM' ? 'ring-2 ring-red-500' : ''}`}
                  >
                     <div className="text-4xl font-black text-red-600 mb-1">{data.checklistAec.indicadores.comApontamento}</div>
                     <div className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5"><AlertTriangle className="w-4 h-4"/> Com Apontamento (SIM)</div>
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
               <span className="text-sm font-semibold text-slate-600 mr-2 ml-2">Filtrar:</span>
               <button
                 onClick={() => setAecFilter('Todos')}
                 className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                   aecFilter === 'Todos'
                     ? 'bg-slate-800 text-white shadow-md'
                     : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                 }`}
               >
                 Todos
               </button>
               <button
                 onClick={() => setAecFilter('NÃO')}
                 className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                   aecFilter === 'NÃO'
                     ? 'bg-green-600 text-white shadow-md shadow-green-200'
                     : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                 }`}
               >
                 <CheckCircle2 className="w-3.5 h-3.5" />
                 Sem Apontamento (NÃO)
               </button>
               <button
                 onClick={() => setAecFilter('SIM')}
                 className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                   aecFilter === 'SIM'
                     ? 'bg-red-600 text-white shadow-md shadow-red-200'
                     : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                 }`}
               >
                 <AlertTriangle className="w-3.5 h-3.5" />
                 Com Apontamento (SIM)
               </button>
            </div>

            <div className="space-y-4">
               {data.checklistAec.perguntas
                 .filter((item) => aecFilter === 'Todos' || item.resposta === aecFilter)
                 .map((item) => (
                 <div key={item.id} className={`bg-white border ${item.resposta === 'SIM' ? 'border-red-200' : 'border-slate-200'} rounded-xl overflow-hidden shadow-sm transition-all`}>
                   <div className={`${item.resposta === 'SIM' ? 'bg-red-50/40' : 'bg-slate-50'} border-b ${item.resposta === 'SIM' ? 'border-red-100' : 'border-slate-100'} px-6 py-4 md:flex items-start md:items-center justify-between gap-4`}>
                     <div>
                       <div className="text-xs font-bold text-slate-400 mb-1">Item {item.id}</div>
                       <div className="font-semibold text-slate-800 text-sm">{item.pergunta}</div>
                     </div>
                     <div className="flex items-center gap-3 shrink-0 mt-4 md:mt-0">
                       <span className={`px-4 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 ${
                         item.resposta === 'SIM' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'
                       } border`}>
                         {item.resposta === 'SIM' ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                         {item.resposta}
                       </span>
                     </div>
                   </div>
                   
                   {/* Mostrar detalhes de justificativa se a reposta for SIM */}
                   {item.resposta === 'SIM' && (
                     <div className="p-6 text-sm flex flex-col md:flex-row gap-8 bg-red-50/10">
                       <div className="flex-1 space-y-4">
                         <div>
                           <div className="font-bold text-slate-700 uppercase text-xs mb-1">Fundamentação Técnica / Justificativa</div>
                           <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{item.fundamentacaoTecnica}</p>
                         </div>
                         {item.evidenciasEncontradas && item.evidenciasEncontradas.length > 0 && (
                           <div>
                             <div className="font-bold text-slate-700 uppercase text-xs mb-1">Evidências Encontradas</div>
                             <ul className="list-disc pl-5 text-slate-600 space-y-1">
                               {item.evidenciasEncontradas.map((ev, i) => <li key={i}>{ev}</li>)}
                             </ul>
                           </div>
                         )}
                       </div>
                       <div className="flex-1 space-y-4 md:border-l md:border-red-100 md:pl-8">
                          <div>
                           <div className="font-bold text-slate-700 uppercase text-xs mb-1">Impacto Potencial</div>
                           <p className="text-slate-600 leading-relaxed bg-white p-3 rounded border border-red-50 whitespace-pre-wrap">{item.impactoPotencial}</p>
                         </div>
                         <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                           <div className="font-bold text-red-900 uppercase text-xs mb-1 flex items-center gap-1.5">
                              <Lightbulb className="w-3.5 h-3.5" /> Recomendação
                           </div>
                           <p className="text-red-800 leading-relaxed font-medium whitespace-pre-wrap">{item.recomendacao}</p>
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'feedback' && data.feedbackUG && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border-2 border-blue-100 rounded-xl p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
              <h3 className="text-xl font-extrabold text-[#15294E] mb-6 flex items-center gap-3 uppercase tracking-wider">
                Feedback à Unidade Gestora
              </h3>
              
              <div className="prose max-w-none text-slate-600 prose-headings:text-[#15294E] prose-h3:text-lg prose-h3:font-bold prose-strong:text-[#15294E]">
                 <Markdown>{data.feedbackUG.replace(/\\n/g, '\n')}</Markdown>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}