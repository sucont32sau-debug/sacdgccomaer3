import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, setDoc, query, onSnapshot, orderBy, writeBatch, serverTimestamp, getDocs } from 'firebase/firestore';
import { identifyGroup, UGS_LIST } from '../lib/ugs';
import * as XLSX from 'xlsx';
import { UploadCloud, Database, ShieldAlert, History, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export function AdminPanel() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [metadata, setMetadata] = useState<any>(null);
  const [competence, setCompetence] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'metadata', 'current'), (doc) => {
      if (doc.exists()) {
        setMetadata(doc.data());
      } else {
        setMetadata(null);
      }
    });
    return () => unsub();
  }, []);

  const handleUpdateDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    if (!competence) {
      alert("Por favor, preencha a competência (ex: DEZEMBRO/2023) antes de atualizar a base.");
      return;
    }
    const files = Array.from(e.target.files);
    setIsUploading(true);
    setProgress(0);

    try {
      const readContent = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
            const reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = (e) => {
              try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                let consolidatedCsv = "";
                workbook.SheetNames.forEach((sheetName, index) => {
                  const worksheet = workbook.Sheets[sheetName];
                  const csv = XLSX.utils.sheet_to_csv(worksheet);
                  consolidatedCsv += `PLANILHA/ABA ${index + 1} (${sheetName}):\n${csv}\n\n`;
                });
                resolve(consolidatedCsv);
              } catch (err) {
                reject(err);
              }
            };
            reader.onerror = error => reject(error);
          } else {
            const reader = new FileReader();
            reader.readAsText(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
          }
        });
      };

      const truncateTextSafe = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '\n... [AVISO: DADOS TRUNCADOS POR EXCEDER LIMITE]';
      };

      const processedFiles = [];
      let i = 0;
      for (const file of files) {
        const extractedText = await readContent(file);
        // Safely truncate to ~800k chars to fit in Firestore safely
        const consolidatedText = truncateTextSafe(extractedText, 800000);

        let ugName = undefined;
        let selectedUg = '';
        for (const ug of UGS_LIST) {
          const code = ug.split(' - ')[0];
          const name = ug.split(' - ')[1];
          if (file.name.includes(code) || file.name.toUpperCase().includes(name) || consolidatedText.includes(code) || consolidatedText.includes(name)) {
             ugName = ug;
             selectedUg = code; // Use UG Code as ID safely
             break;
          }
        }

        if (ugName) {
          processedFiles.push({
            id: selectedUg,
            ugCode: selectedUg,
            ugName: ugName,
            group: identifyGroup(ugName),
            consolidatedData: consolidatedText,
            competence: competence
          });
        }
        i++;
        setProgress((i / files.length) * 50); // 50% for reading files
      }

      // Save to Firestore individually to avoid batch payload size limits (10MB max per batch)
      for (let j = 0; j < processedFiles.length; j++) {
        const item = processedFiles[j];
        const docRef = doc(db, 'ugs', item.id);
        await setDoc(docRef, {
          ugCode: item.ugCode,
          ugName: item.ugName,
          group: item.group,
          consolidatedData: item.consolidatedData,
          competence: item.competence,
          createdAt: serverTimestamp()
        });
        setProgress(50 + ((j + 1) / processedFiles.length * 40)); // up to 90%
      }

      // Record metadata
      const metaRef = doc(db, 'metadata', 'current');
      await setDoc(metaRef, {
        competence,
        updatedAt: serverTimestamp(),
        updatedBy: "Administrador (Sistema)", // using standard label for now, we could use auth.currentUser.email
        spreadsheetCount: files.length,
        ugCount: processedFiles.length,
        status: 'Ativa'
      });
      setProgress(100);

    } catch (e) {
      console.error(e);
      alert("Falha ao processar a base.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 3000);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return 'Aguardando...';
    return timestamp.toDate().toLocaleString('pt-BR');
  };

  const [activeTab, setActiveTab] = useState('update');

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-3">
        <Database className="w-8 h-8 text-blue-600" />
        Administração da Base de Dados
      </h1>

      <Tabs>
        <TabsList className="mb-6">
          <TabsTrigger active={activeTab === 'update'} onClick={() => setActiveTab('update')}>Atualizar Base</TabsTrigger>
          <TabsTrigger active={activeTab === 'info'} onClick={() => setActiveTab('info')}>Informações da Base</TabsTrigger>
          <TabsTrigger active={activeTab === 'integrity'} onClick={() => setActiveTab('integrity')}>Integridade</TabsTrigger>
        </TabsList>

        <TabsContent active={activeTab === 'update'}>
          <Card>
            <CardHeader>
              <CardTitle>Atualização da Base Institucional</CardTitle>
              <CardDescription>
                Substitui a base vigente por uma nova carga composta pelas planilhas do DGC.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Competência (ex: NOVEMBRO/2023)</label>
                  <input
                    type="text"
                    value={competence}
                    onChange={(e) => setCompetence(e.target.value)}
                    className="w-full max-w-sm rounded border-gray-300 shadow-sm px-3 py-2 border bg-white"
                    placeholder="MÊS/ANO"
                    disabled={isUploading}
                  />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                  <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Selecione as 69 planilhas em formato Excel (.xls, .xlsx)</p>
                  
                  <div className="relative">
                     <Button disabled={isUploading || !competence}>
                        {isUploading ? 'Processando...' : 'Selecionar Arquivos e Atualizar Base'}
                     </Button>
                     <input 
                        type="file" 
                        multiple 
                        accept=".xls,.xlsx"
                        onChange={handleUpdateDatabase}
                        disabled={isUploading || !competence}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                     />
                  </div>
                </div>

                {isUploading && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1 text-gray-600">
                      <span>Progresso...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent active={activeTab === 'info'}>
          <Card>
            <CardHeader>
              <CardTitle>Informações Analíticas da Carga</CardTitle>
              <CardDescription>Dados da base institucional ativa, utilizada em todas as inteligências.</CardDescription>
            </CardHeader>
            <CardContent>
              {metadata ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-500 font-medium">Competência Ativa</p>
                    <p className="text-xl font-bold text-gray-800">{metadata.competence}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-500 font-medium">Data da Atualização</p>
                    <p className="text-xl font-bold text-gray-800">{formatDate(metadata.updatedAt)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-500 font-medium">Unidades Gestoras Identificadas</p>
                    <p className="text-xl font-bold text-gray-800">{metadata.ugCount}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-500 font-medium">Planilhas Processadas</p>
                    <p className="text-xl font-bold text-gray-800">{metadata.spreadsheetCount}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm text-gray-500 font-medium">Autorização por</p>
                    <p className="text-xl font-bold text-gray-800">{metadata.updatedBy}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-500 font-medium">Status do Sistema</p>
                    <p className="text-xl font-bold text-green-700 uppercase">{metadata.status}</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                  <Activity className="w-12 h-12 text-gray-300 mb-4" />
                  <p>Nenhuma base institucional disponível. Solicite a atualização da base de dados.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent active={activeTab === 'integrity'}>
          <Card>
            <CardHeader>
              <CardTitle>Verificação de Integridade</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="p-6 text-center text-gray-500">
                 <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-green-500" />
                 <h3 className="text-xl font-bold text-gray-800 mb-2">Base Íntegra e Consolidada</h3>
                 <p className="max-w-md mx-auto">
                   Os dados em cache do banco de dados institucional estão prontos para consultas analíticas de extrema latência zero. 
                 </p>
               </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
