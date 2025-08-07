import React from 'react';
import AnimatedTitle from '../components/AnimatedTitle';

const TheoryPage = () => {
  return (
    <div className="content-text">
      <AnimatedTitle text="Understanding Sequence Models" />

      <h3>Recurrent Neural Networks (RNNs)</h3>
      <p>
        Recurrent Neural Networks (RNNs) are a class of neural networks designed to handle sequential data, like text, speech, or time series. Unlike standard feedforward networks, RNNs have loops, allowing information to persist. This "memory" is crucial for understanding context in data that unfolds over time.
      </p>

      <h3>From Words to Numbers: Word Embeddings</h3>
      <p>
        A neural network cannot understand words directly. First, we must convert them into numbers. The process of breaking a sentence into words is called <strong>Tokenization</strong>. Each token is then mapped to a multi-dimensional numerical vector called a <strong>Word Embedding</strong>.
      </p>
      <p>
        Think of an embedding as a coordinate for a word in a "meaning space." Words with similar meanings, like "king" and "queen," will have vectors that are close to each other. This allows the model to understand relationships between words, which is fundamental for tasks like translation. The colored squares in the simulation represent these vectors.
      </p>
      

      <h3>The Encoder-Decoder Model</h3>
      <p>
        For tasks like machine translation, a specific RNN architecture called the <strong>Encoder-Decoder</strong> (or Sequence-to-Sequence) model is used. It consists of two main parts:
      </p>
      <ul>
        <li>
          <strong>Encoder:</strong> It reads the input sequence (e.g., an English sentence) token by token. At each step, it updates its internal "hidden state." The final hidden state, often called the <span className="highlight">Context Vector</span>, is a numerical summary of the entire input sentence's meaning.
        </li>
        <li>
          <strong>Decoder:</strong> It takes the Context Vector from the encoder and generates the output sequence (e.g., the Hindi translation) token by token.
        </li>
      </ul>

      <h3>The Decoder's Generative Process</h3>
      <p>
        The Decoder works in an <strong>autoregressive</strong> fashion. After receiving the Context Vector, it's given a special <strong>&lt;START&gt;</strong> token to begin.
      </p>
      <ol>
        <li>It generates the first word of the output (e.g., "आप").</li>
        <li>It then takes that generated word ("आप") as the input for the next step.</li>
        <li>It generates the second word (e.g., "कैसे").</li>
        <li>This process repeats, using the previously generated word as the next input, until it produces a special <strong>&lt;END&gt;</strong> token to signify it's finished.</li>
      </ol>

      <h3>The Problem with Long-Term Memory</h3>
      <p>
        Standard RNNs suffer from the <strong>vanishing gradient problem</strong>. As information travels through the sequence, it can get diluted, making it difficult for the model to connect words that are far apart. This is like trying to remember the beginning of a very long story by the time you reach the end.
      </p>
      <p>
        This is where <strong>Long Short-Term Memory (LSTM)</strong> cells come in. LSTMs are a special kind of RNN unit, designed to remember information for long periods by using a system of "gates" to carefully control the flow of information—deciding what to remember, what to forget, and what to output at each step.
      </p>

      <h3>Beyond RNNs: The Transformer Architecture</h3>
      <p>
        While powerful, RNNs and LSTMs have a key limitation: they must process data sequentially, one token after another. This makes them slow to train on massive datasets. In 2017, a revolutionary new architecture was introduced: the <strong>Transformer</strong>.
      </p>
      <p>
        The Transformer's key innovation is the <strong>Attention Mechanism</strong>. Instead of passing a single context vector from one step to the next, Attention allows the model to look at all the words in the input sentence simultaneously and decide which ones are most important for translating the current word. This ability to process all tokens in parallel made training vastly more efficient and dramatically improved performance, making Transformers the foundation for modern large language models like GPT and Gemini.
      </p>
      
    </div>
  );
};

export default TheoryPage;