
'use client';

import { useState } from 'react';
import data from './perfume_database_expert_balanced.json';
import Image from 'next/image';
import perfumeImages from '@/images.json';

type Perfume = {
  name: string;
  family: string;
  personality: string[];
  occasions: string[];
  intensity: string;
};

type QuizAnswers = {
  personality: string | null;
  occasion: string | null;
  climate: string | null;
  intensity: string | null;
};

type Recommendation = {
  primary: Perfume | null;
  alternatives: Perfume[];
};

const getPerfumeImage = (perfumeName: string) => {
  const images = perfumeImages as Record<string, string>;
  const imageName = Object.keys(images).find(key => images[key] === perfumeName);

  if (imageName) {
    return `/images/${imageName}`;
  }

  // Fallback if a perfume is not in the JSON file.
  const seed = perfumeName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://picsum.photos/seed/${seed}/100/100`;
};


const PerfumeQuizPage = () => {
  const [answers, setAnswers] = useState<QuizAnswers>({
    personality: null,
    occasion: null,
    climate: null,
    intensity: null,
  });
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [showResults, setShowResults] = useState(false);
  
  const questions: (keyof QuizAnswers)[] = ['personality', 'occasion', 'climate', 'intensity'];
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (question: keyof QuizAnswers, answer: string) => {
    const newAnswers = { ...answers, [question]: answer };
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const matchedCategory = mapAnswersToCategory(newAnswers);
      const filteredPerfumes = data.filter(perfume => perfume.family === matchedCategory || perfume.personality.includes(matchedCategory) || perfume.occasions.includes(matchedCategory));

      if (filteredPerfumes.length > 0) {
        const uniquePerfumes = Array.from(new Map(filteredPerfumes.map(p => [p.name, p])).values());
        
        const primaryIndex = Math.floor(Math.random() * uniquePerfumes.length);
        const primary = uniquePerfumes[primaryIndex];

        const alternatives: Perfume[] = [];
        const alternativeIndices: Set<number> = new Set([primaryIndex]);

        while (alternatives.length < Math.min(uniquePerfumes.length - 1, 3)) {
          const randomIndex = Math.floor(Math.random() * uniquePerfumes.length);
          if (!alternativeIndices.has(randomIndex)) {
            alternatives.push(uniquePerfumes[randomIndex]);
            alternativeIndices.add(randomIndex);
          }
        }
        setRecommendation({ primary, alternatives });
      } else {
        setRecommendation({ primary: null, alternatives: [] });
      }
      setShowResults(true);
    }
  };

  const mapAnswersToCategory = (answers: QuizAnswers): string => {
    if (answers.personality === 'Outgoing' && answers.climate === 'Summer') return 'Fresh / Citrus / Aquatic';
    if (answers.occasion === 'Date' && answers.intensity === 'Strong') return 'Spicy / Oriental';
    if (answers.personality === 'Bold') return 'Spicy / Oriental';
    if (answers.personality === 'Romantic') return 'Floral / Romantic';
    if (answers.personality === 'Calm') return 'Woody / Earthy';
    if (answers.occasion === 'Daily') return 'Fresh / Citrus / Aquatic';
    return 'Woody / Earthy';
  };

  const renderQuestion = () => {
    let questionText = '';
    let options: string[] = [];

    switch (currentQuestion) {
      case 'personality':
        questionText = "Which word best describes your personality?";
        options = ['Outgoing', 'Bold', 'Romantic', 'Calm', 'Luxury-focused'];
        break;
      case 'occasion':
        questionText = "What's the primary occasion you'll wear this scent for?";
        options = ['Daily', 'Office', 'Date', 'Party', 'Special/Luxury'];
        break;
      case 'climate':
        questionText = "What's the climate like where you live?";
        options = ['Summer', 'Winter', 'Humid'];
        break;
      case 'intensity':
        questionText = "How strong do you like your perfume?";
        options = ['Light', 'Balanced', 'Strong'];
        break;
      default:
        return null;
    }

    return (
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">{questionText}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {options.map(option => (
            <button
              key={option}
              className={`w-full py-4 px-6 rounded-full text-lg font-semibold transition-transform transform hover:scale-105
                ${answers[currentQuestion] === option 
                  ? 'bg-pink-500 text-white shadow-lg' 
                  : 'bg-neutral-800 text-neutral-200 hover:bg-neutral-700'}`}
              onClick={() => handleAnswerSelect(currentQuestion, option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  const progress = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
      
      {!showResults && (
        <div className="w-full max-w-2xl">
          <div className="w-full bg-neutral-700 rounded-full h-2.5 mb-8">
            <div className="bg-pink-500 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
          </div>
          {renderQuestion()}
        </div>
      )}

      {showResults && (
        <div className="w-full max-w-3xl text-center bg-neutral-800 p-8 rounded-lg shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 text-pink-400">Your Personalised Recommendations</h2>
          {recommendation?.primary ? (
            <div>
              <div className="mb-8">
                <h3 className="text-2xl font-semibold mb-4 border-b border-neutral-700 pb-2">✨ Your Perfect Match</h3>
                <div className="flex items-center justify-center gap-4 bg-neutral-700 p-4 rounded-lg">
                   <Image src={getPerfumeImage(recommendation.primary.name)} alt={recommendation.primary.name} width={80} height={80} className="rounded-md" />
                   <p className="text-xl font-bold">{recommendation.primary.name}</p>
                </div>
              </div>

              {recommendation.alternatives.length > 0 && (
                 <div>
                   <h3 className="text-2xl font-semibold mb-4 border-b border-neutral-700 pb-2">🌿 Alternatives You’ll Love</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                     {recommendation.alternatives.map(p => (
                       <div key={p.name} className="flex flex-col items-center gap-2 bg-neutral-700 p-4 rounded-lg">
                         <Image src={getPerfumeImage(p.name)} alt={p.name} width={60} height={60} className="rounded-md" />
                         <p className="text-md font-semibold text-center">{p.name}</p>
                       </div>
                     ))}
                   </div>
                 </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-semibold mb-4">No Recommendation Found</h2>
              <p>Based on your answers, we couldn't find a perfect match. Please try the quiz again with different preferences.</p>
            </div>
          )}
           <div className="flex justify-center gap-4 mt-8">
            <button 
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestionIndex(0);
                  setAnswers({ personality: null, occasion: null, climate: null, intensity: null });
                  setRecommendation(null);
                }}
                className="px-8 py-3 bg-pink-500 text-white font-semibold rounded-full shadow-lg hover:bg-pink-600 transition-colors duration-300"
              >
                Take the Quiz Again
              </button>
              <a
                href="https://www.instagram.com/creski.shop"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-full shadow-lg hover:bg-purple-700 transition-colors duration-300 inline-flex items-center"
              >
                Order Now
              </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerfumeQuizPage;
