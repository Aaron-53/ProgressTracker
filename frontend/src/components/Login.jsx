import { User, Lock, Eye, EyeOff } from "lucide-react";
import { LogIn } from 'lucide-react';
import { useState } from "react";


const Login = () => {

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => {setShowPassword(!showPassword);}

    return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-[90%] max-w-md md:max-w-lg lg:max-w-md p-6 bg-gray-900 flex-col flex items-center gap-4 rounded-xl shadow-slate-500 shadow-sm border border-slate-700 border-solid h-[420px] outline outline-[0.5px] outline-gray-600">

        <div className = "flex flex-col gap-6 w-full max-w-sm self-center">

          <h1 className="text-3xl md:text-3xl text-white font-semibold text-center mt-4">Welcome Back</h1>
          <p className="text-sm md:text-base text-gray-400 text-center">Sign in to your account to continue </p>
    
            <div className="w-full flex items-center bg-zinc-700 p-3 rounded-lg gap-2 outline outline-[0.5px] outline-gray-500">
                <User className ="text-gray-400"/>
                <input 
                  type="username" 
                  placeholder="Enter your username" 
                  className="bg-transparent border-0 w-full outline-none text-sm md:text-base" 
                />
            </div>
        
            <div className="w-full relative flex items-center bg-zinc-700 p-3 rounded-lg gap-2 outline outline-[0.5px] outline-gray-500">
                <Lock className ="text-gray-400"/>
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password" 
                  className="bg-transparent border-0 w-full outline-none text-sm md:text-base" 
                  />
                  {showPassword ? (
                    <EyeOff className="absolute right-5 cursor-pointer text-gray-400" onClick={togglePasswordVisibility} /> )
                   :(
                    <Eye className="absolute right-5 cursor-pointer text-gray-400" onClick={togglePasswordVisibility} /> )
                  }
            </div>
       
        <button className="w-full bg-gray-800 p-3 rounded-lg text-white font-semibold hover:bg-gray-600 transition duration-200 border border-gray-900 border-solid outline outline-[0.5px] outline-gray-600 flex items-center justify-center gap-3 "><LogIn/> Sign In</button>
        <p className="text-xs md:text-sm text-gray-500 text-center mb-5">Don't have an account? <span className="text-white cursor-pointer underline underline-offset-2">Sign Up</span></p>

        </div>
      </div>
    </div>
  );
};

export default Login;
