import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSortingAlgorithms } from '../hooks/useSortingAlgorithms';

const SortingVisualizer = () => {
  const canvasRef = useRef(null);
  const [array, setArray] = useState([]);
  const [arraySize, setArraySize] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubble');
  const [speed, setSpeed] = useState(50);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customArrayText, setCustomArrayText] = useState('');
  const [stats, setStats] = useState({
    comparisons: 0,
    swaps: 0,
    time: 0
  });
  
  const { runAlgorithm, stopAlgorithm } = useSortingAlgorithms();
  
  const canvasWidth = 800;
  const canvasHeight = 400;

  // Generate random array
  const generateArray = useCallback(() => {
    const newArray = [];
    for (let i = 0; i < arraySize; i++) {
      newArray.push(Math.random() * (canvasHeight - 40) + 20);
    }
    setArray(newArray);
    setStats({ comparisons: 0, swaps: 0, time: 0 });
  }, [arraySize, canvasHeight]);

  // Initialize array
  useEffect(() => {
    generateArray();
  }, [generateArray]);

  // Draw array
  const drawArray = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || array.length === 0) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = canvasWidth / array.length;
    
    for (let i = 0; i < array.length; i++) {
      const barHeight = array[i];
      const x = i * barWidth;
      const y = canvasHeight - barHeight;
      
      // Create gradient
      const gradient = ctx.createLinearGradient(x, y, x, canvasHeight);
      gradient.addColorStop(0, '#667eea');
      gradient.addColorStop(1, '#764ba2');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
      
      // Add border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, barWidth - 1, barHeight);
    }
  }, [array, canvasWidth, canvasHeight]);

  useEffect(() => {
    drawArray();
  }, [drawArray]);

  // Clear array
  const clearArray = () => {
    if (isRunning) return;
    setArray([]);
    setStats({ comparisons: 0, swaps: 0, time: 0 });
  };

  // Parse custom array
  const parseCustomArray = (text) => {
    try {
      // Remove all non-numeric characters except commas and spaces
      const cleaned = text.replace(/[^\d,\s.-]/g, '');
      const numbers = cleaned.split(/[,\s]+/).filter(num => num.trim() !== '');
      const parsed = numbers.map(num => {
        const value = parseFloat(num);
        if (isNaN(value)) return null;
        // Scale the value to fit the canvas
        return Math.max(20, Math.min(canvasHeight - 20, value * (canvasHeight - 40) / 100));
      }).filter(val => val !== null);
      
      return parsed.length > 0 ? parsed : null;
    } catch (error) {
      return null;
    }
  };

  // Apply custom array
  const applyCustomArray = () => {
    if (isRunning) return;
    
    const parsedArray = parseCustomArray(customArrayText);
    if (parsedArray) {
      setArray(parsedArray);
      setArraySize(parsedArray.length);
      setStats({ comparisons: 0, swaps: 0, time: 0 });
      setShowCustomInput(false);
      setCustomArrayText('');
    } else {
      alert('Invalid array format. Please enter numbers separated by commas or spaces.');
    }
  };

  // Start algorithm
  const startAlgorithm = async () => {
    if (isRunning || array.length === 0) return;
    
    setIsRunning(true);
    const startTime = Date.now();
    
    await runAlgorithm(
      selectedAlgorithm, 
      array, 
      setArray, 
      setStats, 
      speed,
      startTime
    );
    
    setIsRunning(false);
  };

  // Stop algorithm
  const stopAlgorithmHandler = () => {
    if (!isRunning) return;
    
    stopAlgorithm();
    setIsRunning(false);
  };

  return (
    <div className="algorithm-section">
      {/* Controls */}
      <div className="controls">
        <div className="control-group">
          <label htmlFor="sorting-algorithm">Algorithm:</label>
          <select
            id="sorting-algorithm"
            className="select-input"
            value={selectedAlgorithm}
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
            disabled={isRunning}
          >
            <option value="bubble">Bubble Sort</option>
            <option value="insertion">Insertion Sort</option>
            <option value="selection">Selection Sort</option>
            <option value="merge">Merge Sort</option>
            <option value="quick">Quick Sort</option>
          </select>
        </div>
        
        <div className="control-group">
          <button
            className="btn btn-secondary"
            onClick={generateArray}
            disabled={isRunning}
          >
            Generate Array
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowCustomInput(!showCustomInput)}
            disabled={isRunning}
          >
            Custom Array
          </button>
          <button
            className="btn btn-secondary"
            onClick={clearArray}
            disabled={isRunning}
          >
            Clear
          </button>
          {!isRunning ? (
            <button
              className="btn btn-primary"
              onClick={startAlgorithm}
              disabled={isRunning}
            >
              Start
            </button>
          ) : (
            <button
              className="btn btn-danger"
              onClick={stopAlgorithmHandler}
            >
              Stop
            </button>
          )}
        </div>
        
        <div className="control-group">
          <label htmlFor="array-size">Array Size:</label>
          <input
            type="range"
            id="array-size"
            className="range-input"
            min="10"
            max="100"
            value={arraySize}
            onChange={(e) => setArraySize(parseInt(e.target.value))}
            disabled={isRunning}
          />
          <span style={{ fontSize: '14px', color: '#666', minWidth: '30px' }}>{arraySize}</span>
        </div>
        
        <div className="control-group">
          <label htmlFor="sorting-speed">Speed:</label>
          <input
            type="range"
            id="sorting-speed"
            className="range-input"
            min="1"
            max="100"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
            disabled={isRunning}
          />
        </div>
      </div>

      {/* Custom Array Input */}
      {showCustomInput && (
        <div className="custom-array-input">
          <label htmlFor="custom-array">Enter custom array:</label>
          <textarea
            id="custom-array"
            value={customArrayText}
            onChange={(e) => setCustomArrayText(e.target.value)}
            placeholder="Enter numbers separated by commas or spaces (e.g., 64, 34, 25, 12, 22, 11, 90)"
            disabled={isRunning}
          />
          <div className="input-help">
            Enter numbers between 0-100. They will be automatically scaled to fit the visualization.
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              className="btn btn-primary"
              onClick={applyCustomArray}
              disabled={isRunning}
            >
              Apply Array
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setShowCustomInput(false);
                setCustomArrayText('');
              }}
              disabled={isRunning}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Canvas Container */}
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
        />
        
        {/* Statistics */}
        <div className="stats">
          <div className="stat">
            <span className="stat-label">Comparisons</span>
            <span className="stat-value">{stats.comparisons}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Swaps</span>
            <span className="stat-value">{stats.swaps}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Time</span>
            <span className="stat-value">{stats.time}ms</span>
          </div>
        </div>
        
        {/* Algorithm Info */}
        <div style={{ textAlign: 'center', color: '#666', fontSize: '14px', maxWidth: '600px' }}>
          {selectedAlgorithm === 'bubble' && 'Bubble Sort: Simple comparison-based algorithm with O(n²) complexity'}
          {selectedAlgorithm === 'insertion' && 'Insertion Sort: Builds the final array one item at a time'}
          {selectedAlgorithm === 'selection' && 'Selection Sort: Divides the array into sorted and unsorted regions'}
          {selectedAlgorithm === 'merge' && 'Merge Sort: Divide-and-conquer algorithm with O(n log n) complexity'}
          {selectedAlgorithm === 'quick' && 'Quick Sort: Efficient, comparison-based sorting algorithm'}
        </div>
      </div>
    </div>
  );
};

export default SortingVisualizer; 