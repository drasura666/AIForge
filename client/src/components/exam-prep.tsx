import { useState } from "react";
import { Clock, ArrowLeft, ArrowRight, Brain, FileText, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApiKeys } from "@/hooks/use-api-keys";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export default function ExamPrep() {
  const [subject, setSubject] = useState("physics");
  const [difficulty, setDifficulty] = useState("basic");
  const [questionCount, setQuestionCount] = useState([10]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes
  const { currentProvider, apiKeys } = useApiKeys();

  const generateQuiz = async () => {
    if (!currentProvider || !apiKeys[currentProvider]) {
      toast({
        title: "Error",
        description: "Please ensure you have API keys configured.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/exam/generate", {
        subject,
        difficulty,
        questionCount: questionCount[0],
        provider: currentProvider,
        apiKey: apiKeys[currentProvider],
      });

      const data = await response.json();
      setQuestions(data.questions || []);
      setSelectedAnswers(new Array(data.questions?.length || 0).fill(-1));
      setCurrentQuestion(0);
      
      toast({
        title: "Quiz Generated",
        description: `Generated ${data.questions?.length || 0} questions for ${subject}.`,
      });
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      toast({
        title: "Error",
        description: "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        {questions.length > 0 ? (
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">
                  {subject.charAt(0).toUpperCase() + subject.slice(1)} Quiz - {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level
                </CardTitle>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald" data-testid="text-time-remaining">
                    {formatTime(timeRemaining)}
                  </div>
                  <div className="text-sm text-slate-400">Time Remaining</div>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span data-testid="text-question-progress">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-emerald h-2 rounded-full transition-all" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="bg-slate-700 rounded-lg p-6 mb-6" data-testid="question-container">
                <h4 className="text-lg font-semibold mb-4">
                  {questions[currentQuestion]?.question || "Loading question..."}
                </h4>
                
                <div className="space-y-3">
                  {questions[currentQuestion]?.options.map((option, index) => (
                    <label 
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedAnswers[currentQuestion] === index 
                          ? "bg-rich-purple" 
                          : "bg-slate-600 hover:bg-slate-500"
                      }`}
                      data-testid={`option-${index}`}
                    >
                      <input 
                        type="radio" 
                        name="answer" 
                        value={index}
                        checked={selectedAnswers[currentQuestion] === index}
                        onChange={() => selectAnswer(index)}
                        className="text-rich-purple"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-between">
                <Button
                  onClick={previousQuestion}
                  disabled={currentQuestion === 0}
                  variant="outline"
                  data-testid="button-previous"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  onClick={nextQuestion}
                  disabled={currentQuestion === questions.length - 1}
                  className="bg-rich-purple hover:bg-purple-600"
                  data-testid="button-next"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-12 text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-rich-purple" />
              <h3 className="text-xl font-semibold mb-2">Ready to Test Your Knowledge?</h3>
              <p className="text-slate-400 mb-6">Generate a quiz to get started with your exam preparation.</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="space-y-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle>Create New Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="bg-slate-700 border-slate-600" data-testid="select-quiz-subject">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="physics">Physics</SelectItem>
                  <SelectItem value="chemistry">Chemistry</SelectItem>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="computer-science">Computer Science</SelectItem>
                  <SelectItem value="engineering">Engineering</SelectItem>
                  <SelectItem value="biology">Biology</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  onClick={() => setDifficulty("basic")}
                  className={`flex-1 ${difficulty === "basic" ? "bg-emerald" : "bg-slate-700 hover:bg-slate-600"}`}
                  data-testid="button-difficulty-basic"
                >
                  Basic
                </Button>
                <Button
                  type="button"
                  onClick={() => setDifficulty("intermediate")}
                  className={`flex-1 ${difficulty === "intermediate" ? "bg-emerald" : "bg-slate-700 hover:bg-slate-600"}`}
                  data-testid="button-difficulty-intermediate"
                >
                  Intermediate
                </Button>
                <Button
                  type="button"
                  onClick={() => setDifficulty("advanced")}
                  className={`flex-1 ${difficulty === "advanced" ? "bg-emerald" : "bg-slate-700 hover:bg-slate-600"}`}
                  data-testid="button-difficulty-advanced"
                >
                  Advanced
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Questions</label>
              <Slider
                value={questionCount}
                onValueChange={setQuestionCount}
                min={5}
                max={50}
                step={5}
                className="w-full"
                data-testid="slider-question-count"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>5</span>
                <span data-testid="text-question-count">{questionCount[0]} questions</span>
                <span>50</span>
              </div>
            </div>
            
            <Button
              onClick={generateQuiz}
              disabled={isLoading}
              className="w-full bg-rich-purple hover:bg-purple-600"
              data-testid="button-generate-quiz"
            >
              {isLoading ? "Generating..." : "Generate Quiz"}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Performance Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Score</span>
                <span className="font-semibold text-emerald" data-testid="text-average-score">--</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Quizzes Completed</span>
                <span className="font-semibold" data-testid="text-quizzes-completed">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Study Streak</span>
                <span className="font-semibold text-amber" data-testid="text-study-streak">0 days</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Study Modes</h3>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start bg-slate-700 hover:bg-slate-600"
                data-testid="button-timed-practice"
              >
                <Clock className="w-4 h-4 mr-2" />
                Timed Practice
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start bg-slate-700 hover:bg-slate-600"
                data-testid="button-flashcards"
              >
                <FileText className="w-4 h-4 mr-2" />
                Flashcards
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start bg-slate-700 hover:bg-slate-600"
                data-testid="button-mock-exam"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Mock Exam
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start bg-slate-700 hover:bg-slate-600"
                data-testid="button-adaptive-learning"
              >
                <Brain className="w-4 h-4 mr-2" />
                Adaptive Learning
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
