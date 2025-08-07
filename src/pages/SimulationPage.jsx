import React, { useState, useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { motion, AnimatePresence } from "framer-motion";
import AnimatedTitle from '../components/AnimatedTitle';
import {
  ArrowRight,
  Languages,
  Loader2,
  RefreshCw,
  BrainCircuit,
  Play,
  Pause,
  StepForward,
  FastForward,
} from "lucide-react";

// --- API Translation Function ---
const getTranslationFromAPI = async (text, fromLang, toLang, apiKey) => {
  if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
    throw new Error("API Key is missing. Please add your key to the App component.");
  }
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const prompt = `Translate the following text from ${fromLang} to ${toLang}. Return ONLY the translated text and nothing else: "${text}"`;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    if (!response.ok) {
      const errorBody = await response.json();
      console.error("API Error Body:", errorBody);
      throw new Error(`API call failed: ${errorBody.error.message}`);
    }
    const data = await response.json();
    if (!data.candidates || !data.candidates[0].content.parts[0].text) {
      throw new Error("Invalid response structure from API.");
    }
    return data.candidates[0].content.parts[0].text.trim();
  } catch (error) {
    console.error("API Translation Error:", error);
    throw new Error(
      "Failed to get translation. Check your API key and network connection."
    );
  }
};

// --- Reusable Helper & UI Components ---
const generateVector = (size = 25) =>
  Array.from({ length: size }, () => Math.random());
const getColor = d3.scaleSequential(d3.interpolateCool).domain([0, 1.2]);

const Vector = ({ data, size = 80, isActive }) => {
  const boxSize = size / 5;
  return (
    <motion.svg
      width={size}
      height={size}
      className="vector-container"
      animate={{
        boxShadow: isActive
          ? "inset 0 0 12px rgba(0, 229, 255, 0.8)"
          : "inset 0 1px 2px rgba(0,0,0,0.5)",
      }}
      transition={{
        duration: 1.5,
        repeat: isActive ? Infinity : 0,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      {data.map((d, i) => (
        <rect
          key={i}
          x={(i % 5) * boxSize}
          y={Math.floor(i / 5) * boxSize}
          width={boxSize}
          height={boxSize}
          fill={getColor(d)}
        />
      ))}
    </motion.svg>
  );
};

const LstmCell = ({ name, isActive }) => (
  <motion.div
    className="lstm-cell"
    animate={{
      borderColor: isActive ? "var(--accent)" : "var(--border)",
      boxShadow: isActive
        ? "0 0 15px rgba(0, 229, 255, 0.2)"
        : "0 0 0 rgba(0,0,0,0)",
    }}
    transition={{ duration: 0.5 }}
  >
    <div className="lstm-title">{name}</div>
    <div className="lstm-gates">
      <motion.div
        className="gate"
        data-tooltip-id="app-tooltip"
        data-tooltip-content="The 'Forget Gate' decides which information to discard from the cell's long-term memory."
        animate={{
          backgroundColor: isActive ? "rgba(0, 229, 255, 0.2)" : "var(--bg)",
        }}
        transition={{
          delay: 0,
          duration: 0.5,
          repeat: isActive ? Infinity : 0,
          repeatType: "reverse",
        }}
      >
        Forget
      </motion.div>
      <motion.div
        className="gate"
        data-tooltip-id="app-tooltip"
        data-tooltip-content="The 'Input Gate' determines which new information from the current token will be stored in memory."
        animate={{
          backgroundColor: isActive ? "rgba(0, 229, 255, 0.2)" : "var(--bg)",
        }}
        transition={{
          delay: 0.1,
          duration: 0.5,
          repeat: isActive ? Infinity : 0,
          repeatType: "reverse",
        }}
      >
        Input
      </motion.div>
    </div>
    <div
      className="cell-state"
      data-tooltip-id="app-tooltip"
      data-tooltip-content="The 'Cell State' is the long-term memory of the network, carrying information through the sequence."
    >
      Cell State
    </div>
    <motion.div
      className="gate"
      data-tooltip-id="app-tooltip"
      data-tooltip-content="The 'Output Gate' determines what part of the cell state is used to generate the final output for this step."
      animate={{
        backgroundColor: isActive ? "rgba(0, 229, 255, 0.2)" : "var(--bg)",
      }}
      transition={{
        delay: 0.2,
        duration: 0.5,
        repeat: isActive ? Infinity : 0,
        repeatType: "reverse",
      }}
    >
      Output
    </motion.div>
  </motion.div>
);

const Visualization = ({ simulationData, step, phase }) => {
  const { inputTokens, outputTokens } = simulationData;
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current || !inputTokens.length) {
      if (svgRef.current) d3.select(svgRef.current).selectAll("*").remove();
      return;
    }
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    const dimensions = {
      width: svg.node().getBoundingClientRect().width,
      height: 600,
    };
    const encoderX = dimensions.width * 0.25;
    const decoderX = dimensions.width * 0.75;
    const startY = 220,
      stepY = 80;
    const defs = svg.append("defs");
    const addArrow = (id, color) =>
      defs
        .append("marker")
        .attr("id", id)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 0)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", color);
    addArrow("arrow-idle", "#333");
    addArrow("arrow-active", "#00E5FF");
    const animatePulse = (path) => {
      if (!path.node()) return;
      const pulse = svg.append("circle").attr("r", 4).attr("fill", "#00E5FF");
      const totalLength = path.node().getTotalLength();
      pulse
        .transition()
        .duration(1000)
        .ease(d3.easeLinear)
        .attrTween(
          "transform",
          () => (t) =>
            `translate(${path.node().getPointAtLength(t * totalLength).x},${
              path.node().getPointAtLength(t * totalLength).y
            })`
        )
        .on("end", () => pulse.remove());
    };
    for (let i = 0; i < inputTokens.length - 1; i++) {
      const path = svg
        .append("path")
        .attr(
          "d",
          `M${encoderX},${startY + i * stepY} L${encoderX},${
            startY + (i + 1) * stepY - 42
          }`
        )
        .attr("stroke", phase === "encoding" && step > i ? "#00E5FF" : "#333")
        .attr("stroke-width", 1.5)
        .attr("fill", "none")
        .attr(
          "marker-end",
          `url(#arrow-${phase === "encoding" && step > i ? "active" : "idle"})`
        );
      if (phase === "encoding" && step === i + 1) animatePulse(path);
    }
    for (let i = 0; i < outputTokens.length - 1; i++) {
      const path = svg
        .append("path")
        .attr(
          "d",
          `M${decoderX},${startY + i * stepY} L${decoderX},${
            startY + (i + 1) * stepY - 42
          }`
        )
        .attr("stroke", phase === "decoding" && step > i ? "#00E5FF" : "#333")
        .attr("stroke-width", 1.5)
        .attr("fill", "none")
        .attr(
          "marker-end",
          `url(#arrow-${phase === "decoding" && step > i ? "active" : "idle"})`
        );
      if (phase === "decoding" && step === i + 1) animatePulse(path);
    }
    if (phase === "decoding" || phase === "done" || phase === "context") {
      const path = svg
        .append("path")
        .attr(
          "d",
          `M ${encoderX + 100}, ${100} C ${encoderX + 200}, ${50}, ${
            decoderX - 200
          }, ${50}, ${decoderX - 100}, ${100}`
        )
        .attr("stroke", "#00E5FF")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("marker-end", "url(#arrow-active)");
      if (phase === "context") {
        const totalLength = path.node().getTotalLength();
        path
          .attr("stroke-dasharray", "6 3")
          .attr("stroke-dashoffset", totalLength)
          .transition()
          .duration(1500)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0);
      } else {
        path.attr("stroke-dasharray", "6 3");
      }
    }
  }, [inputTokens, outputTokens, phase, step]);

  const getPhaseDescription = () => {
    switch (phase) {
      case "encoding":
        return `Encoding Token ${step + 1}/${inputTokens.length}`;
      case "decoding":
        return `Decoding Token ${step + 1}/${outputTokens.length}`;
      case "context":
        return "Generating Context Vector";
      case "done":
        return "Translation Complete";
      case "translating":
        return "Calling Translation API";
      default:
        return "Awaiting Input";
    }
  };

  const stepVariants = {
    hidden: { opacity: 0.3 },
    visible: { opacity: 1 },
    active: {
      opacity: 1,
      backgroundColor: "rgba(0, 229, 255, 0.1)",
      scale: 1.05,
      transition: { duration: 0.3 },
    },
  };

  return (
    <div className="viz-panel">
      <AnimatePresence>
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="phase-description"
        >
          {getPhaseDescription()}
        </motion.div>
      </AnimatePresence>
      <div className="viz-columns">
        <svg ref={svgRef} className="viz-svg"></svg>
        <div className="viz-column">
          <h3 className="viz-title">Encoder</h3>
          <LstmCell name="Encoder LSTM" isActive={phase === "encoding"} />
          <div className="tokens-container">
            <AnimatePresence>
              {simulationData.inputTokens.map((token, i) => (
                <motion.div
                  key={`in-${i}`}
                  className="simulation-step"
                  variants={stepVariants}
                  initial="visible"
                  animate={
                    phase === "encoding" && step === i ? "active" : "visible"
                  }
                  layout
                >
                  <span className="token-text">{token}</span>
                  <ArrowRight size={18} className="arrow-icon" />
                  <Vector
                    data={simulationData.inputVectors[i] || []}
                    isActive={phase === "encoding" && step === i}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <AnimatePresence>
          {(phase === "context" ||
            phase === "decoding" ||
            phase === "done") && (
            <motion.div
              className="context-vector-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className="context-vector-content"
                animate={{
                  boxShadow:
                    phase === "context"
                      ? [
                          "0 0 20px rgba(0, 229, 255, 0.3)",
                          "0 0 35px rgba(0, 229, 255, 0.6)",
                          "0 0 20px rgba(0, 229, 255, 0.3)",
                        ]
                      : "0 0 0 rgba(0,0,0,0)",
                }}
                transition={{
                  duration: 2,
                  repeat: phase === "context" ? Infinity : 0,
                  ease: "easeInOut",
                }}
              >
                <h3 className="viz-title">Context Vector</h3>
                <Vector
                  data={simulationData.contextVector}
                  size={100}
                  isActive={true}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="viz-column">
          <h3 className="viz-title">Decoder</h3>
          <LstmCell name="Decoder LSTM" isActive={phase === "decoding"} />
          <div className="tokens-container">
            <AnimatePresence>
              {simulationData.outputTokens.map((token, i) => (
                <motion.div
                  key={`out-${i}`}
                  className="simulation-step"
                  variants={stepVariants}
                  initial="hidden"
                  animate={
                    (phase === "decoding" && step >= i) || phase === "done"
                      ? "visible"
                      : "hidden"
                  }
                >
                  <Vector
                    data={simulationData.outputVectors[i] || []}
                    isActive={phase === "decoding" && step === i}
                  />
                  <ArrowRight size={18} className="arrow-icon" />
                  <span className="token-text">
                    {(phase === "decoding" && step >= i) || phase === "done"
                      ? token
                      : "?"}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main Simulation Page Component ---
const SimulationPage = ({ apiKey }) => {
  const [fromLang, setFromLang] = useState("en");
  const [toLang, setToLang] = useState("hi");
  const [inputText, setInputText] = useState("how are you");
  const [translatedText, setTranslatedText] = useState("");
  const [simulationData, setSimulationData] = useState({
    inputTokens: [],
    outputTokens: [],
    inputVectors: [],
    contextVector: generateVector(),
    outputVectors: [],
  });
  const [phase, setPhase] = useState("idle");
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [isPaused, setIsPaused] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState(1200);

  const langOptions = [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "mr", name: "Marathi" },
  ];

  const handleSwapLanguages = () => {
    if (phase !== "idle" && phase !== "done") return;
    setFromLang(toLang);
    setToLang(fromLang);
  };

  const handleReset = () => {
    setError("");
    setPhase("idle");
    setInputText("");
    setTranslatedText("");
    setSimulationData({
      inputTokens: [],
      outputTokens: [],
      inputVectors: [],
      contextVector: generateVector(),
      outputVectors: [],
    });
    setIsPaused(true);
  };

  const handleTranslate = async () => {
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
      setError(
        "API Key is missing. Please get a free key from Google AI Studio and paste it into the App component."
      );
      return;
    }
    setError("");
    setTranslatedText("");
    setIsPaused(true);
    if (!inputText.trim()) {
      setError("Please enter a sentence to translate.");
      return;
    }
    setPhase("translating");
    setSimulationData({
      inputTokens: [],
      outputTokens: [],
      inputVectors: [],
      contextVector: generateVector(),
      outputVectors: [],
    });
    try {
      const fromLangName = langOptions.find((l) => l.code === fromLang).name;
      const toLangName = langOptions.find((l) => l.code === toLang).name;
      const translation = await getTranslationFromAPI(
        inputText.trim(),
        fromLangName,
        toLangName,
        apiKey
      );

      if (!translation) throw new Error("Received an empty translation.");

      setTranslatedText(translation);

      const inputTokens = inputText
        .toLowerCase()
        .trim()
        .split(/[\s,.]+/)
        .filter(Boolean);
      const outputTokens = translation
        .toLowerCase()
        .trim()
        .split(/[\s,.]+/)
        .filter(Boolean);
      setSimulationData({
        inputTokens,
        outputTokens,
        inputVectors: inputTokens.map(() => generateVector()),
        contextVector: generateVector(),
        outputVectors: outputTokens.map(() => generateVector()),
      });
      setStep(0);
      setPhase("encoding");
    } catch (apiError) {
      console.error(apiError);
      setError(apiError.message);
      setPhase("idle");
    }
  };

  const advanceSimulation = useCallback(() => {
    const { inputTokens, outputTokens } = simulationData;
    if (phase === "encoding") {
      if (step < inputTokens.length - 1) setStep((s) => s + 1);
      else setPhase("context");
    } else if (phase === "context") {
      setTimeout(() => {
        setStep(0);
        setPhase("decoding");
      }, 500);
    } else if (phase === "decoding") {
      if (step < outputTokens.length - 1) setStep((s) => s + 1);
      else {
        setPhase("done");
        setIsPaused(true);
      }
    }
  }, [phase, step, simulationData]);

  const handlePlayPause = () => {
    if (phase === "done") return;
    setIsPaused((prev) => !prev);
  };

  const handleNextStep = () => {
    if (phase === "done") return;
    advanceSimulation();
  };

  useEffect(() => {
    if (isPaused || ["idle", "done", "translating"].includes(phase)) {
      return;
    }
    const timer = setTimeout(() => {
      advanceSimulation();
    }, animationSpeed);
    return () => clearTimeout(timer);
  }, [phase, step, isPaused, advanceSimulation, animationSpeed]);

  const isSimulating = phase !== "idle" && phase !== "done";
  const showSimControls = phase !== "idle" && phase !== "translating";

  const controlsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const controlsItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="simulation-layout">
      <div className="simulation-controls">
        <div className="control-group">
          <label className="control-label">Language</label>
          <div className="language-controls">
            <div className="select">
              <select
                value={fromLang}
                onChange={(e) => setFromLang(e.target.value)}
                disabled={isSimulating}
              >
                {langOptions.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleSwapLanguages}
              className="swap-button"
              disabled={isSimulating}
            >
              <Languages size={18} />
            </button>
            <div className="select">
              <select
                value={toLang}
                onChange={(e) => setToLang(e.target.value)}
                disabled={isSimulating}
              >
                {langOptions.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="control-group">
          <label className="control-label">Input Sentence</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isSimulating}
            rows="3"
            className="textarea"
          />
        </div>
        <AnimatePresence>
          {phase === "done" && translatedText && (
            <motion.div
              className="control-group"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <label className="control-label">Final Translation</label>
              <div className="output-box">{translatedText}</div>
            </motion.div>
          )}
        </AnimatePresence>
        {!apiKey || apiKey === "YOUR_API_KEY_HERE" ? (
          <div className="api-key-notice">
            <strong>API Key Needed:</strong> Get a free key from{" "}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google AI Studio
            </a>{" "}
            and paste it in the code.
          </div>
        ) : null}
        {error && <div className="error-notice">{error}</div>}

        <div className="button-group">
          <button
            onClick={handleTranslate}
            disabled={phase !== "idle"}
            className="button"
          >
            {phase === "translating" ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <BrainCircuit size={18} />
            )}
            <span>
              {phase === "translating"
                ? "Simulating..."
                : "Translate & Visualize"}
            </span>
          </button>
          {phase !== "idle" && (
            <button onClick={handleReset} className="button is-secondary">
              <RefreshCw size={18} />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showSimControls && (
            <motion.div
              className="controls-wrapper"
              variants={controlsContainerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.div
                className="button-group"
                variants={controlsItemVariants}
              >
                <button
                  onClick={handlePlayPause}
                  className="button is-secondary"
                  disabled={phase === "done"}
                >
                  {isPaused ? <Play size={18} /> : <Pause size={18} />}
                  <span>{isPaused ? "Play" : "Pause"}</span>
                </button>
                <button
                  onClick={handleNextStep}
                  className="button is-secondary"
                  disabled={!isPaused || phase === "done"}
                >
                  <StepForward size={18} />
                  <span>Next Step</span>
                </button>
              </motion.div>

              <motion.div
                className="control-group"
                variants={controlsItemVariants}
              >
                <label className="control-label" htmlFor="speed-slider">
                  <FastForward
                    size={14}
                    style={{
                      display: "inline-block",
                      verticalAlign: "middle",
                      marginRight: "0.5rem",
                    }}
                  />
                  Animation Speed:{" "}
                  <span>{(animationSpeed / 1000).toFixed(1)}s</span>
                </label>
                <input
                  type="range"
                  id="speed-slider"
                  className="speed-slider"
                  min="200"
                  max="2000"
                  value={animationSpeed}
                  onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                  disabled={phase === "done"}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {simulationData.inputTokens.length > 0 && (
          <motion.div
            className="viz-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Visualization
              simulationData={simulationData}
              step={step}
              phase={phase}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimulationPage;