'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';

interface FAQ {
  domanda: string;
  risposta: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {faqs.map((faq, idx) => (
        <Card
          key={idx}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-gray-900 pr-4">
                {faq.domanda}
              </CardTitle>
              <ChevronDown
                className={`w-5 h-5 text-blue-600 flex-shrink-0 transition-transform ${
                  expandedFaq === idx ? 'rotate-180' : ''
                }`}
              />
            </div>
          </CardHeader>
          {expandedFaq === idx && (
            <CardContent className="pt-0 border-t">
              <p className="text-gray-600 mt-4">{faq.risposta}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
