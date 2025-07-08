import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [headingText, setHeadingText] = useState('')
  const fullHeading = 'Vite + React'

  useEffect(() => {
    let i = 0
    const typing = setInterval(() => {
      if (i < fullHeading.length) {
        setHeadingText(fullHeading.substring(0, i + 1))
        i++
      } else {
        clearInterval(typing)
      }
    }, 100) // Adjust typing speed here (in milliseconds)
    return () => clearInterval(typing)
  }, [])

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>{headingText}</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
