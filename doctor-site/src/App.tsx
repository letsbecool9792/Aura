import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
      <div className="flex gap-8 mb-8">
        <a 
          href="https://vite.dev" 
          target="_blank" 
          className="transition-transform hover:scale-110"
        >
          <img 
            src={viteLogo} 
            className="h-24 w-24 animate-spin" 
            alt="Vite logo"
            style={{ animationDuration: '20s' }}
          />
        </a>
        <a 
          href="https://react.dev" 
          target="_blank" 
          className="transition-transform hover:scale-110"
        >
          <img 
            src={reactLogo} 
            className="h-24 w-24 animate-spin" 
            alt="React logo" 
          />
        </a>
      </div>
      
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Vite + React
      </h1>
      
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 mb-8">
        <button 
          onClick={() => setCount((count) => count + 1)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 mb-4"
        >
          count is {count}
        </button>
        <p className="text-gray-300">
          Edit <code className="bg-gray-700 px-2 py-1 rounded text-yellow-300">src/App.tsx</code> and save to test HMR
        </p>
      </div>
      
      <p className="text-gray-400 text-sm">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
