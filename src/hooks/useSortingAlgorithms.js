import { useCallback, useRef } from 'react';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const useSortingAlgorithms = () => {
  const shouldStopRef = useRef(false);

  const bubbleSort = useCallback(async (array, setArray, setStats, speed, startTime) => {
    let comparisons = 0;
    let swaps = 0;
    const arr = [...array];
    
    for (let i = 0; i < arr.length && !shouldStopRef.current; i++) {
      for (let j = 0; j < arr.length - i - 1 && !shouldStopRef.current; j++) {
        comparisons++;
        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          swaps++;
          setArray([...arr]);
          setStats({
            comparisons,
            swaps,
            time: Date.now() - startTime
          });
          await sleep(101 - speed);
        }
      }
    }
  }, []);

  const insertionSort = useCallback(async (array, setArray, setStats, speed, startTime) => {
    let comparisons = 0;
    let swaps = 0;
    const arr = [...array];
    
    for (let i = 1; i < arr.length && !shouldStopRef.current; i++) {
      let key = arr[i];
      let j = i - 1;
      
      while (j >= 0 && arr[j] > key && !shouldStopRef.current) {
        comparisons++;
        arr[j + 1] = arr[j];
        swaps++;
        j--;
        setArray([...arr]);
        setStats({
          comparisons,
          swaps,
          time: Date.now() - startTime
        });
        await sleep(101 - speed);
      }
      
      arr[j + 1] = key;
      setArray([...arr]);
      setStats({
        comparisons,
        swaps,
        time: Date.now() - startTime
      });
      await sleep(101 - speed);
    }
  }, []);

  const selectionSort = useCallback(async (array, setArray, setStats, speed, startTime) => {
    let comparisons = 0;
    let swaps = 0;
    const arr = [...array];
    
    for (let i = 0; i < arr.length - 1 && !shouldStopRef.current; i++) {
      let minIdx = i;
      
      for (let j = i + 1; j < arr.length && !shouldStopRef.current; j++) {
        comparisons++;
        if (arr[j] < arr[minIdx]) {
          minIdx = j;
        }
      }
      
      if (minIdx !== i) {
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        swaps++;
        setArray([...arr]);
        setStats({
          comparisons,
          swaps,
          time: Date.now() - startTime
        });
        await sleep(101 - speed);
      }
    }
  }, []);

  const mergeSort = useCallback(async (array, setArray, setStats, speed, startTime) => {
    let comparisons = 0;
    let swaps = 0;
    const arr = [...array];
    
    const merge = async (left, mid, right) => {
      const leftArr = arr.slice(left, mid + 1);
      const rightArr = arr.slice(mid + 1, right + 1);
      
      let i = 0, j = 0, k = left;
      
      while (i < leftArr.length && j < rightArr.length && !shouldStopRef.current) {
        comparisons++;
        if (leftArr[i] <= rightArr[j]) {
          arr[k] = leftArr[i];
          i++;
        } else {
          arr[k] = rightArr[j];
          j++;
        }
        swaps++;
        k++;
        setArray([...arr]);
        setStats({
          comparisons,
          swaps,
          time: Date.now() - startTime
        });
        await sleep(101 - speed);
      }
      
      while (i < leftArr.length && !shouldStopRef.current) {
        arr[k] = leftArr[i];
        i++;
        k++;
        swaps++;
        setArray([...arr]);
        setStats({
          comparisons,
          swaps,
          time: Date.now() - startTime
        });
        await sleep(101 - speed);
      }
      
      while (j < rightArr.length && !shouldStopRef.current) {
        arr[k] = rightArr[j];
        j++;
        k++;
        swaps++;
        setArray([...arr]);
        setStats({
          comparisons,
          swaps,
          time: Date.now() - startTime
        });
        await sleep(101 - speed);
      }
    };
    
    const mergeSortHelper = async (left, right) => {
      if (left < right && !shouldStopRef.current) {
        const mid = Math.floor((left + right) / 2);
        await mergeSortHelper(left, mid);
        await mergeSortHelper(mid + 1, right);
        await merge(left, mid, right);
      }
    };
    
    await mergeSortHelper(0, arr.length - 1);
  }, []);

  const quickSort = useCallback(async (array, setArray, setStats, speed, startTime) => {
    let comparisons = 0;
    let swaps = 0;
    const arr = [...array];
    
    const partition = async (low, high) => {
      const pivot = arr[high];
      let i = low - 1;
      
      for (let j = low; j < high && !shouldStopRef.current; j++) {
        comparisons++;
        if (arr[j] < pivot) {
          i++;
          [arr[i], arr[j]] = [arr[j], arr[i]];
          swaps++;
          setArray([...arr]);
          setStats({
            comparisons,
            swaps,
            time: Date.now() - startTime
          });
          await sleep(101 - speed);
        }
      }
      
      [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
      swaps++;
      setArray([...arr]);
      setStats({
        comparisons,
        swaps,
        time: Date.now() - startTime
      });
      await sleep(101 - speed);
      
      return i + 1;
    };
    
    const quickSortHelper = async (low, high) => {
      if (low < high && !shouldStopRef.current) {
        const pi = await partition(low, high);
        await quickSortHelper(low, pi - 1);
        await quickSortHelper(pi + 1, high);
      }
    };
    
    await quickSortHelper(0, arr.length - 1);
  }, []);

  const runAlgorithm = useCallback(async (algorithm, array, setArray, setStats, speed, startTime) => {
    shouldStopRef.current = false;
    
    switch (algorithm) {
      case 'bubble':
        await bubbleSort(array, setArray, setStats, speed, startTime);
        break;
      case 'insertion':
        await insertionSort(array, setArray, setStats, speed, startTime);
        break;
      case 'selection':
        await selectionSort(array, setArray, setStats, speed, startTime);
        break;
      case 'merge':
        await mergeSort(array, setArray, setStats, speed, startTime);
        break;
      case 'quick':
        await quickSort(array, setArray, setStats, speed, startTime);
        break;
      default:
        console.error('Unknown algorithm:', algorithm);
    }
  }, [bubbleSort, insertionSort, selectionSort, mergeSort, quickSort]);

  const stopAlgorithm = useCallback(() => {
    shouldStopRef.current = true;
  }, []);

  return { runAlgorithm, stopAlgorithm };
}; 