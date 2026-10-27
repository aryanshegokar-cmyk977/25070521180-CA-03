import { createContext, useCallback, useContext, useRef, useState } from 'react';

// Quill the owl is the app's little guide. Any page can make Quill say something:
//   const { say } = useQuill();
//   say('Hoo-hoo! Well done!', 'happy');
// Moods change Quill's face: 'happy', 'sad', 'wow' or 'calm'.
const QuillContext = createContext(null);

export function QuillProvider({ children }) {
  const [message, setMessage] = useState(null);
  const timer = useRef(null);

  const say = useCallback((text, mood = 'calm', seconds = 6) => {
    clearTimeout(timer.current);
    setMessage({ text, mood, id: Date.now() });
    timer.current = setTimeout(() => setMessage(null), seconds * 1000);
  }, []);

  const hush = useCallback(() => {
    clearTimeout(timer.current);
    setMessage(null);
  }, []);

  return <QuillContext.Provider value={{ message, say, hush }}>{children}</QuillContext.Provider>;
}

export function useQuill() {
  return useContext(QuillContext);
}
