import { useState, useEffect } from 'react';
import { UploadView } from './components/UploadView';
import { AdminPanel } from './components/AdminPanel';
import * as XLSX from 'xlsx';

import { analyzeDGC } from './lib/gemini';
import { DgcData } from './types';
import { FileText, LayoutGrid, AlertTriangle, CheckCircle2, Download, Database, Lock, LogIn, Activity } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './components/ui/card';
import { DashboardView } from './components/DashboardView';
import { useAuth } from './contexts/AuthContext';
import { identifyGroup, UGS_LIST } from './lib/ugs';
import { db } from './lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';

export default function App() {
  const { user, isAdmin, loading: authLoading, login, logout } = useAuth();
  
  const [activeReport, setActiveReport] = useState<DgcData | null>(null);
  const [dbMetadata, setDbMetadata] = useState<any>(null);
  const [availableUgs, setAvailableUgs] = useState<any[]>([]);
  
  const [isGeneratingAnalysis, setIsGeneratingAnalysis] = useState(false);
  const [currentView, setCurrentView] = useState<'HOME' | 'ADMIN' | 'ANALYSIS'>('HOME');

  useEffect(() => {
    if (!user) return;
    const unsubMeta = onSnapshot(doc(db, 'metadata', 'current'), (docSnap) => {
      if (docSnap.exists()) {
        setDbMetadata(docSnap.data());
        fetchUgList(docSnap.data().competence);
      } else {
        setDbMetadata(null);
        setAvailableUgs([]);
      }
    });

    return () => unsubMeta();
  }, [user]);

  const fetchUgList = async (competence: string) => {
    try {
      const q = query(collection(db, 'ugs'), where('competence', '==', competence));
      const querySnapshot = await getDocs(q);
      const ugs = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setAvailableUgs(ugs);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGenerateAnalysis = async (ugContext: any) => {
    setIsGeneratingAnalysis(true);
    try {
      // Find other UGs in the same group to serve as reference
      const groupOthers = availableUgs.filter(u => u.group === ugContext.group && u.id !== ugContext.id);
      const groupContextStr = groupOthers.map(u => `[DADOS DA UG: ${u.ugName}]\n${u.consolidatedData.substring(0, 40000)}`).join('\n\n=====\n\n');
      
      const result = await analyzeDGC(ugContext.consolidatedData, {
         groupName: ugContext.group,
         groupContext: groupContextStr.substring(0, 300000)
      });
      
      setActiveReport(result);
      setCurrentView('ANALYSIS');
    } catch (error: any) {
      console.error(error);
      alert('Falha ao gerar inteligência gerencial: ' + error.message);
    } finally {
      setIsGeneratingAnalysis(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center">
        <p className="text-gray-500 font-medium">Autenticando Plataforma Institucional...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f4f6f9] flex flex-col items-center justify-center selection:bg-blue-500/30">
        <div className="text-center max-w-md w-full bg-white p-10 rounded-xl shadow border border-slate-200">
           <LayoutGrid className="w-16 h-16 text-yellow-500 mx-auto mb-6" strokeWidth={2} />
           <h1 className="text-2xl font-bold tracking-tight text-[#15294E] mb-2">SAC-DGC</h1>
           <p className="text-slate-500 mb-8 font-medium">Sistema Institucional de Análise Crítica do Demonstrativo Gerencial de Custos</p>
           <Button onClick={login} className="w-full bg-[#15294E] hover:bg-[#2c4779] text-white">
             <LogIn className="w-5 h-5 mr-2" />
             Acesso Institucional
           </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-800 font-sans selection:bg-blue-500/30">
      <header className="border-b border-[#0f1f3a] bg-[#15294E] sticky top-0 z-10 w-full shadow-md">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 border border-yellow-500/80 rounded flex items-center justify-center bg-[#15294E] shadow-[0_0_8px_rgba(253,185,19,0.3)]">
              <LayoutGrid className="w-5 h-5 text-yellow-500" strokeWidth={2.5} />
            </div>
            
            <div className="border-[#2c4779]">
              <h1 className="font-bold tracking-tight text-white flex items-center gap-2 text-lg">
                SAC-DGC - Sistema de Análise Crítica do Demonstrativo Gerencial de Custos
              </h1>
              <p className="text-[11px] uppercase tracking-wider text-yellow-500 font-bold mb-0.5 flex gap-2">
                <span>FORÇA AÉREA BRASILEIRA</span>
                <span className="text-yellow-500/50">•</span>
                <span>DIREF</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {dbMetadata && (
              <div className="text-right text-white hidden sm:block border-r border-[#2c4779] pr-6">
                <p className="text-sm font-bold text-yellow-400">Base Atual: <span className="text-white">{dbMetadata.competence}</span></p>
                <p className="text-[11px] text-slate-300">Última Atualização: {formatDate(dbMetadata.updatedAt)}</p>
              </div>
            )}
            
            <div className="flex items-center gap-3">
              {isAdmin && currentView !== 'ADMIN' && (
                <Button onClick={() => setCurrentView('ADMIN')} variant="outline" className="flex bg-[#1c335a] border-[#2c4779] hover:bg-[#2c4779] hover:text-white h-9 text-xs font-semibold text-white transition-colors">
                  <Database className="w-4 h-4 mr-2" /> Admin Base
                </Button>
              )}
              {currentView !== 'HOME' && (
                <Button onClick={() => setCurrentView('HOME')} variant="outline" className="flex bg-[#1c335a] border-[#2c4779] hover:bg-[#2c4779] hover:text-white h-9 text-xs font-semibold text-white transition-colors">
                   Dashboard Institucional
                </Button>
              )}
              <Button onClick={logout} variant="outline" className="flex bg-transparent border-none hover:bg-red-500/20 hover:text-red-400 h-9 text-xs font-semibold text-slate-400 transition-colors">
                 Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-8">
        {currentView === 'ADMIN' && isAdmin && (
           <AdminPanel />
        )}
        
        {currentView === 'ANALYSIS' && activeReport && (
           <DashboardView data={activeReport} />
        )}

        {currentView === 'HOME' && (
           <div className="container mx-auto px-6">
             {!dbMetadata ? (
               <div className="max-w-2xl mx-auto mt-20 text-center bg-white rounded-xl shadow-sm border border-slate-200 p-12">
                 <Lock className="w-16 h-16 mx-auto mb-6 text-slate-300" />
                 <h2 className="text-2xl font-bold text-[#15294E] mb-3">Nenhuma base institucional disponível.</h2>
                 <p className="text-slate-500 text-lg">
                   Solicite ao administrador a atualização da base de dados com as planilhas DGC mensais.
                 </p>
               </div>
             ) : (
               <div className="w-full max-w-6xl mx-auto mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Competência</p>
                      <p className="font-bold text-slate-800">{dbMetadata.competence}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Última Atualização</p>
                      <p className="font-bold text-slate-800">{formatDate(dbMetadata.updatedAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Planilhas Carga</p>
                      <p className="font-bold text-slate-800">{dbMetadata.spreadsheetCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Unidades (UGs)</p>
                      <p className="font-bold text-slate-800">{dbMetadata.ugCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Status da Base</p>
                      <p className="font-bold text-green-600 uppercase tracking-wide">{dbMetadata.status}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mb-8">
                     <div>
                        <h2 className="text-3xl font-extrabold text-[#15294E] mb-2">Acervo de Análise Crítica</h2>
                        <p className="text-slate-500 font-medium">Selecione uma Unidade Gestora carregada na base institucional para extrair inteligência gerencial.</p>
                     </div>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                     {isGeneratingAnalysis && (
                       <div className="p-8 text-center bg-blue-50/50">
                         <Activity className="w-10 h-10 text-blue-600 animate-pulse mx-auto mb-4" />
                         <p className="font-bold text-blue-900 text-lg">Extraindo Inteligência Institucional...</p>
                         <p className="text-blue-600/80 text-sm mt-1">Isso pode levar alguns segundos dependendo do tamanho do contexto.</p>
                       </div>
                     )}
                     
                     {!isGeneratingAnalysis && availableUgs.length > 0 && (
                       <div className="overflow-x-auto">
                         <table className="w-full text-left border-collapse">
                           <thead>
                             <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                               <th className="px-6 py-4">Código UG</th>
                               <th className="px-6 py-4">Nome da Organização</th>
                               <th className="px-6 py-4">Grupo de Comparação</th>
                               <th className="px-6 py-4 text-right">Ação</th>
                             </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100">
                             {availableUgs.map((ug, idx) => (
                               <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                 <td className="px-6 py-4 font-mono text-sm font-semibold text-[#15294E]">{ug.ugCode}</td>
                                 <td className="px-6 py-4 font-bold text-sm text-slate-800">{ug.ugName}</td>
                                 <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                                   <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">{ug.group}</span>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                   <button 
                                     onClick={() => handleGenerateAnalysis(ug)}
                                     disabled={isGeneratingAnalysis}
                                     className="text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed px-4 py-2 rounded text-xs font-bold uppercase tracking-wide transition-colors"
                                   >
                                     Gerar Análise Crítica
                                   </button>
                                 </td>
                               </tr>
                             ))}
                           </tbody>
                         </table>
                       </div>
                     )}
                  </div>
               </div>
             )}
           </div>
        )}
      </main>
    </div>
  );
}

