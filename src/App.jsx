import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import SimulationPage from "./pages/SimulationPage";
import TheoryPage from "./pages/TheoryPage";
import QuestionnairePage from "./pages/QuestionnairePage";
import "./App.css";

function App() {
  // IMPORTANT: PASTE YOUR API KEY HERE
  const [apiKey, setApiKey] = useState("");

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