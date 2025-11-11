import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from './Icons';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQPageProps {
  onBack: () => void;
}

const FAQPage: React.FC<FAQPageProps> = ({ onBack }) => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0); // Open first question by default

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await fetch('/faq.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setFaqs(data.faqs); // Now we expect an array
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load FAQs');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="container mx-auto p-4 flex-grow">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">שאלות ותשובות</h1>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition font-semibold"
          >
            חזרה
          </button>
        </div>

        {isLoading && <div className="text-center p-10 text-gray-500">טוען...</div>}
        {error && (
            <div className="text-center p-10 bg-red-100 text-red-700 rounded-md">
                <h3 className="font-bold">שגיאה בטעינת הנתונים</h3>
                <pre className="mt-2 text-sm whitespace-pre-wrap">{error}</pre>
            </div>
        )}
        {!isLoading && !error && (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 last:border-b-0 bg-white shadow-sm rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-4 text-right"
                >
                  <span className="font-bold text-lg text-gray-800">{faq.question}</span>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div
                    className="p-4 pt-0 text-gray-600 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default FAQPage;