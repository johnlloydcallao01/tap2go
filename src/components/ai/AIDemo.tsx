'use client';

import React, { useState } from 'react';
import { useAI, useRestaurantAI, useMenuAI } from '@/hooks/useAI';

export default function AIDemo() {
  const [activeTab, setActiveTab] = useState<'text' | 'restaurant' | 'menu'>('text');
  
  // General text generation
  const { generateText, loading: textLoading, error: textError } = useAI();
  const [prompt, setPrompt] = useState('');
  const [textResult, setTextResult] = useState('');

  // Restaurant description
  const { generateDescription: generateRestaurantDesc, loading: restaurantLoading, error: restaurantError } = useRestaurantAI();
  const [restaurantName, setRestaurantName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [restaurantResult, setRestaurantResult] = useState('');

  // Menu item description
  const { generateDescription: generateMenuDesc, loading: menuLoading, error: menuError } = useMenuAI();
  const [itemName, setItemName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [menuCuisine, setMenuCuisine] = useState('');
  const [menuResult, setMenuResult] = useState('');

  const handleTextGeneration = async () => {
    if (!prompt.trim()) return;
    
    try {
      const result = await generateText(prompt);
      setTextResult(result);
    } catch (error) {
      console.error('Text generation failed:', error);
    }
  };

  const handleRestaurantGeneration = async () => {
    if (!restaurantName.trim() || !cuisine.trim() || !specialties.trim()) return;
    
    try {
      const result = await generateRestaurantDesc({
        name: restaurantName,
        cuisine: cuisine,
        specialties: specialties.split(',').map(s => s.trim()),
      });
      setRestaurantResult(result);
    } catch (error) {
      console.error('Restaurant description generation failed:', error);
    }
  };

  const handleMenuGeneration = async () => {
    if (!itemName.trim() || !ingredients.trim() || !menuCuisine.trim()) return;
    
    try {
      const result = await generateMenuDesc({
        name: itemName,
        ingredients: ingredients.split(',').map(s => s.trim()),
        cuisine: menuCuisine,
      });
      setMenuResult(result);
    } catch (error) {
      console.error('Menu description generation failed:', error);
    }
  };

  const tabs = [
    { id: 'text', label: 'Text Generation', icon: '✨' },
    { id: 'restaurant', label: 'Restaurant Description', icon: '🏪' },
    { id: 'menu', label: 'Menu Description', icon: '🍽️' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        🤖 Google AI Studio (Gemini) Integration Demo
      </h1>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'text' | 'restaurant' | 'menu')}
            className={`flex items-center px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white border-b-2 border-blue-500'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Text Generation Tab */}
      {activeTab === 'text' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">General Text Generation</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your prompt:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter any prompt for text generation..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>

          <button
            onClick={handleTextGeneration}
            disabled={textLoading || !prompt.trim()}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {textLoading ? 'Generating...' : 'Generate Text'}
          </button>

          {textError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              Error: {textError}
            </div>
          )}

          {textResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium text-green-800 mb-2">Generated Text:</h3>
              <p className="text-green-700 whitespace-pre-wrap">{textResult}</p>
            </div>
          )}
        </div>
      )}

      {/* Restaurant Description Tab */}
      {activeTab === 'restaurant' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Restaurant Description Generator</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name:
              </label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="e.g., Mama's Kitchen"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine Type:
              </label>
              <input
                type="text"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                placeholder="e.g., Italian, Filipino, Japanese"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specialties (comma-separated):
            </label>
            <input
              type="text"
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
              placeholder="e.g., wood-fired pizza, fresh pasta, tiramisu"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleRestaurantGeneration}
            disabled={restaurantLoading || !restaurantName.trim() || !cuisine.trim() || !specialties.trim()}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {restaurantLoading ? 'Generating...' : 'Generate Description'}
          </button>

          {restaurantError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              Error: {restaurantError}
            </div>
          )}

          {restaurantResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium text-green-800 mb-2">Generated Restaurant Description:</h3>
              <p className="text-green-700">{restaurantResult}</p>
            </div>
          )}
        </div>
      )}

      {/* Menu Description Tab */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Menu Item Description Generator</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Name:
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g., Chicken Adobo"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine Type:
              </label>
              <input
                type="text"
                value={menuCuisine}
                onChange={(e) => setMenuCuisine(e.target.value)}
                placeholder="e.g., Filipino"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Ingredients (comma-separated):
            </label>
            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="e.g., chicken, soy sauce, vinegar, garlic, bay leaves"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleMenuGeneration}
            disabled={menuLoading || !itemName.trim() || !ingredients.trim() || !menuCuisine.trim()}
            className="bg-purple-500 text-white px-6 py-2 rounded-md hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {menuLoading ? 'Generating...' : 'Generate Description'}
          </button>

          {menuError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              Error: {menuError}
            </div>
          )}

          {menuResult && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium text-green-800 mb-2">Generated Menu Description:</h3>
              <p className="text-green-700">{menuResult}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
        <p>
          🚀 Powered by Google AI Studio (Gemini) • 
          <span className="ml-2">Free tier: 500-1,000 requests/day</span>
        </p>
      </div>
    </div>
  );
}
