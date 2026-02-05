import { useState, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { AnimatePresence } from "framer-motion";
import { QUIZ_QUESTIONS, QUIZ_COLORS } from "@/constants/quiz";
import ProgressBar from "@/components/ProgressBar";
import QuizQuestion from "@/components/QuizQuestion";
import ProcessingScreen from "@/components/ProcessingScreen";
import BackButton from "@/components/BackButton";
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

  const submitQuizMutation = trpc.quiz.submitResponse.useMutation();
  const utils = trpc.useUtils();

  const handleSubmitQuiz = useCallback(async (finalAnswers: any) => {
    setIsProcessing(true);

    try {
      // Validate that all answers are present
      if (!finalAnswers.babyAge || !finalAnswers.wakeUps || !finalAnswers.sleepMethod || 
          !finalAnswers.hasRoutine || !finalAnswers.motherFeeling) {
        console.error("Missing quiz answers:", finalAnswers);
        toast.error("Por favor, responda todas as perguntas.");
        setIsProcessing(false);
        return;
      }

      const response = await submitQuizMutation.mutateAsync({
        email: `lead-${Date.now()}@quiz.local`,
        name: undefined,
        babyAge: finalAnswers.babyAge,
        wakeUps: finalAnswers.wakeUps,
        sleepMethod: finalAnswers.sleepMethod,
        hasRoutine: finalAnswers.hasRoutine,
        motherFeeling: finalAnswers.motherFeeling,
        triedOtherMethods: finalAnswers.triedOtherMethods || "",
      });

      if (response.success) {
        // Invalidate queries and redirect
        await utils.invalidate();
        
        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Redirect to results page using Wouter for SPA navigation
        setLocation("/results");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Erro ao enviar suas respostas. Tente novamente.");
      setIsProcessing(false);
    }
  }, [submitQuizMutation, setLocation]);

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
        // Use updatedAnswers instead of stale answers state
        handleSubmitQuiz({
          babyAge: updatedAnswers[0] || "",
          wakeUps: updatedAnswers[1] || "",
          sleepMethod: updatedAnswers[2] || "",
          hasRoutine: updatedAnswers[3] || "",
          motherFeeling: updatedAnswers[4] || "",
          triedOtherMethods: updatedAnswers[5] || "",
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [currentQuestion, handleSubmitQuiz])

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
