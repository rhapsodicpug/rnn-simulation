# RNN Simulation

A React-based application for simulating Recurrent Neural Networks with interactive visualizations and educational content.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your Google API key for translation functionality:
   - Get a Google API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the Generative Language API for your project
   - Create a `.env` file in the project root:
     ```
     VITE_GOOGLE_API_KEY=your_actual_api_key_here
     ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Features

- Interactive RNN simulation
- Educational theory content
- Questionnaire functionality
- Multi-language support (requires Google API key)

## Note

The translation feature requires a valid Google API key. Without it, you'll see "Failed to get translation" errors. The app will still work for all other features.