import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Questions from './components/Questions'
import Question from './components/Question'
import Login from './components/Login'
import SignUp from './components/SignUp'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import './App.css'


function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen w-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 m-0 p-0 overflow-visible">
          <Routes>
            <Route path="/" element={<Navigate to="/questions" replace />} />  

            <Route path="/login" element={<Login/>} />
            <Route path="/signup" element={<SignUp />} />

            <Route path="/questions" element={
              <ProtectedRoute>
                <Questions />
              </ProtectedRoute>
            } />
            
            <Route path="/question/:titleSlug" element={
              <ProtectedRoute>
                <Question />
              </ProtectedRoute>
            } />

          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
