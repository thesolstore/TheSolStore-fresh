import { useCallback, useEffect, useRef } from 'react';

export const useSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        gainNodeRef.current.gain.value = 0.08; // Increased volume to 8%

        // Create a modern "soft click" sound
        const duration = 0.08; // Shorter duration
        const sampleRate = audioContextRef.current.sampleRate;
        const buffer = audioContextRef.current.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < buffer.length; i++) {
          const t = i / buffer.length;
          
          // High-frequency click
          const clickFreq = 2000;
          const click = Math.sin(2 * Math.PI * clickFreq * t);
          
          // Low-frequency thump
          const thumpFreq = 80;
          const thump = Math.sin(2 * Math.PI * thumpFreq * t);
          
          // White noise for texture
          const noise = Math.random() * 2 - 1;
          
          // Custom envelope shapes
          const clickEnv = Math.exp(-30 * t); // Fast decay for click
          const thumpEnv = Math.exp(-15 * t); // Slower decay for thump
          const noiseEnv = Math.exp(-50 * t); // Very fast decay for noise
          
          // Combine all elements with their envelopes
          const clickPart = click * clickEnv * 0.4;  // Increased click volume
          const thumpPart = thump * thumpEnv * 0.5;  // Increased thump volume
          const noisePart = noise * noiseEnv * 0.15;  // Increased noise volume slightly
          
          // Mix all parts together
          data[i] = clickPart + thumpPart + noisePart;
        }
        
        // Apply a subtle lowpass filter to smooth out the sound
        const filterNode = audioContextRef.current.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.value = 3000;
        filterNode.Q.value = 1;
        
        bufferRef.current = buffer;
      } catch (error) {
        console.error('Error initializing audio:', error);
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  const playHoverSound = useCallback(() => {
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    if (audioContextRef.current && bufferRef.current && gainNodeRef.current) {
      try {
        const source = audioContextRef.current.createBufferSource();
        source.buffer = bufferRef.current;
        source.connect(gainNodeRef.current);
        source.start();
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    }
  }, []);

  return { playHoverSound };
};
