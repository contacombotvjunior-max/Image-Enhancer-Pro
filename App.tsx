
import React, { useState, useCallback, useMemo } from 'react';
import { processImageWithGemini } from './services/geminiService';
import { Tool } from './types';
import { UploadIcon, MagicWandIcon, SparklesIcon, ExpandIcon, DownloadIcon, TrashIcon } from './components/icons';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<Tool | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        resetState();
        setOriginalImage(reader.result as string);
      };
      reader.onerror = () => {
        setError('Falha ao ler o arquivo de imagem.');
      };
      reader.readAsDataURL(file);
    }
  };

  const resetState = () => {
    setOriginalImage(null);
    setProcessedImage(null);
    setIsLoading(false);
    setError(null);
    setActiveTool(null);
  };

  const processImage = useCallback(async (tool: Tool) => {
    if (!originalImage || isLoading) return;

    setIsLoading(true);
    setProcessedImage(null);
    setError(null);
    setActiveTool(tool);

    const prompts = {
      [Tool.RemoveWatermark]: "Esta imagem contém uma marca d'água. Sua tarefa é remover completamente esta marca d'água. Analise a imagem para identificar a sobreposição da marca d'água e, em seguida, pinte a área de forma inteligente, reconstruindo o fundo para que ele se combine perfeitamente com o entorno. O resultado deve ser uma imagem limpa, sem nenhum vestígio do texto ou logotipo da marca d'água.",
      [Tool.EnhanceQuality]: "Melhore a qualidade geral desta imagem. Aumente a nitidez, melhore a clareza, corrija as cores e reduza o ruído. O resultado deve ser uma versão visivelmente superior e de alta fidelidade da imagem original.",
      [Tool.Upscale8x]: "Realize um upscale desta imagem para 8 vezes a sua resolução original. Adicione detalhes realistas e aprimore texturas para criar uma imagem de altíssima definição, mantendo o estilo original.",
    };

    try {
      const result = await processImageWithGemini(originalImage, prompts[tool]);
      setProcessedImage(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, isLoading]);

  const editorView = useMemo(() => (
    <div className="w-full h-full flex flex-col lg:flex-row p-4 gap-4">
      {/* Control Panel */}
      <div className="w-full lg:w-72 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 flex flex-col gap-4 shadow-lg border border-gray-700">
        <h2 className="text-xl font-bold text-teal-300">Ferramentas de IA</h2>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => processImage(Tool.RemoveWatermark)}
            disabled={isLoading}
            className="flex items-center gap-3 px-4 py-3 bg-gray-700 rounded-lg hover:bg-teal-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MagicWandIcon className="w-5 h-5" />
            <span>Remover Marca D'água</span>
          </button>
          <button
            onClick={() => processImage(Tool.EnhanceQuality)}
            disabled={isLoading}
            className="flex items-center gap-3 px-4 py-3 bg-gray-700 rounded-lg hover:bg-teal-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>Melhorar Qualidade</span>
          </button>
          <button
            onClick={() => processImage(Tool.Upscale8x)}
            disabled={isLoading}
            className="flex items-center gap-3 px-4 py-3 bg-gray-700 rounded-lg hover:bg-teal-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ExpandIcon className="w-5 h-5" />
            <span>Upscale 8x</span>
          </button>
        </div>
        <div className="mt-auto flex flex-col gap-3">
          {processedImage && (
            <a
              href={processedImage}
              download="enhanced-image.png"
              className="flex items-center justify-center gap-3 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
            >
              <DownloadIcon className="w-5 h-5" />
              <span>Baixar Imagem</span>
            </a>
          )}
          <button
            onClick={resetState}
            className="flex items-center justify-center gap-3 px-4 py-3 bg-red-500/80 text-white rounded-lg hover:bg-red-600 transition-all duration-300"
          >
            <TrashIcon className="w-5 h-5" />
            <span>Começar de Novo</span>
          </button>
        </div>
      </div>

      {/* Image Display */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="text-center font-semibold text-gray-400">Original</h3>
          <div className="relative w-full aspect-square bg-gray-800/50 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-700">
            <img src={originalImage!} alt="Original" className="object-contain max-w-full max-h-full" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-center font-semibold text-gray-400">Processada</h3>
          <div className="relative w-full aspect-square bg-gray-800/50 rounded-2xl overflow-hidden flex items-center justify-center border border-gray-700">
            {isLoading && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10">
                <div className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-lg">Processando...</p>
              </div>
            )}
            {error && <p className="text-red-400 p-4 text-center">{error}</p>}
            {processedImage && !isLoading && (
              <img src={processedImage} alt="Processed" className="object-contain max-w-full max-h-full" />
            )}
            {!processedImage && !isLoading && !error && (
              <p className="text-gray-500">A imagem processada aparecerá aqui</p>
            )}
          </div>
        </div>
      </div>
    </div>
  ), [originalImage, processedImage, isLoading, error, processImage]);

  const uploaderView = (
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <label
          htmlFor="file-upload"
          className="relative block w-full h-80 border-2 border-dashed border-gray-600 rounded-2xl cursor-pointer hover:border-teal-400 transition-colors duration-300 bg-gray-800/50"
        >
          <div className="flex flex-col items-center justify-center h-full">
            <UploadIcon className="w-16 h-16 text-gray-500 mb-4" />
            <span className="text-xl font-semibold text-gray-300">Clique para carregar ou arraste e solte</span>
            <p className="text-gray-500 mt-1">PNG, JPG, WEBP</p>
          </div>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleImageUpload}
          />
        </label>
        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <header className="py-4 px-8 text-center bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="text-teal-400">Image Enhancer</span> Pro
        </h1>
        <p className="text-gray-400 mt-1">Aprimore suas imagens com o poder da IA do Gemini</p>
      </header>
      <main className="flex-1 flex items-center justify-center">
        {originalImage ? editorView : uploaderView}
      </main>
    </div>
  );
};

export default App;
