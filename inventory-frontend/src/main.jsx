import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('main.jsx is loading...')

try {
  const root = ReactDOM.createRoot(document.getElementById('root'))
  console.log('React root created successfully')
  
  root.render(
    <React.StrictMode>
      {/* <div style={{padding: '20px', textAlign: 'center'}}>
        <h1>React is Loading...</h1>
        <p>If you see this, React is working!</p>
      </div> */}
      <App />
    </React.StrictMode>
  )
  
  console.log('React app rendered successfully')
} catch (error) {
  console.error('Error rendering React app:', error)
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; text-align: center; color: red;">
      <h1>React Error</h1>
      <p>Error: ${error.message}</p>
    </div>
  `
}
