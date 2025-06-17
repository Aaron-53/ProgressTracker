import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Questions from './components/Questions'
import Question from './components/Question'
import './App.css'
import Login from './components/Login'
import SignUp from './components/SignUp'


function App() {
  return (
    <Router>
      <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 m-0 p-0 overflow-visible">
        <Routes>
          <Route path="/" element={<Navigate to="/questions" replace />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/question/:titleSlug" element={<Question />} />  

          <Route path="/login" element={<Login/>} />
          <Route path="/signup" element={<SignUp />} />

        </Routes>
      </div>
    </Router>
  )
}

export default App
