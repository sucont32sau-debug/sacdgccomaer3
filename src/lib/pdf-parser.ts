import * as pdfjsLib from 'pdfjs-dist';

// Use the standard worker URL from unpkg using the installed version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const UGS = [
  "120004", "120030", "120075", "120082", "120624", "120631", "120638", "120641", "120643", "120669",
  "120006", "120016", "120039", "120623", "120625", "120628", "120632", "120633", "120645",
  "120005", "120007", "120045", "120053", "120097", "120161", "120512", "120516", "120519",
  "120040", "120042", "120058", "120066", "120096", "120043",
  "120060", "120064", "120140",
  "120026", "120048", "120049", "120068", "120071",
  "120008", "120021", "120036", "120015", "120072", "120094", "120127",
  "120110", "120141",
  "120136",
  "120013", "120108", "120300", "120460"
];

export async function extractTextFromPdf(base64: string): Promise<string> {
  const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
  
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const loadingTask = pdfjsLib.getDocument({ data: bytes });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  
  let relevantText = '';
  
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageTextRaw = content.items.map((item: any) => item.str).join(' ');
    // Compress text
    const pageText = pageTextRaw.replace(/\s+/g, ' ').trim();
    
    // Quick filter: only keep page if it mentions one of the UGs or keywords
    const hasUg = UGS.some(ug => pageText.includes(ug));
    const hasKeywords = pageText.toLowerCase().match(/(dgc|demonstrativo|custo|despesa|painel|sistema|efetivo|rateio|ug|pessoal|regularizar)/i);

    if (hasUg || hasKeywords) {
      if (relevantText.length < 1500000) { // Limit to ~1.5M chars to avoid exceeding 1M tokens
        relevantText += `[P${i}] ${pageText}\n`;
      } else {
        console.warn("Reached maximum context length for LLM (approx 1M tokens). Terminating extraction to avoid crashes.");
        break;
      }
    }
  }
  
  return relevantText;
}
