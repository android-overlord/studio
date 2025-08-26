'use client';

import { useState, useEffect } from 'react';
import data from './perfume_database_expert_balanced.json';

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

const PerfumeQuizPage = () => {
  const [currentQuestion, setCurrentQuestion] = useState<keyof QuizAnswers>('personality');
  const [answers, setAnswers] = useState<QuizAnswers>({
    personality: null,
    occasion: null,
    climate: null,
    intensity: null,
  });
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [showResults, setShowResults] = useState(false);



  const handleAnswerSelect = (question: keyof QuizAnswers, answer: string) => {
    setAnswers({ ...answers, [question]: answer });
    // Move to the next question or show results
    const questions: (keyof QuizAnswers)[] = ['personality', 'occasion', 'climate', 'intensity'];
    const currentIndex = questions.indexOf(question);
    if (currentIndex < questions.length - 1) {
      setCurrentQuestion(questions[currentIndex + 1]);
    } else { // Last question, show results
      // Map answers from `answers` state to perfume categories based on user's mapping rules
      // e.g., if personality is 'Outgoing', map to Fresh / Citrus / Aquatic

      const matchedCategory = mapAnswersToCategory(answers);

      // Filter perfumes from `data` based on the matched category
      const filteredPerfumes = data.filter(perfume => perfume.family === matchedCategory || perfume.personality.includes(matchedCategory) || perfume.occasions.includes(matchedCategory));

      // Implement the recommendation logic here
      // Randomly select 1 primary and 2-3 alternatives from `filteredPerfumes`
      // Ensure there are enough perfumes in the filtered list before selecting

      if (filteredPerfumes.length > 0) {
          const primaryIndex = Math.floor(Math.random() * filteredPerfumes.length);
          const primary = filteredPerfumes[primaryIndex];

          const alternatives: Perfume[] = [];
          const alternativeIndices: Set<number> = new Set([primaryIndex]);

          while (alternatives.length < Math.min(filteredPerfumes.length - 1, 3)) {
              const randomIndex = Math.floor(Math.random() * filteredPerfumes.length);
              if (!alternativeIndices.has(randomIndex)) {
                  alternatives.push(filteredPerfumes[randomIndex]);
                  alternativeIndices.add(randomIndex);
              }
          }

          setRecommendation({ primary, alternatives });
          setShowResults(true);
      } else {
          setRecommendation({ primary: null, alternatives: [] });
          setShowResults(true);
      }
    }
  };

  // Placeholder function for mapping answers to categories - IMPLEMENT THIS BASED ON USER'S MAPPING RULES
  const mapAnswersToCategory = (answers: QuizAnswers): string => {
    // Example mapping (needs to be implemented based on your data and logic)
    if (answers.personality === 'Outgoing' && answers.climate === 'Summer') return 'Fresh / Citrus / Aquatic';
    if (answers.occasion === 'Date' && answers.intensity === 'Strong') return 'Spicy / Oriental';
    if (answers.personality === 'Bold') return 'Spicy / Oriental';
    if (answers.personality === 'Romantic') return 'Floral / Romantic';
    if (answers.personality === 'Calm') return 'Woody / Earthy';
    if (answers.occasion === 'Daily') return 'Fresh / Citrus / Aquatic';
    return 'Woody / Earthy'; // Default category
  };

  const renderQuestion = () => {
    switch (currentQuestion) {
      case 'personality':
        return (
          <div>
            <h2>Personality</h2>
            <div className="flex flex-wrap gap-2">
              {['Outgoing', 'Bold', 'Romantic', 'Calm', 'Luxury-focused'].map(option => (
                <button
                  key={option}
                  className={`px-4 py-2 rounded ${answers.personality === option ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                  onClick={() => handleAnswerSelect('personality', option as string)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 'occasion':
        return (
          <div>
            <h2>Occasion</h2>
            <div className="flex flex-wrap gap-2">
              {['Daily', 'Office', 'Date', 'Party', 'Special/Luxury'].map(option => (
                <button
                  key={option}
                  className={`px-4 py-2 rounded ${answers.occasion === option ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                  onClick={() => handleAnswerSelect('occasion', option as string)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 'climate':
        return (
          <div>
            <h2>Climate</h2>
            <div className="flex flex-wrap gap-2">
              {['Summer', 'Winter', 'Humid'].map(option => (
                <button
                  key={option}
                  className={`px-4 py-2 rounded ${answers.climate === option ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                  onClick={() => handleAnswerSelect('climate', option as string)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      case 'intensity':
        return (
          <div>
            <h2>Intensity</h2>
            <div className="flex flex-wrap gap-2">
              {['Light', 'Balanced', 'Strong'].map(option => (
                <button
                  key={option}
                  className={`px-4 py-2 rounded ${answers.intensity === option ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}
                  onClick={() => handleAnswerSelect('intensity', option as string)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">

      <h1 className="text-2xl font-bold mb-4">Personalized Perfume Quiz</h1>

      {!showResults && (
        <div className="space-y-4">
          {renderQuestion()}
        </div>
      )}

      {showResults && recommendation && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Your Perfume Recommendation</h2>
          {recommendation.primary && (
            <p className="text-lg mb-2">✨ Your Perfect Match: {recommendation.primary.name}</p>
          )}
          {recommendation.alternatives.length > 0 && (
            <p className="text-lg mb-2">🌿 Alternatives You’ll Love: {recommendation.alternatives.map(p => p.name).join(', ')}</p>
          )}
          {/* Placeholder for explanation - NEEDS IMPLEMENTATION */}
          <p className="text-lg italic">💡 Why These Suit You: [Explanation based on matched category and perfume]</p>
        </div>
      )}
       {showResults && !recommendation?.primary && (
           <div className="mt-8">
               <h2 className="text-xl font-semibold mb-4">No Recommendation Found</h2>
               <p>Based on your answers, we couldn't find a perfect match in our current catalogue. Please try again or adjust your preferences.</p>
           </div>
       )}
    </div>
  );
};

export default PerfumeQuizPage;
