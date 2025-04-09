"use client"
import { use,
useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [inputs, setInputs] = useState({
    throttlePosition: 50,
    gear: 3,
  });
  
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputs),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get predictions');
      }
      
      const data = await response.json();
      setPredictions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Engine Performance Predictor</title>
        <meta name="description" content="Predict engine performance metrics" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Engine Performance Predictor</h1>
            <p className="mt-2 text-gray-600">Enter throttle position and gear to predict engine performance</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="throttlePosition" className="block text-sm font-medium text-gray-700">
                Throttle Position ({inputs.throttlePosition}%)
              </label>
              <input
                type="range"
                id="throttlePosition"
                name="throttlePosition"
                min="0"
                max="100"
                value={inputs.throttlePosition}
                onChange={handleInputChange}
                className="mt-1 block w-full"
              />
            </div>
            
            <div>
              <label htmlFor="gear" className="block text-sm font-medium text-gray-700">
                Gear
              </label>
              <select
                id="gear"
                name="gear"
                value={inputs.gear}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
                <option value={5}>5</option>
              </select>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Predicting...' : 'Predict'}
              </button>
            </div>
          </form>
          
          {error && (
            <div className="mt-6 p-4 bg-red-100 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {predictions && (
            <div className="mt-8">
              <h2 className="text-lg font-medium text-gray-900">Predictions</h2>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm font-medium text-gray-500">RPM</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{predictions.rpm}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm font-medium text-gray-500">Torque (Nm)</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{predictions.torque}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm font-medium text-gray-500">Power (HP)</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{predictions.power}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm font-medium text-gray-500">Fuel Efficiency (MPG)</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">{predictions.efficiency}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}