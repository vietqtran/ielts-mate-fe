import { useEffect, useState } from 'react';

const useDecrementTimer = (duration: number, start: boolean) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!start) return;
    setTimeLeft(duration); // Reset time when the timer starts
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0)); // Decrement time by 1 second
    }, 1000);

    return () => clearInterval(interval);
  }, [start]);

  return timeLeft;
};

const useIncrementalTimer = (initialTime: number, start: boolean) => {
  const [time, setTime] = useState(initialTime);

  useEffect(() => {
    if (!start) return;
    const interval = setInterval(() => {
      setTime((prev) => prev + 1); // Increment time by 1 second
    }, 1000);

    return () => clearInterval(interval);
  }, [start]);

  return time;
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export { useDecrementTimer, useIncrementalTimer, formatTime };
