import React, { useRef, useState } from 'react';
import { RetellWebClient } from "retell-client-js-sdk";

enum CallState {
  notStarted = 1,
  inProgress,
  ended
}

interface Message {
  role: string,
  content: string,
}

function App() {

  const [callState, setCallState] = useState<CallState>(CallState.notStarted);
  const [prompt, setPrompt] = useState('');
  const [transcript, setTranscript] = useState<Message[]>();
  const retellClient = useRef(new RetellWebClient());

  retellClient.current.on('update', (update) => {
    setTranscript(update.transcript);
  });

  const startConversation = async () => {
    const headers = new Headers();
    headers.append("Content-Type", "application/json");
    const res = await fetch('http://localhost:8080/token', {
      method: 'POST',
      body: JSON.stringify({
        prompt: prompt
      }),
      headers: headers,
    });
    const result = await res.json();
    await retellClient.current.startCall({ accessToken: result.accessToken });
    setCallState(CallState.inProgress);
  }

  const stopConversation = () => {
    retellClient.current.stopCall();
    setCallState(CallState.ended);
  }

  const renderButton = () => {
    switch (callState) {
      case CallState.notStarted:
        return <button className='start-btn' onClick={startConversation}>Start Conversation</button>;
      case CallState.inProgress:
        return <button className='stop-btn' onClick={stopConversation}>Stop Conversation</button>
      case CallState.ended:
        return <></>
    }
  }

  return (
    <>
      <h1>Enter a symstem prompt for the AI</h1>
      <textarea
        content={prompt}
        disabled={callState !== CallState.notStarted}
        onChange={(e) => {
          setPrompt(e.target.value);
        }} />
      <div>
        {renderButton()}
      </div>
      {
        callState === CallState.inProgress ? <h2>Conversation in progress...</h2> : <></>
      }
      {
        callState === CallState.ended ? <h2>Conversation ended.</h2> : <></>
      }
      <div>
        {
          transcript?.map((message: Message) => {
            return (
              <div>
                <b>{message.role === 'agent' ? 'Agent: ' : 'You: '}</b>{message.content}
              </div>
            );
          })
        }
      </div>
    </>
  );
}

export default App;
