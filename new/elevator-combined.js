// NEW VERSION

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Audio Service
class AudioService {
  constructor() {
    this.audioContext = null;
  }

  getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  playArrivalSound() {
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error('Error playing sound:', e);
    }
  }
}

// Elevator State Interface
class ElevatorState {
  constructor(floor, status) {
    this.currentFloor = floor;
    this.status = status;
  }
}

// Elevator Class
class Elevator {
  constructor(id, initialFloor = 0) {
    this.id = id;
    this.state = new ElevatorState(initialFloor, 'idle');
    this.element = this.createElevatorElement();
  }

  createElevatorElement() {
    const elevator = document.createElement('div');
    elevator.className = 'elevator';
    elevator.dataset.id = this.id;
    elevator.dataset.currentFloor = this.state.currentFloor;
    elevator.dataset.status = this.state.status;

    // Add elevator icon and time indicator
    elevator.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="#000" width="24" height="24">
        <path d="M 15.875 0 C 15.617188 0.0351563 15.378906 0.167969 15.21875 0.375 L 10.21875 6.375 C 9.976563 6.675781 9.929688 7.085938 10.097656 7.433594 C 10.265625 7.78125 10.617188 8 11 8 L 21 8 C 21.382813 8 21.734375 7.78125 21.902344 7.433594 C 22.070313 7.085938 22.023438 6.675781 21.78125 6.375 L 16.78125 0.375 C 16.566406 0.101563 16.222656 -0.0429688 15.875 0 Z M 29.8125 0 C 29.460938 0.0625 29.171875 0.308594 29.046875 0.640625 C 28.925781 0.976563 28.992188 1.351563 29.21875 1.625 L 34.21875 7.625 C 34.410156 7.863281 34.695313 8 35 8 C 35.304688 8 35.589844 7.863281 35.78125 7.625 L 40.78125 1.625 C 41.023438 1.324219 41.070313 0.914063 40.902344 0.566406 C 40.734375 0.21875 40.382813 0 40 0 L 30 0 C 29.96875 0 29.9375 0 29.90625 0 C 29.875 0 29.84375 0 29.8125 0 Z M 32.125 2 L 37.875 2 L 35 5.4375 Z M 16 2.5625 L 18.875 6 L 13.125 6 Z M 3 10 C 1.355469 10 0 11.355469 0 13 L 0 47 C 0 48.644531 1.355469 50 3 50 L 47 50 C 48.644531 50 50 48.644531 50 47 L 50 13 C 50 11.355469 48.644531 10 47 10 Z M 3 12 L 47 12 C 47.554688 12 48 12.445313 48 13 L 48 47 C 48 47.554688 47.554688 48 47 48 L 3 48 C 2.445313 48 2 47.554688 2 47 L 2 13 C 2 12.445313 2.445313 12 3 12 Z M 11 14 C 8.800781 14 7 15.800781 7 18 C 7 20.199219 8.800781 22 11 22 C 13.199219 22 15 20.199219 15 18 C 15 15.800781 13.199219 14 11 14 Z M 11 22 C 7.675781 22 5 24.675781 5 28 L 5 35 C 4.996094 35.386719 5.214844 35.738281 5.5625 35.90625 L 7 36.625 L 7 45 C 7 45.550781 7.449219 46 8 46 L 14 46 C 14.550781 46 15 45.550781 15 45 L 15 36.625 L 16.4375 35.90625 C 16.785156 35.738281 17.003906 35.386719 17 35 L 17 28 C 17 24.675781 14.324219 22 11 22 Z M 25 14 C 22.800781 14 21 15.800781 21 18 C 21 20.199219 22.800781 22 25 22 C 27.199219 22 29 20.199219 29 18 C 29 15.800781 27.199219 14 25 14 Z M 25 22 C 21.675781 22 19 24.675781 19 28 L 19 35 C 18.996094 35.386719 19.214844 35.738281 19.5625 35.90625 L 21 36.625 L 21 45 C 21 45.550781 21.449219 46 22 46 L 28 46 C 28.550781 46 29 45.550781 29 45 L 29 36.625 L 30.4375 35.90625 C 30.785156 35.738281 31.003906 35.386719 31 35 L 31 28 C 31 24.675781 28.324219 22 25 22 Z M 39 14 C 36.800781 14 35 15.800781 35 18 C 35 20.199219 36.800781 22 39 22 C 41.199219 22 43 20.199219 43 18 C 43 15.800781 41.199219 14 39 14 Z M 39 22 C 35.675781 22 33 24.675781 33 28 L 33 35 C 32.996094 35.386719 33.214844 35.738281 33.5625 35.90625 L 35 36.625 L 35 45 C 35 45.550781 35.449219 46 36 46 L 42 46 C 42.550781 46 43 45.550781 43 45 L 43 36.625 L 44.4375 35.90625 C 44.785156 35.738281 45.003906 35.386719 45 35 L 45 28 C 45 24.675781 42.324219 22 39 22 Z"/>
      </svg>
      <div class="direction-indicator">⬤</div>
      <div class="time-indicator"></div>
    `;

    return elevator;
  }

  getCurrentFloor() {
    return this.state.currentFloor;
  }

  getStatus() {
    return this.state.status;
  }

  setStatus(status) {
    this.state.status = status;
    this.element.dataset.status = status;
    
    // Update elevator color based on status
    const svgIcon = this.element.querySelector('svg');
    if (svgIcon) {
      if (status === 'moving') {
        svgIcon.style.fill = '#f44336'; // Red for moving
      } else if (status === 'arrived') {
        svgIcon.style.fill = '#4CAF50'; // Green on arrival
      } else {
        svgIcon.style.fill = '#000'; // Black for idle
      }
    }
  }

  setFloor(floor) {
    this.state.currentFloor = floor;
    this.element.dataset.currentFloor = floor;
  }

  updateTimeIndicator(text) {
    const indicator = this.element.querySelector('.time-indicator');
    if (indicator) {
      indicator.textContent = text;
    }
  }

  updateDirectionIndicator(targetFloor) {
    const directionIndicator = this.element.querySelector('.direction-indicator');
    if (!directionIndicator) return;

    const currentFloor = this.getCurrentFloor();
    if (this.state.status === 'moving') {
      directionIndicator.textContent = targetFloor > currentFloor ? '↑' : '↓';
    } else {
      directionIndicator.textContent = '⬤';
    }
  }

  createMovingClone(startY, centerX) {
    const clone = this.element.cloneNode(true);
    clone.className = 'elevator moving';
    clone.style.position = 'absolute';
    clone.style.left = `${centerX - 12}px`; // 12px is half the icon width
    clone.style.top = `${startY}px`;
    return clone;
  }
}

// Elevator Manager
class ElevatorManager {
  constructor(numElevators) {
    this.elevators = Array.from({ length: numElevators }, (_, i) => new Elevator(i));
    this.pendingCalls = [];
    this.audioService = new AudioService();
    this.elevatorGrid = null; // Will be set by UI Manager
  }

  setElevatorGrid(grid) {
    this.elevatorGrid = grid;
  }

  findClosestElevator(targetFloor) {
    let chosenElevator = -1;
    let shortestDistance = Infinity;

    this.elevators.forEach((elevator, index) => {
      const currentFloor = elevator.getCurrentFloor();
      const distance = Math.abs(currentFloor - targetFloor);

      if (elevator.getStatus() !== 'moving' && distance < shortestDistance) {
        shortestDistance = distance;
        chosenElevator = index;
      }
    });

    return chosenElevator;
  }

  async moveElevator(elevatorIndex, targetFloor, onComplete) {
    const elevator = this.elevators[elevatorIndex];
    const currentFloor = elevator.getCurrentFloor();

    if (currentFloor === targetFloor || elevator.getStatus() === 'moving') {
      return;
    }

    elevator.setStatus('moving');
    elevator.updateDirectionIndicator(targetFloor);

    // Get positions for animation
    const currentSlot = this.elevatorGrid.querySelector(`[data-floor="${currentFloor}"][data-slot="${elevatorIndex}"]`);
    const targetSlot = this.elevatorGrid.querySelector(`[data-floor="${targetFloor}"][data-slot="${elevatorIndex}"]`);
    
    if (!currentSlot || !targetSlot) return;

    const gridRect = this.elevatorGrid.getBoundingClientRect();
    const currentRect = currentSlot.getBoundingClientRect();
    const targetRect = targetSlot.getBoundingClientRect();

    const startY = currentRect.top - gridRect.top;
    const endY = targetRect.top - gridRect.top;
    const centerX = currentRect.left - gridRect.left + currentRect.width/2;

    // Create moving elevator clone
    const movingElevator = elevator.createMovingClone(startY, centerX);
    this.elevatorGrid.appendChild(movingElevator);

    // Remove from current slot
    if (elevator.element.parentElement) {
      elevator.element.parentElement.removeChild(elevator.element);
    }

    // Calculate travel time (1 second per floor)
    const floorsToTravel = Math.abs(targetFloor - currentFloor);
    const travelTime = floorsToTravel * 1000;

    // Update time indicator
    let remainingSeconds = floorsToTravel;
    const countdownInterval = setInterval(() => {
      remainingSeconds--;
      elevator.updateTimeIndicator(remainingSeconds > 0 ? `${remainingSeconds} Sec.` : 'Arrived');
    }, 1000);

    // Animate movement
    movingElevator.style.transition = `top ${floorsToTravel}s linear`;
    setTimeout(() => {
      movingElevator.style.top = `${endY}px`;
    }, 50);

    // Wait for animation to complete
    await new Promise(resolve => {
      setTimeout(() => {
        // Clean up
        clearInterval(countdownInterval);
        if (movingElevator.parentElement) {
          movingElevator.parentElement.removeChild(movingElevator);
        }

        // Place elevator in target slot
        targetSlot.appendChild(elevator.element);
        
        // Update elevator state
        elevator.setFloor(targetFloor);
        elevator.setStatus('arrived');
        elevator.updateTimeIndicator('');
        elevator.updateDirectionIndicator(targetFloor);
        
        // Play sound
        this.audioService.playArrivalSound();

        // Reset after delay
        setTimeout(() => {
          elevator.setStatus('idle');
          if (onComplete) onComplete();
          this.checkPendingCalls();
        }, 2000);

        resolve();
      }, travelTime);
    });
  }

  addPendingCall(floor, callback) {
    this.pendingCalls.push({ floor, callback });
  }

  checkPendingCalls() {
    if (this.pendingCalls.length === 0) return;

    const availableElevatorIndex = this.elevators.findIndex(e => e.getStatus() !== 'moving');
    if (availableElevatorIndex === -1) return;

    const nextCall = this.pendingCalls.shift();
    this.moveElevator(availableElevatorIndex, nextCall.floor, nextCall.callback);
  }
}

// UI Manager
class ElevatorUIManager {
  constructor(container, floorCount, elevatorManager) {
    this.container = container;
    this.floorCount = floorCount;
    this.elevatorManager = elevatorManager;
    this.floors = Array.from({ length: floorCount }, (_, i) => floorCount - 1 - i);
    this.init();
  }

  init() {
    this.container.innerHTML = '';
    this.createLayout();
    this.setupEventListeners();
  }

  createLayout() {
    const wrapper = document.createElement('div');
    wrapper.className = 'wrapper';
    
    const floorLabels = this.createFloorLabels();
    const elevatorGrid = this.createElevatorGrid();
    const buttonsColumn = this.createButtonsColumn();
    
    // Set the elevator grid reference in the manager
    this.elevatorManager.setElevatorGrid(elevatorGrid);
    
    wrapper.appendChild(floorLabels);
    wrapper.appendChild(elevatorGrid);
    wrapper.appendChild(buttonsColumn);
    
    this.container.appendChild(wrapper);
  }

  createFloorLabels() {
    const floorLabels = document.createElement('div');
    floorLabels.className = 'floor-labels';
    
    const floorNames = ['9th', '8th', '7th', '6th', '5th', '4th', '3rd', '2nd', '1st', 'Ground'];
    
    floorNames.forEach(floorName => {
      const label = document.createElement('div');
      label.className = 'floor-label';
      label.textContent = floorName;
      floorLabels.appendChild(label);
    });
    
    return floorLabels;
  }

  createElevatorGrid() {
    const elevatorGrid = document.createElement('div');
    elevatorGrid.className = 'elevator-grid';
    
    this.floors.forEach(floorNum => {
      const floorRow = document.createElement('div');
      floorRow.className = 'floor-row';
      
      // Create slots for each elevator
      for (let i = 0; i < this.elevatorManager.elevators.length; i++) {
        const slot = document.createElement('div');
        slot.className = 'elevator-slot';
        slot.dataset.floor = floorNum;
        slot.dataset.slot = i;
        
        // Add elevator to ground floor only
        if (floorNum === 0) {
          const elevator = this.elevatorManager.elevators[i].element;
          slot.appendChild(elevator);
        }
        
        floorRow.appendChild(slot);
      }
      
      elevatorGrid.appendChild(floorRow);
    });
    
    return elevatorGrid;
  }

  createButtonsColumn() {
    const buttonsColumn = document.createElement('div');
    buttonsColumn.className = 'buttons-column';
    
    this.floors.forEach(floorNum => {
      const button = document.createElement('button');
      button.className = 'call-button';
      button.textContent = 'Call';
      button.dataset.floor = floorNum;
      buttonsColumn.appendChild(button);
    });
    
    return buttonsColumn;
  }

  setupEventListeners() {
    const buttons = this.container.querySelectorAll('.call-button');
    
    buttons.forEach(button => {
      // Create a debounced handler for each button
      const debouncedHandler = debounce(() => {
        const targetFloor = parseInt(button.dataset.floor);
        
        // Show waiting state
        button.textContent = 'Waiting';
        button.className = 'call-button waiting';
        
        const chosenElevator = this.elevatorManager.findClosestElevator(targetFloor);
        
        if (chosenElevator >= 0) {
          this.elevatorManager.moveElevator(chosenElevator, targetFloor, () => {
            // Update button to show arrival
            button.textContent = 'Arrived';
            button.className = 'call-button arrived';
            
            // Reset button after delay
            setTimeout(() => {
              button.textContent = 'Call';
              button.className = 'call-button';
            }, 2000);
          });
        } else {
          // Queue the request
          this.elevatorManager.addPendingCall(targetFloor, () => {
            button.textContent = 'Call';
            button.className = 'call-button';
          });
          console.log(`All elevators busy, queued call to floor ${targetFloor}`);
        }
      }, 500); // 500ms debounce delay

      button.addEventListener('click', debouncedHandler);
    });
  }
}

// Initialization
function initializeElevatorSystem() {
  const container = document.querySelector('.container');
  if (!container) {
    console.error('Container not found');
    return;
  }

  const NUM_FLOORS = 10;
  const NUM_ELEVATORS = 5;

  const elevatorManager = new ElevatorManager(NUM_ELEVATORS);
  const uiManager = new ElevatorUIManager(container, NUM_FLOORS, elevatorManager);
}

// Start the application
document.addEventListener('DOMContentLoaded', initializeElevatorSystem); 