// components/GrammarChecker.jsx - AI-powered grammar and spelling checker
'use client'

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Lightbulb, RotateCw } from 'lucide-react';
import { aiPdfProcessor } from '../lib/aiPdfProcessor';

export default function GrammarChecker({ text, onApplyCorrection, onClose }) {
  const [isChecking, setIsChecking] = useState(false);
  const [results, setResults] = useState(null);
  const [appliedCorrections, setAppliedCorrections] = useState([]);

  useEffect(() => {
    if (text) {
      checkGrammar();
    }
  }, [text]);

  const checkGrammar = async () => {
    setIsChecking(true);
    try {
      const results = await aiPdfProcessor.checkGrammarAndSpelling(text);
      setResults(results);
    } catch (error) {
      console.error('Grammar check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleApplyCorrection = (correction) => {
    onApplyCorrection(correction);
    setAppliedCorrections([...appliedCorrections, correction]);
  };

  const handleApplyAll = () => {
    if (results && results.corrections) {
      results.corrections.forEach(correction => {
        if (!appliedCorrections.includes(correction)) {
          onApplyCorrection(correction);
        }
      });
      setAppliedCorrections(results.corrections);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'spelling': return 'text-red-600 bg-red-50';
      case 'grammar': return 'text-orange-600 bg-orange-50';
      case 'style': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'spelling': return <XCircle className="w-4 h-4" />;
      case 'grammar': return <AlertTriangle className="w-4 h-4" />;
      case 'style': return <Lightbulb className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Checking Grammar...</h3>
            <p className="text-sm text-gray-600">AI is analyzing your content for errors and improvements</p>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Grammar & Spelling Check</h2>
                <p className="text-sm text-gray-600 mt-1">
                  AI-powered analysis of your content
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
              >
                ×
              </button>
            </div>
          </div>

          {/* Overall Score */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{results.overallScore}</div>
                <div className="text-sm text-gray-600 mt-1">Overall Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {results.corrections?.length || 0}
                </div>
                <div className="text-sm text-gray-600 mt-1">Issues Found</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {appliedCorrections.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Fixed</div>
              </div>
            </div>

            {results.readabilityLevel && (
              <div className="mt-4 text-center">
                <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-gray-700">
                  Readability: {results.readabilityLevel}
                </span>
              </div>
            )}
          </div>

          {/* Corrections List */}
          <div className="p-6">
            {results.corrections && results.corrections.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Suggested Corrections</h3>
                  <button
                    onClick={handleApplyAll}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                  >
                    Apply All Corrections
                  </button>
                </div>

                <div className="space-y-3">
                  {results.corrections.map((correction, index) => {
                    const isApplied = appliedCorrections.includes(correction);
                    
                    return (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 transition-all ${
                          isApplied ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 rounded text-xs font-medium flex items-center space-x-1 ${getTypeColor(correction.type)}`}>
                                {getTypeIcon(correction.type)}
                                <span className="capitalize">{correction.type}</span>
                              </span>
                              {isApplied && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium flex items-center space-x-1">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Applied</span>
                                </span>
                              )}
                            </div>

                            <div className="mb-2">
                              <div className="text-sm text-gray-600 mb-1">Original:</div>
                              <div className="bg-red-50 border-l-4 border-red-400 p-2 text-sm">
                                {correction.original}
                              </div>
                            </div>

                            <div className="mb-2">
                              <div className="text-sm text-gray-600 mb-1">Suggested:</div>
                              <div className="bg-green-50 border-l-4 border-green-400 p-2 text-sm">
                                {correction.corrected}
                              </div>
                            </div>

                            {correction.explanation && (
                              <div className="text-xs text-gray-600 mt-2 flex items-start">
                                <Lightbulb className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                                <span>{correction.explanation}</span>
                              </div>
                            )}
                          </div>

                          <div className="ml-4 flex flex-col space-y-2">
                            {!isApplied ? (
                              <>
                                <button
                                  onClick={() => handleApplyCorrection(correction)}
                                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => setAppliedCorrections([...appliedCorrections, correction])}
                                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setAppliedCorrections(appliedCorrections.filter(c => c !== correction))}
                                className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors flex items-center"
                              >
                                <RotateCw className="w-3 h-3 mr-1" />
                                Undo
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Excellent! No Issues Found
                </h3>
                <p className="text-gray-600">
                  Your content looks great with no grammar or spelling errors detected.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <button
                onClick={checkGrammar}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded transition-colors flex items-center"
              >
                <RotateCw className="w-4 h-4 mr-2" />
                Re-check
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}