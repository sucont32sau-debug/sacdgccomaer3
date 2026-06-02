import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, AlertCircle, ShieldCheck, CheckCircle2, FileSpreadsheet, X } from 'lucide-react';

interface UploadViewProps {
  onFileSelect: (files: File[]) => void;
  isLoading: boolean;
  progress?: { current: number; total: number };
}

function DropzonePanel({ title, files, onDrop, onRemove }: { title: string, files: File[], onDrop: (f: File[]) => void, onRemove: (index: number) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) onDrop(acceptedFiles);
    },
    accept: { 
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 100
  } as any);

  return (
    <div className={`p-8 rounded-md border-2 transition-all duration-300 bg-white ${isDragActive ? 'border-blue-500 bg-blue-50' : files.length > 0 ? 'border-blue-500/50' : 'border-slate-200 hover:border-blue-500/50'}`}>
      <div className="flex flex-col items-center text-center space-y-4">
        <h3 className="font-bold text-lg text-[#15294E]">{title}</h3>
        {files.length === 0 ? (
          <div {...getRootProps()} className="w-full py-10 cursor-pointer flex flex-col items-center">
            <input {...getInputProps()} />
            <UploadCloud className="w-12 h-12 text-slate-400 mb-4" />
            <p className="text-sm font-medium text-slate-600 mb-1">Arraste as planilhas para cá ou clique para selecionar</p>
            <p className="text-xs text-slate-500">Formatos aceitos: CSV, XLS, XLSX (Processamento em Lote)</p>
          </div>
        ) : (
          <div className="w-full text-left">
            <div className="flex justify-between items-center mb-3">
               <span className="text-sm font-bold text-slate-700">{files.length} arquivo{files.length > 1 ? 's' : ''} selecionado{files.length > 1 ? 's' : ''}</span>
               <div {...getRootProps()} className="cursor-pointer text-blue-600 hover:text-blue-700 text-xs font-bold uppercase transition-colors">
                 <input {...getInputProps()} />
                 + Adicionar mais
               </div>
            </div>
            <div className="max-h-[160px] overflow-y-auto space-y-2 pr-2">
              {files.map((file, index) => (
                 <div key={index} className="w-full flex justify-between items-center bg-slate-50 p-3 rounded border border-blue-500/20">
                   <div className="flex items-center space-x-3 overflow-hidden">
                     <FileSpreadsheet className="w-5 h-5 text-blue-500 flex-shrink-0" />
                     <span className="text-sm text-slate-700 truncate font-medium">{file.name}</span>
                   </div>
                   <button onClick={() => onRemove(index)} className="text-slate-400 hover:text-red-500 p-1 transition-colors">
                      <X className="w-4 h-4" />
                   </button>
                 </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function UploadView({ onFileSelect, isLoading, progress }: UploadViewProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleProcess = () => {
    if (files.length === 0) {
      setError('Por favor, envie ao menos uma planilha para processamento.');
      return;
    }
    setError(null);
    onFileSelect(files);
  };

  const handleDrop = (newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemove = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 relative mt-10">
      
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl" style={{ zIndex: -1 }}>
         <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-100/50 blur-[100px] rounded-full mix-blend-multiply"></div>
         <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-amber-50/50 blur-[80px] rounded-full mix-blend-multiply"></div>
      </div>

      <div className="w-full max-w-4xl flex flex-col items-center space-y-10 relative z-10">
        
        {/* Header Section */}
        <div className="text-center space-y-5">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-[#15294E] shadow-md border border-[#2c4779] text-white text-xs font-extrabold tracking-[0.2em] uppercase">
            <ShieldCheck className="w-4 h-4 text-yellow-500" /> SAC-DGC | Força Aérea Brasileira
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#15294E] drop-shadow-sm leading-tight max-w-3xl">
            Acompanhamento Crítico <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500">Contínuo</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">
            Carregue as planilhas das unidades (processamento individual ou em lote) para submeter ao módulo de Inteligência Analítica Institucional.
          </p>
        </div>

        {/* Upload Container */}
        <div className={`w-full max-w-2xl ${isLoading ? 'opacity-40 pointer-events-none' : ''}`}>
           <DropzonePanel 
              title="Base de Dados (Planilhas DGC)" 
              files={files} 
              onDrop={handleDrop}
              onRemove={handleRemove}
           />
        </div>

        {/* Messaging Area */}
        <div className="min-h-[5rem] w-full max-w-2xl flex justify-center items-start">
          {error && (
            <div className="flex items-center gap-3 text-red-700 bg-red-50 border border-red-200 px-5 py-3 rounded-md shadow-sm w-full animate-in fade-in slide-in-from-bottom-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-semibold">{error}</span>
            </div>
          )}
          
          {isLoading && (
            <div className="flex w-full items-center justify-between animate-in fade-in slide-in-from-bottom-2 bg-white p-5 rounded-md border border-blue-200 shadow-md">
               <div className="flex items-center gap-4">
                 <div className="relative">
                    <div className="h-10 w-10 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin" />
                 </div>
                 <div>
                   <p className="font-extrabold text-blue-900 tracking-wide uppercase text-sm">
                     Processando Auditagem {progress ? `(${progress.current}/${progress.total})` : ''}
                   </p>
                   {progress ? (
                     <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                       <div className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                     </div>
                   ) : (
                     <p className="text-xs font-semibold text-slate-500 mt-0.5">Cruzamento institucional de dados em andamento...</p>
                   )}
                 </div>
               </div>
               <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Tempo estimado</p>
                  <p className="text-xs font-bold text-slate-600">
                    {progress ? `~ ${Math.max(1, (progress.total - progress.current) * 45)} Segundos` : '~ 45 Segundos'}
                  </p>
               </div>
            </div>
          )}

          {!isLoading && !error && (
            <button 
               onClick={handleProcess}
               disabled={files.length === 0}
               className={`w-full max-w-[300px] px-8 py-4 font-bold text-sm tracking-widest uppercase rounded-md shadow-lg transition-all border ${files.length === 0 ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-[#15294E] text-white hover:bg-[#1a3362] border-[#15294E] hover:shadow-blue-900/20 active:scale-[0.98]'}`}
            >
               Iniciar Análise {files.length > 1 ? 'em Lote' : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

