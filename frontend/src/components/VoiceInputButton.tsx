import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface VoiceInputButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({ onTranscript, className = '' }) => {
  const { language } = useLanguage();
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.interimResults = false;
      if (language === 'hi') recog.lang = 'hi-IN';
      else if (language === 'te') recog.lang = 'te-IN';
      else recog.lang = 'en-US';

      recog.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          onTranscript(text);
        }
        setIsListening(false);
      };

      recog.onerror = () => {
        setIsListening(false);
      };

      recog.onend = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, [language, onTranscript]);

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or a Web Speech compliant browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Recognition start error:', e);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      title={isListening ? 'Stop recording voice' : 'Speak your query via Web Speech'}
      className={`relative p-3 rounded-2xl border transition-all duration-200 ${
        isListening
          ? 'bg-[#EF4444] text-[#0B1F16] border-[#EF4444] animate-pulse ring-4 ring-[#EF4444]/30 shadow-lg'
          : 'bg-[#0B1F16] text-[#94B7A8] hover:text-[#22C55E] border-[#1E4D3A] hover:bg-[#1E4D3A]'
      } ${className}`}
    >
      {isListening ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-[#22C55E]" />}
    </button>
  );
};
