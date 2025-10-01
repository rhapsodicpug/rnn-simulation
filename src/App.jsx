import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import SimulationPage from "./pages/SimulationPage";
import TheoryPage from "./pages/TheoryPage";
import QuestionnairePage from "./pages/QuestionnairePage";
import "./App.css";

function App() {
  // IMPORTANT: Set your Google API key in environment variables
  // Create a .env file in the project root with: VITE_GOOGLE_API_KEY=your_api_key_here
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_GOOGLE_API_KEY || "YOUR_API_KEY_HERE");

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<SimulationPage apiKey={apiKey} />} />
        <Route path="theory" element={<TheoryPage />} />
        <Route path="questionnaire" element={<QuestionnairePage />} />
      </Route>
    </Routes>
  );
}

export default App;