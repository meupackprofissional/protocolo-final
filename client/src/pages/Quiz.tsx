import { useState, useCallback, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { AnimatePresence } from "framer-motion";
import { QUIZ_QUESTIONS, QUIZ_COLORS } from "@/constants/quiz";
import ProgressBar from "@/components/ProgressBar";
import QuizQuestion from "@/components/QuizQuestion";
import ProcessingScreen from "@/components/ProcessingScreen";
import BackButton from "@/components/BackButton";
import { useMetaPixel } from "@/hooks/useMetaPixel";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface QuizAnswers {
  [key: number]: string;
}

export default function Quiz() {
  const [, setLocation] = useLocation();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const { getPixelData } = useMetaPixel();
  const recordLeadMutation = trpc.tracking.recordLead.useMutation();

  const handleSelectAnswer = useCallback((value: string) => {
    const updatedAnswers = {
      ...answers,
      [currentQuestion]: value,
    };
    setAnswers(updatedAnswers);

    // Auto-advance to next question after a short delay
    const timer = setTimeout(() => {
      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Last question answered - redirect to results
        setIsProcessing(true);
        
        // Simulate processing time and send lead event
        setTimeout(async () => {
          try {
            // Capturar fbp/fbc do Meta Pixel
            const pixelData = await getPixelData();
            
            // Recuperar sessionId do localStorage
            const sessionId = localStorage.getItem('quizSessionId') || `lead-${Date.now()}`;
            
            // Usar sessionId como email para rastreamento
            const email = `${sessionId}@protocolo.local`;
            
            await recordLeadMutation.mutateAsync({
              email,
              fbp: pixelData.fbp,
              fbc: pixelData.fbc,
            });
            
            console.log('[Quiz] Lead recorded successfully with sessionId:', sessionId);
          } catch (error) {
            console.error('[Quiz] Error recording lead:', error);
            // Nao falhar o fluxo se o rastreamento falhar
          }
          
          setLocation("/results");
        }, 2000);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [currentQuestion, answers, setLocation, getPixelData, recordLeadMutation]);

  const currentQuestionData = useMemo(() => QUIZ_QUESTIONS[currentQuestion], [currentQuestion]);

  if (isProcessing) {
    return <ProcessingScreen />;
  }

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ backgroundColor: QUIZ_COLORS.background }}
    >
      <BackButton />
      <ProgressBar current={currentQuestion + 1} total={QUIZ_QUESTIONS.length} />

      <div className="flex-1 flex items-center justify-center w-full">
        <AnimatePresence mode="wait">
          <QuizQuestion
            key={currentQuestion}
            question={currentQuestionData.question}
            options={currentQuestionData.options}
            onSelect={handleSelectAnswer}
            selectedValue={answers[currentQuestion]}
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
