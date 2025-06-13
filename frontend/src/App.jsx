import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Questions from './components/Questions'
import Question from './components/Question'
import './App.css'
import Login from './components/Login'

function App() {
  return (
    <Router>
      <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 m-0 p-0 overflow-visible">
        <Routes>
          <Route path="/" element={<Navigate to="/questions" replace />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/question/:id" element={<Question />} />
          <Route path="/login" element={<Login/>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
