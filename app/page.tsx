"use client";
import { use, useState } from "react";
import Head from "next/head";

export default function Home() {
  const [inputs, setInputs] = useState({
    throttle_pos: 50,
    gear: 3,
  });

  interface Predictions {
    engine_parameters: {
      ENGINE_RPM: number;
      IntakeGasMassFlow: number;
      FuelMassFlow: number;
      AirFuelRatio: number;
    };
    final_outputs: {
      EngineTorque: number;
      PowerTransferred: number;
      Efficiency: number;
      BSFC: number;
      PowerFromFuel: number;
    };
  }

  const [predictions, setPredictions] = useState<Predictions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e:any) => {
    const { name, value } = e.target;
    setInputs({
      ...inputs,
      [name]: name === "gear" ? parseInt(value) : parseFloat(value),
    });
  };

  const handleGearSelect = (gear:any) => {
    setInputs({
      ...inputs,
      gear,
    });
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // http://127.0.0.1:8000/predict
      const response = await fetch("https://lbp-webapp-backend.onrender.com/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inputs),
      });

      if (!response.ok) {
        throw new Error("Failed to get predictions");
      }

      const data = await response.json();
      setPredictions(data);
    } catch (err:any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 py-8 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Engine Performance Predictor</title>
        <meta name="description" content="Predict engine performance metrics" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-full mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Engine Performance Predictor
            </h1>
            <p className="text-gray-800">
              (for 1.4 L 4-cylinder SI engine)
            </p>
            <p className="text-gray-600">
              Enter throttle position and gear to predict detailed engine performance metrics
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Controls Section - 5 columns */}
            <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Throttle Control - Vertical */}
              <div className="bg-gray-50 p-6 rounded-lg flex flex-col items-center h-80 relative">
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Throttle Position
                </label>
                
                <div className="flex-1 flex items-center justify-center w-full relative">
                  <div className="h-full w-20 bg-black bg-opacity-30">
                    <div className="absolute -left-7 top-0 text-xs text-gray-700 font-medium">100%</div>
                    <div className="absolute -left-6 top-1/2 -translate-y-1/2 text-xs text-gray-700 font-medium">50%</div>
                    <div className="absolute -left-5 bottom-0 text-xs text-gray-700 font-medium">0%</div>
                    
                    <div className="absolute inset-0 flex flex-col justify-end items-center">
                      <div 
                        className="w-20 bg-gradient-to-t from-green-500 via-yellow-400 to-red-500"
                        style={{ height: `${inputs.throttle_pos}%` }}
                      ></div>
                    </div>
                    
                    {/* Indicator line */}
                    <div 
                      className="absolute w-20 h-2 bg-white border-y-2 border-gray-800 shadow-md flex items-center justify-end"
                      style={{ bottom: `${inputs.throttle_pos}%` }}
                    >
                      <div className="w-3 h-6 bg-gray-800 absolute -right-3 rounded-r"></div>
                    </div>
                  </div>
                  
                  <input
                    type="range"
                    id="throttle_pos"
                    name="throttle_pos"
                    min="0"
                    max="100"
                    value={inputs.throttle_pos}
                    onChange={handleInputChange}
                    className="absolute h-full w-20 appearance-none bg-transparent cursor-pointer opacity-0"
                    style={{ WebkitAppearance: "slider-vertical" }}
                  />
                </div>
                
                <div className="mt-4 text-center">
                  <span className="text-2xl font-bold text-blue-600">{inputs.throttle_pos}%</span>
                </div>
              </div>

              {/* Gear Selector - List */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">
                  Select Gear
                </h3>
                
                <div className="grid grid-cols-1 gap-3">
                  {[0,1, 2, 3, 4, 5].map((gear) => (
                    <button
                      key={gear}
                      type="button"
                      onClick={() => handleGearSelect(gear)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        inputs.gear === gear
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-300 bg-white hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-gray-500">{gear === 0 ? "Neutral" : `Gear ${gear}`}</span>
                        {inputs.gear === gear && (
                          <span className="text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="md:col-span-2 bg-gray-50 p-6 rounded-lg">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Predicting...
                    </span>
                  ) : (
                    "Predict Performance"
                  )}
                </button>
              </div>
            </div>
            
            {/* Results Section - 7 columns */}
            <div className="lg:col-span-7">
              {error && (
                <div className="p-4 mb-6 bg-red-50 rounded-md border border-red-200">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              )}
              
              {!predictions && !loading && (
                <div className="h-full flex items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No predictions yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Adjust throttle and gear, then click predict</p>
                  </div>
                </div>
              )}
              
              {loading && (
                <div className="h-full flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <svg className="animate-spin mx-auto h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Calculating engine metrics...</h3>
                  </div>
                </div>
              )}

              {predictions && !loading && (
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Engine Performance Results</h2>
                  
                  <div className="space-y-6">
                    {/* Key Performance Metrics */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-3 pb-1 border-b border-gray-200">Key Performance Metrics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded-md border border-blue-100 hover:shadow-md transition-shadow duration-200">
                          <p className="text-sm font-medium text-blue-700">RPM</p>
                          <p className="mt-1 text-2xl font-semibold text-gray-900">
                            {predictions.engine_parameters.ENGINE_RPM.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-md border border-green-100 hover:shadow-md transition-shadow duration-200">
                          <p className="text-sm font-medium text-green-700">Torque (Nm)</p>
                          <p className="mt-1 text-2xl font-semibold text-gray-900">
                            {predictions.final_outputs.EngineTorque.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-md border border-purple-100 hover:shadow-md transition-shadow duration-200">
                          <p className="text-sm font-medium text-purple-700">Power (W)</p>
                          <p className="mt-1 text-2xl font-semibold text-gray-900">
                            {predictions.final_outputs.PowerTransferred.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-amber-50 p-4 rounded-md border border-amber-100 hover:shadow-md transition-shadow duration-200">
                          <p className="text-sm font-medium text-amber-700">Efficiency (%)</p>
                          <p className="mt-1 text-2xl font-semibold text-gray-900">
                            {predictions.final_outputs.Efficiency.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Engine Parameters */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-3 pb-1 border-b border-gray-200">Engine Parameters</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-gray-100 p-4 rounded-md">
                          <p className="text-xs uppercase tracking-wider text-gray-500">Intake Gas Mass Flow</p>
                          <p className="mt-1 text-lg font-medium text-gray-900">
                            {predictions.engine_parameters.IntakeGasMassFlow.toFixed(6)} kg/s
                          </p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-md">
                          <p className="text-xs uppercase tracking-wider text-gray-500">Fuel Mass Flow</p>
                          <p className="mt-1 text-lg font-medium text-gray-900">
                            {predictions.engine_parameters.FuelMassFlow.toFixed(6)} kg/s
                          </p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-md">
                          <p className="text-xs uppercase tracking-wider text-gray-500">Air/Fuel Ratio</p>
                          <p className="mt-1 text-lg font-medium text-gray-900">
                            {predictions.engine_parameters.AirFuelRatio.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional Output Metrics */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 mb-3 pb-1 border-b border-gray-200">Additional Outputs</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-100 p-4 rounded-md">
                          <p className="text-xs tracking-wider text-gray-500">BSFC (g/kWh)</p>
                          <p className="mt-1 text-lg font-medium text-gray-900">
                            {predictions.final_outputs.BSFC.toFixed(2)}
                          </p>
                        </div>
                        <div className="bg-gray-100 p-4 rounded-md">
                          <p className="text-xs uppercase tracking-wider text-gray-500">Power from Fuel (W)</p>
                          <p className="mt-1 text-lg font-medium text-gray-900">
                            {predictions.final_outputs.PowerFromFuel.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}