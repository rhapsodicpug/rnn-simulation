import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Award, Play } from "lucide-react";
import AnimatedTitle from "../components/AnimatedTitle";

// NEW: Data is now structured as an array of question sets.
const allQuizSets = [
  // --- Set 1: Foundational Concepts ---
  [
    {
      question: "What is the core purpose of a Recurrent Neural Network (RNN)?",
      options: [
        "To classify static images",
        "To process sequences of data by maintaining a memory",
        "To perform calculations faster than a regular CPU",
        "To store data in a traditional database",
      ],
      correctAnswer: 1,
      rationale: "RNNs are specifically designed for sequential data (like text or time series) by using loops that allow information to persist.",
    },
    {
      question: "The process of breaking a sentence into individual words or sub-words is called:",
      options: ["Vectorization", "Embedding", "Tokenization", "Normalization"],
      correctAnswer: 2,
      rationale: "Tokenization is the crucial first step in processing text, where a string is converted into a sequence of smaller units, or 'tokens'.",
    },
    {
      question: "What is the primary role of the 'Encoder' in an Encoder-Decoder model?",
      options: [
        "To generate the final translated text",
        "To compress the input sequence into a fixed-size context vector",
        "To check the input text for spelling errors",
        "To apply a visual theme to the output",
      ],
      correctAnswer: 1,
      rationale: "The Encoder's job is to read the entire input sequence and distill its meaning into a single numerical representation called the context vector.",
    },
    {
      question: "What does the 'Decoder' component do?",
      options: [
        "It reads the context vector to generate an output sequence token by token",
        "It discards the context vector and starts fresh",
        "It only decodes encrypted messages",
        "It compresses the output text into a smaller file",
      ],
      correctAnswer: 0,
      rationale: "The Decoder takes the context vector from the Encoder and uses it as a starting point to generate the output sequence one step at a time.",
    },
    {
      question: "What is a major limitation that simple RNNs face?",
      options: [
        "They are too slow to run on modern computers",
        "They cannot process numbers, only text",
        "The Vanishing Gradient Problem",
        "They require an internet connection to function",
      ],
      correctAnswer: 2,
      rationale: "Simple RNNs struggle to learn dependencies in long sequences due to the vanishing gradient problem, which LSTMs were designed to solve.",
    },
  ],
  // --- Set 2: LSTM Internals ---
  [
    {
      question: "Which LSTM gate decides what proportion of the long-term memory to discard?",
      options: ["Input Gate", "Output Gate", "Forget Gate", "Memory Gate"],
      correctAnswer: 2,
      rationale: "The Forget Gate outputs a number between 0 and 1 for each piece of information in the cell state, deciding what is irrelevant and can be forgotten.",
    },
    {
      question: "What mathematical function is essential for LSTM gates to work?",
      options: [
        "ReLU (Rectified Linear Unit)",
        "Sigmoid",
        "Linear",
        "Cosine",
      ],
      correctAnswer: 1,
      rationale: "The Sigmoid function squashes values to a [0, 1] range, making it perfect for gates that control the flow of information (0 = block all, 1 = let all through).",
    },
    {
      question: "The 'Cell State' in an LSTM can be thought of as the network's:",
      options: [
        "Short-term memory",
        "Long-term memory",
        "Output prediction",
        "CPU cache",
      ],
      correctAnswer: 1,
      rationale: "The cell state acts as a conveyor belt, carrying relevant information through the entire sequence, representing the network's long-term memory.",
    },
    {
      question: "What is the role of the 'Output Gate'?",
      options: [
        "To decide what new information to add",
        "To determine the final output of the entire sequence",
        "To control which part of the cell state is exposed as the output at the current time step",
        "To forget the entire cell state",
      ],
      correctAnswer: 2,
      rationale: "The Output Gate acts as a filter on the long-term memory (cell state) to produce the hidden state and the final prediction for that specific step.",
    },
    {
      question: "Why is an LSTM better at handling long-term dependencies than a simple RNN?",
      options: [
        "It has more layers",
        "It processes text backwards",
        "Its gating mechanisms provide a better way to control information flow",
        "It uses less memory",
      ],
      correctAnswer: 2,
      rationale: "The gates explicitly allow the LSTM to add, remove, or keep information, preventing older signals from vanishing during processing.",
    },
  ],
  // --- Set 3: Modern Concepts ---
  [
    {
      question: "Modern systems like Google Translate have largely replaced LSTMs with which architecture?",
      options: ["Deep Belief Network (DBN)", "Transformer", "Support Vector Machine (SVM)", "Convolutional Neural Network (CNN)"],
      correctAnswer: 1,
      rationale: "The Transformer architecture, introduced in 2017, uses a mechanism called 'self-attention' which has proven more effective than RNNs for many tasks.",
    },
    {
      question: "What is the key mechanism in the Transformer architecture that solved the RNN's bottleneck problem?",
      options: ["Gating", "Recurrence", "Attention", "Convolution"],
      correctAnswer: 2,
      rationale: "The Attention mechanism allows the model to dynamically focus on all parts of the input sequence simultaneously, rather than relying on a single context vector.",
    },
    {
      question: "In this app, the actual translation is performed by:",
      options: [
        "An LSTM model running in your browser",
        "An API call to a large language model (Gemini)",
        "A pre-trained model downloaded to the page",
        "A simple dictionary lookup",
      ],
      correctAnswer: 1,
      rationale: "This simulation visualizes the *process* of an RNN, but for accuracy, it uses an API call to Google's powerful Gemini model to get the actual translation.",
    },
    {
      question: "What is a 'Word Embedding'?",
      options: [
        "A special font for displaying text",
        "A dense vector representation of a word's meaning",
        "An animation of a word appearing on screen",
        "The box that contains the word in the UI",
      ],
      correctAnswer: 1,
      rationale: "Embeddings are learned numerical vectors where words with similar meanings have similar vector representations, allowing the model to understand relationships.",
    },
    {
      question: "What is the typical first input to a Decoder to begin generating a sentence?",
      options: [
        "A special <START> token",
        "A random word",
        "The first word of the input sentence",
        "A vector of all zeros",
      ],
      correctAnswer: 0,
      rationale: "The decoder is prompted with a special 'Start of Sequence' (<SOS>) token to begin generating the output. The output of each step is then fed as the input to the next.",
    },
  ],
  // --- Set 4: Technical Details ---
  [
    {
      question: "What is the term for a single pass of the entire training dataset through the neural network?",
      options: ["A Step", "An Iteration", "An Epoch", "A Batch"],
      correctAnswer: 2,
      rationale: "An epoch is one complete cycle through the full training dataset. It is a common hyperparameter in training neural networks."
    },
    {
      question: "The function used to calculate the difference between the model's prediction and the actual answer is called:",
      options: ["Loss Function", "Activation Function", "Optimizer", "Learning Rate"],
      correctAnswer: 0,
      rationale: "A loss function (or cost function) quantifies how wrong the model's prediction is. The goal of training is to minimize this value."
    },
    {
      question: "Which of these is a common optimizer used to train neural networks?",
      options: ["Sigmoid", "Adam", "Dropout", "ReLU"],
      correctAnswer: 1,
      rationale: "Adam is an adaptive learning rate optimization algorithm that's widely used for its effectiveness and efficiency in training deep neural networks."
    },
    {
      question: "A technique to prevent model overfitting by randomly ignoring some neurons during training is called:",
      options: ["Regularization", "Normalization", "Pruning", "Dropout"],
      correctAnswer: 3,
      rationale: "Dropout is a regularization technique where a random subset of neurons are 'dropped' at each training step, forcing the network to be more robust."
    },
    {
      question: "The hyperparameter that controls how much the model's weights are adjusted with respect to the loss gradient is the:",
      options: ["Batch Size", "Learning Rate", "Number of Epochs", "Momentum"],
      correctAnswer: 1,
      rationale: "The learning rate determines the step size at each iteration while moving toward a minimum of a loss function. It's a critical parameter to tune."
    }
  ]
];

const QuestionnairePage = () => {
  const [quizState, setQuizState] = useState("idle"); // 'idle', 'playing', 'answered', 'finished'
  const [activeQuiz, setActiveQuiz] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);

  const handleStartQuiz = () => {
    // Select a random set of questions
    const randomSetIndex = Math.floor(Math.random() * allQuizSets.length);
    setActiveQuiz(allQuizSets[randomSetIndex]);

    // Reset all states
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizState("playing");
  };

  const handleAnswerSelect = (optionIndex) => {
    if (quizState !== "playing") return;

    setSelectedAnswer(optionIndex);
    setQuizState("answered");

    if (optionIndex === activeQuiz[currentQuestionIndex].correctAnswer) {
      setScore((prevScore) => prevScore + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeQuiz.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
      setSelectedAnswer(null);
      setQuizState("playing");
    } else {
      setQuizState("finished");
    }
  };

  const currentQuestion = activeQuiz[currentQuestionIndex];

  return (
    <div className="content-text">
      <h2>Knowledge Check</h2>

      <AnimatePresence mode="wait">
        {quizState === "idle" && (
          <motion.div
            key="start"
            className="quiz-results" // Re-using results style for the start screen
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3>Test Your Knowledge</h3>
            <p className="results-score">
              You will be presented with a random set of 5 questions.
            </p>
            <button className="button" onClick={handleStartQuiz}>
              <Play size={18} style={{marginRight: '0.5rem'}}/>
              Start Quiz
            </button>
          </motion.div>
        )}

        {quizState === "finished" && (
          <motion.div
            key="results"
            className="quiz-results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Award size={64} className="results-icon" />
            <h3>Quiz Complete!</h3>
            <p className="results-score">
              You scored {score} out of {activeQuiz.length}
            </p>
            <button className="button" onClick={handleStartQuiz}>
              Try Another Set
            </button>
          </motion.div>
        )}

        {(quizState === "playing" || quizState === "answered") && (
          <motion.div
            key={currentQuestionIndex}
            className="quiz-container"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <p className="quiz-progress">
              Question {currentQuestionIndex + 1} of {activeQuiz.length}
            </p>
            <h3 className="quiz-question">{currentQuestion.question}</h3>
            <div className="quiz-options">
              {currentQuestion.options.map((option, index) => {
                const isCorrect = index === currentQuestion.correctAnswer;
                const isSelected = index === selectedAnswer;
                let buttonClass = "quiz-option-button";
                if (quizState === "answered") {
                  if (isCorrect) buttonClass += " correct";
                  else if (isSelected) buttonClass += " incorrect";
                }
                return (
                  <button
                    key={index}
                    className={buttonClass}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={quizState === "answered"}
                  >
                    <span>{option}</span>
                    {quizState === "answered" && isCorrect && <CheckCircle size={20} />}
                    {quizState === "answered" && isSelected && !isCorrect && <XCircle size={20} />}
                  </button>
                );
              })}
            </div>
            <AnimatePresence>
              {quizState === "answered" && (
                <motion.div
                  className="quiz-feedback"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p>{currentQuestion.rationale}</p>
                  <button className="button" onClick={handleNextQuestion}>
                    {currentQuestionIndex < activeQuiz.length - 1 ? "Next Question" : "Finish Quiz"}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionnairePage;