import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Send, Bot, User, Sparkles, Brain,
  Heart, Target, Zap, Shield, Clock, CheckCircle,
  ArrowRight, X, Plus, Save, Download, RotateCcw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'plan';
  data?: any;
}

interface TherapyPlan {
  issue: string;
  severity: string;
  planDuration: string;
  recommendations: Array<{
    moduleId: string;
    title: string;
    description: string;
    priority: number;
    color: string;
  }>;
  dailyGoals: string[];
  weeklyGoals: string[];
  resources: string[];
}

interface AssessmentQuestion {
  id: number;
  question: string;
  type: 'text' | 'scale' | 'multiple' | 'boolean';
  options?: string[];
  category: string;
}

function ChatbotPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<string>('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<any[]>([]);
  const [generatedPlan, setGeneratedPlan] = useState<TherapyPlan | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const mentalHealthIssues = [
    { id: 'anxiety', name: 'Anxiety Disorders', icon: Zap, color: 'from-yellow-500 to-orange-500' },
    { id: 'depression', name: 'Depression', icon: Heart, color: 'from-blue-500 to-purple-500' },
    { id: 'stress', name: 'Stress Management', icon: Target, color: 'from-red-500 to-pink-500' },
    { id: 'trauma', name: 'Trauma & PTSD', icon: Shield, color: 'from-green-500 to-teal-500' },
    { id: 'relationships', name: 'Relationship Issues', icon: Heart, color: 'from-purple-500 to-pink-500' },
    { id: 'sleep', name: 'Sleep Disorders', icon: Clock, color: 'from-indigo-500 to-blue-500' },
    { id: 'addiction', name: 'Addiction Recovery', icon: Target, color: 'from-orange-500 to-red-500' },
    { id: 'eating', name: 'Eating Disorders', icon: Heart, color: 'from-pink-500 to-rose-500' }
  ];

  const assessmentQuestions: { [key: string]: AssessmentQuestion[] } = {
    anxiety: [
      {
        id: 1,
        question: "Can you describe a recent situation where you felt anxious? What was happening around you and what thoughts went through your mind?",
        type: 'text',
        category: 'triggers'
      },
      {
        id: 2,
        question: "On a scale of 1-10, how would you rate your average anxiety level over the past week?",
        type: 'scale',
        category: 'severity'
      },
      {
        id: 3,
        question: "Which physical symptoms do you experience when anxious?",
        type: 'multiple',
        options: ['Racing heart', 'Sweating', 'Trembling', 'Shortness of breath', 'Nausea', 'Dizziness', 'Muscle tension'],
        category: 'symptoms'
      },
      {
        id: 4,
        question: "How often do you experience anxiety symptoms?",
        type: 'multiple',
        options: ['Daily', 'Several times a week', 'Weekly', 'Monthly', 'Rarely'],
        category: 'frequency'
      },
      {
        id: 5,
        question: "What situations or thoughts typically trigger your anxiety?",
        type: 'text',
        category: 'triggers'
      },
      {
        id: 6,
        question: "Have you tried any coping strategies before? If so, what worked or didn't work?",
        type: 'text',
        category: 'coping'
      },
      {
        id: 7,
        question: "How is your anxiety affecting your daily life (work, relationships, activities)?",
        type: 'text',
        category: 'impact'
      },
      {
        id: 8,
        question: "Do you have any support systems (family, friends, professionals)?",
        type: 'text',
        category: 'support'
      },
      {
        id: 9,
        question: "What are your main goals for managing your anxiety?",
        type: 'text',
        category: 'goals'
      },
      {
        id: 10,
        question: "Is there anything else about your anxiety that you'd like to share?",
        type: 'text',
        category: 'additional'
      }
    ],
    depression: [
      {
        id: 1,
        question: "How would you describe your mood over the past two weeks?",
        type: 'text',
        category: 'mood'
      },
      {
        id: 2,
        question: "On a scale of 1-10, how would you rate your overall mood lately?",
        type: 'scale',
        category: 'severity'
      },
      {
        id: 3,
        question: "Which symptoms have you been experiencing?",
        type: 'multiple',
        options: ['Persistent sadness', 'Loss of interest', 'Fatigue', 'Sleep changes', 'Appetite changes', 'Difficulty concentrating', 'Feelings of worthlessness'],
        category: 'symptoms'
      },
      {
        id: 4,
        question: "How long have you been feeling this way?",
        type: 'multiple',
        options: ['Less than 2 weeks', '2-4 weeks', '1-3 months', '3-6 months', 'More than 6 months'],
        category: 'duration'
      },
      {
        id: 5,
        question: "What activities did you used to enjoy that you've lost interest in?",
        type: 'text',
        category: 'interests'
      },
      {
        id: 6,
        question: "How are your energy levels throughout the day?",
        type: 'text',
        category: 'energy'
      },
      {
        id: 7,
        question: "How is your sleep pattern? Any changes recently?",
        type: 'text',
        category: 'sleep'
      },
      {
        id: 8,
        question: "What thoughts go through your mind when you're feeling low?",
        type: 'text',
        category: 'thoughts'
      },
      {
        id: 9,
        question: "What would help you feel more hopeful or motivated?",
        type: 'text',
        category: 'motivation'
      },
      {
        id: 10,
        question: "Is there anything else about your mood that you'd like to discuss?",
        type: 'text',
        category: 'additional'
      }
    ],
    stress: [
      {
        id: 1,
        question: "What are the main sources of stress in your life right now?",
        type: 'text',
        category: 'sources'
      },
      {
        id: 2,
        question: "On a scale of 1-10, how stressed do you feel on average?",
        type: 'scale',
        category: 'severity'
      },
      {
        id: 3,
        question: "How does stress typically show up in your body?",
        type: 'multiple',
        options: ['Headaches', 'Muscle tension', 'Stomach issues', 'Sleep problems', 'Fatigue', 'Irritability', 'Racing thoughts'],
        category: 'symptoms'
      },
      {
        id: 4,
        question: "When do you feel most stressed during the day?",
        type: 'multiple',
        options: ['Morning', 'Afternoon', 'Evening', 'Night', 'Varies', 'All day'],
        category: 'timing'
      },
      {
        id: 5,
        question: "How do you currently cope with stress?",
        type: 'text',
        category: 'coping'
      },
      {
        id: 6,
        question: "What relaxation techniques have you tried before?",
        type: 'text',
        category: 'techniques'
      },
      {
        id: 7,
        question: "How is stress affecting your work or daily activities?",
        type: 'text',
        category: 'impact'
      },
      {
        id: 8,
        question: "What would your ideal stress-free day look like?",
        type: 'text',
        category: 'goals'
      },
      {
        id: 9,
        question: "What support do you have for managing stress?",
        type: 'text',
        category: 'support'
      },
      {
        id: 10,
        question: "What's one thing that always helps you feel calmer?",
        type: 'text',
        category: 'relief'
      }
    ]
  };

  useEffect(() => {
    // Initial greeting
    const initialMessage: Message = {
      id: '1',
      text: `Hello ${user?.name}! I'm your AI mental health assistant. I'm here to provide support, guidance, and help you create a personalized therapy plan. How are you feeling today?`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(inputText);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateBotResponse = (userInput: string): Message => {
    const lowerInput = userInput.toLowerCase();
    
    // Check for mental health keywords
    if (lowerInput.includes('anxious') || lowerInput.includes('anxiety') || lowerInput.includes('worried')) {
      return {
        id: Date.now().toString(),
        text: "I understand you're experiencing anxiety. That takes courage to share. Would you like me to help you create a personalized therapy plan to address your anxiety? I can guide you through a brief assessment to better understand your specific needs.",
        sender: 'bot',
        timestamp: new Date(),
        type: 'suggestion'
      };
    }
    
    if (lowerInput.includes('sad') || lowerInput.includes('depressed') || lowerInput.includes('down')) {
      return {
        id: Date.now().toString(),
        text: "I hear that you're going through a difficult time. Your feelings are valid, and seeking help is a positive step. Would you like to explore therapy options that might help improve your mood and overall well-being?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'suggestion'
      };
    }
    
    if (lowerInput.includes('stressed') || lowerInput.includes('overwhelmed') || lowerInput.includes('pressure')) {
      return {
        id: Date.now().toString(),
        text: "Stress can be really challenging to manage. I'd like to help you develop effective coping strategies. Would you be interested in creating a personalized stress management plan?",
        sender: 'bot',
        timestamp: new Date(),
        type: 'suggestion'
      };
    }

    // Default supportive responses
    const responses = [
      "Thank you for sharing that with me. I'm here to listen and support you. Is there a particular area of your mental health you'd like to focus on today?",
      "I appreciate you opening up. Everyone's mental health journey is unique. Would you like to explore some therapy options that might be helpful for you?",
      "It sounds like you're taking positive steps by reaching out. What would be most helpful for you right now - talking through your feelings or exploring some coping strategies?",
      "I'm glad you're here. Taking care of your mental health is important. Would you like me to help you identify some specific areas we could work on together?"
    ];

    return {
      id: Date.now().toString(),
      text: responses[Math.floor(Math.random() * responses.length)],
      sender: 'bot',
      timestamp: new Date()
    };
  };

  const startAssessment = (issue: string) => {
    setSelectedIssue(issue);
    setShowAssessment(true);
    setCurrentQuestion(0);
    setAssessmentAnswers([]);
    
    const issueData = mentalHealthIssues.find(i => i.id === issue);
    toast.success(`Starting ${issueData?.name} assessment`);
  };

  const handleAssessmentAnswer = (answer: any) => {
    const newAnswers = [...assessmentAnswers, answer];
    setAssessmentAnswers(newAnswers);

    const questions = assessmentQuestions[selectedIssue] || [];
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Assessment complete, generate therapy plan
      completeAssessment(newAnswers);
    }
  };

  const completeAssessment = (answers: any[]) => {
    setShowAssessment(false);
    
    // Generate personalized therapy plan based on answers
    const plan = generateTherapyPlan(selectedIssue, answers);
    setGeneratedPlan(plan);
    setShowPlanModal(true);
    
    // Save user progress
    const userProgress = {
      userId: user?.id,
      currentPlan: plan,
      startDate: new Date().toISOString(),
      completedTherapies: [],
      assessmentAnswers: answers
    };
    localStorage.setItem('mindcare_user_progress', JSON.stringify(userProgress));
    
    toast.success('Personalized therapy plan created!');
  };

  const generateTherapyPlan = (issue: string, answers: any[]): TherapyPlan => {
    const plans: { [key: string]: TherapyPlan } = {
      anxiety: {
        issue: 'Anxiety Disorders',
        severity: 'Moderate',
        planDuration: '8 weeks',
        recommendations: [
          {
            moduleId: 'mindfulness',
            title: 'Mindfulness & Breathing',
            description: 'Learn breathing techniques to manage anxiety in the moment',
            priority: 1,
            color: 'from-blue-500 to-cyan-500'
          },
          {
            moduleId: 'cbt',
            title: 'CBT Thought Records',
            description: 'Challenge anxious thoughts with evidence-based techniques',
            priority: 2,
            color: 'from-purple-500 to-pink-500'
          },
          {
            moduleId: 'exposure',
            title: 'Gradual Exposure',
            description: 'Gradually face fears in a safe, controlled way',
            priority: 3,
            color: 'from-orange-500 to-red-500'
          }
        ],
        dailyGoals: [
          'Practice 10 minutes of mindful breathing',
          'Complete one thought record',
          'Track anxiety levels in mood tracker'
        ],
        weeklyGoals: [
          'Complete 2-3 mindfulness sessions',
          'Practice one exposure exercise',
          'Schedule therapy session if needed'
        ],
        resources: [
          'Anxiety and Phobia Workbook',
          'Mindfulness apps for daily practice',
          'Emergency coping strategies card'
        ]
      },
      depression: {
        issue: 'Depression',
        severity: 'Moderate',
        planDuration: '12 weeks',
        recommendations: [
          {
            moduleId: 'cbt',
            title: 'CBT for Depression',
            description: 'Address negative thought patterns and behaviors',
            priority: 1,
            color: 'from-purple-500 to-pink-500'
          },
          {
            moduleId: 'gratitude',
            title: 'Gratitude Practice',
            description: 'Build positive thinking patterns through daily gratitude',
            priority: 2,
            color: 'from-green-500 to-teal-500'
          },
          {
            moduleId: 'video',
            title: 'Video Therapy',
            description: 'Professional guidance for depression management',
            priority: 3,
            color: 'from-blue-500 to-indigo-500'
          }
        ],
        dailyGoals: [
          'Write 3 things you\'re grateful for',
          'Complete one CBT thought record',
          'Engage in one pleasant activity'
        ],
        weeklyGoals: [
          'Watch 1-2 therapy videos',
          'Complete mood tracking daily',
          'Connect with support system'
        ],
        resources: [
          'Depression self-help workbook',
          'Mood tracking journal',
          'Crisis support hotline numbers'
        ]
      },
      stress: {
        issue: 'Stress Management',
        severity: 'Moderate',
        planDuration: '6 weeks',
        recommendations: [
          {
            moduleId: 'stress',
            title: 'Stress Management Techniques',
            description: 'Learn effective coping strategies for daily stress',
            priority: 1,
            color: 'from-red-500 to-pink-500'
          },
          {
            moduleId: 'mindfulness',
            title: 'Mindfulness Practice',
            description: 'Develop present-moment awareness to reduce stress',
            priority: 2,
            color: 'from-blue-500 to-cyan-500'
          },
          {
            moduleId: 'music',
            title: 'Relaxation Audio',
            description: 'Use therapeutic music for stress relief',
            priority: 3,
            color: 'from-purple-500 to-blue-500'
          }
        ],
        dailyGoals: [
          'Practice 15 minutes of relaxation',
          'Identify and log stress triggers',
          'Use one coping strategy when stressed'
        ],
        weeklyGoals: [
          'Complete stress management exercises',
          'Establish regular relaxation routine',
          'Review and adjust coping strategies'
        ],
        resources: [
          'Stress management workbook',
          'Relaxation audio library',
          'Quick stress relief techniques card'
        ]
      }
    };

    return plans[issue] || plans.anxiety;
  };

  const acceptPlan = () => {
    if (generatedPlan) {
      const botMessage: Message = {
        id: Date.now().toString(),
        text: `Perfect! I've created your personalized ${generatedPlan.issue} therapy plan. You can access your recommended therapies anytime from the Therapy Modules section. Remember, I'm here whenever you need support or have questions about your journey.`,
        sender: 'bot',
        timestamp: new Date(),
        type: 'plan',
        data: generatedPlan
      };
      
      setMessages(prev => [...prev, botMessage]);
      setShowPlanModal(false);
      toast.success('Therapy plan saved to your dashboard!');
    }
  };

  const getCurrentQuestion = () => {
    const questions = assessmentQuestions[selectedIssue] || [];
    return questions[currentQuestion];
  };

  const renderQuestionInput = (question: AssessmentQuestion) => {
    switch (question.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <textarea
              placeholder="Please share your thoughts and feelings in detail..."
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              onClick={() => {
                handleAssessmentAnswer(inputText);
                setInputText('');
              }}
              disabled={!inputText.trim()}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Next Question
            </button>
          </div>
        );
      
      case 'scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <motion.button
                  key={num}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleAssessmentAnswer(num)}
                  className={`w-10 h-10 rounded-full font-bold transition-all duration-200 ${
                    num <= 3 ? 'bg-green-500 hover:bg-green-600' :
                    num <= 6 ? 'bg-yellow-500 hover:bg-yellow-600' :
                    'bg-red-500 hover:bg-red-600'
                  } text-white`}
                >
                  {num}
                </motion.button>
              ))}
            </div>
            <div className="flex justify-between text-sm">
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Not at all</span>
              <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Extremely</span>
            </div>
          </div>
        );
      
      case 'multiple':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAssessmentAnswer(option)}
                className={`w-full p-3 text-left rounded-xl border transition-all duration-200 ${
                  theme === 'dark'
                    ? 'border-gray-600 bg-gray-700 hover:bg-gray-600 text-white'
                    : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50 text-gray-800'
                }`}
              >
                {option}
              </motion.button>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`h-screen flex flex-col ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      <div className="flex-1 flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className={`p-4 border-b ${
            theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          } shadow-lg`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  AI Mental Health Assistant
                </h1>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Your personal therapy companion
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-200'
                    : 'bg-white text-gray-800 shadow-lg'
                }`}>
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <div className={`flex items-center justify-between mt-2 ${
                    message.sender === 'user' ? 'text-purple-100' : 'text-gray-500'
                  }`}>
                    <span className="text-xs">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.sender === 'bot' && (
                      <Bot className="w-3 h-3" />
                    )}
                  </div>
                  
                  {message.type === 'suggestion' && (
                    <div className="mt-3 pt-3 border-t border-purple-200 dark:border-gray-600">
                      <p className="text-xs mb-2 opacity-80">Would you like to start an assessment?</p>
                      <div className="grid grid-cols-2 gap-2">
                        {mentalHealthIssues.slice(0, 4).map((issue) => (
                          <motion.button
                            key={issue.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => startAssessment(issue.id)}
                            className="px-2 py-1 bg-white bg-opacity-20 rounded-lg text-xs font-medium hover:bg-opacity-30 transition-all duration-200"
                          >
                            {issue.name}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className={`px-4 py-3 rounded-2xl ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-lg'
                }`}>
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className={`p-4 border-t ${
            theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}>
            <div className="flex space-x-3">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className={`flex-1 px-4 py-3 rounded-xl border ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage}
                disabled={!inputText.trim()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className={`w-80 border-l ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        } p-4`}>
          <h3 className={`text-lg font-semibold mb-4 ${
            theme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}>
            Quick Assessment
          </h3>
          <div className="space-y-3">
            {mentalHealthIssues.map((issue) => (
              <motion.button
                key={issue.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startAssessment(issue.id)}
                className={`w-full p-3 rounded-xl text-left transition-all duration-200 ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${issue.color} flex items-center justify-center`}>
                    <issue.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className={`font-medium ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      {issue.name}
                    </h4>
                    <p className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Get personalized help
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Assessment Modal */}
      <AnimatePresence>
        {showAssessment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`w-full max-w-4xl h-96 rounded-2xl shadow-2xl ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className={`text-xl font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      Question {currentQuestion + 1} of {assessmentQuestions[selectedIssue]?.length || 0}
                    </h3>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {mentalHealthIssues.find(i => i.id === selectedIssue)?.name}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAssessment(false)}
                    className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="mb-6">
                    <h4 className={`text-lg font-medium mb-4 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      {getCurrentQuestion()?.question}
                    </h4>
                    
                    <div className={`w-full h-2 rounded-full mb-6 ${
                      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                        style={{ width: `${((currentQuestion + 1) / (assessmentQuestions[selectedIssue]?.length || 1)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    {getCurrentQuestion() && renderQuestionInput(getCurrentQuestion())}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      currentQuestion === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  <span className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {currentQuestion + 1} / {assessmentQuestions[selectedIssue]?.length || 0}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Therapy Plan Modal */}
      <AnimatePresence>
        {showPlanModal && generatedPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`max-w-2xl w-full rounded-2xl shadow-2xl ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-2xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Your Personalized Therapy Plan
                  </h3>
                  <button
                    onClick={() => setShowPlanModal(false)}
                    className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className={`p-4 rounded-xl ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      Focus Area: {generatedPlan.issue}
                    </h4>
                    <p className={`text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Duration: {generatedPlan.planDuration} • Severity: {generatedPlan.severity}
                    </p>
                  </div>

                  <div>
                    <h4 className={`font-semibold mb-3 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}>
                      Recommended Therapies
                    </h4>
                    <div className="space-y-2">
                      {generatedPlan.recommendations.map((rec, index) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-3 p-3 rounded-lg ${
                            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${rec.color} flex items-center justify-center`}>
                            <Target className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h5 className={`font-medium ${
                              theme === 'dark' ? 'text-white' : 'text-gray-800'
                            }`}>
                              {rec.title}
                            </h5>
                            <p className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {rec.description}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                          }`}>
                            Priority {rec.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={acceptPlan}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300"
                    >
                      Accept Plan
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowPlanModal(false)}
                      className={`px-6 py-3 rounded-xl font-semibold ${
                        theme === 'dark'
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Review Later
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatbotPage;