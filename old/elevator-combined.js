/**
 * Vertical Transport System
 * A modular lift simulator - Optimized Version
 * (Dead code removed)
 */

// Function to create a simple layout with elevators at ground floor
function createSimpleLayout() {
  // Get container
  const container = document.querySelector('.container');
  if (!container) {
    console.error('Container not found');
    return;
  }
  
  // Clear any existing content
  container.innerHTML = '';
  
  // Create wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'wrapper';
  
  // Create floor labels
  const floorLabels = document.createElement('div');
  floorLabels.className = 'floor-labels';
  
  // Create elevator grid
  const elevatorGrid = document.createElement('div');
  elevatorGrid.className = 'elevator-grid';
  
  // Create buttons column
  const buttonsColumn = document.createElement('div');
  buttonsColumn.className = 'buttons-column';
  
  // Add 10 floors (9th to Ground)
  const floors = ['9th', '8th', '7th', '6th', '5th', '4th', '3rd', '2nd', '1st', 'Ground'];
  const floorCount = floors.length;
  
  // Store references to all slots for elevator movement
  const allSlots = [];
  const elevators = [];
  const pendingCalls = []; // Queue for elevator calls
  
  // Utility to create Audio Context
  let audioContext = null;
  
  function getAudioContext() {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
  }
  
  // Function to play arrival sound
  function playArrivalSound() {
    try {
      const ctx = getAudioContext();
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
  
  // Create each floor
  floors.forEach((floorName, index) => {
    // Create floor label
    const label = document.createElement('div');
    label.className = 'floor-label';
    label.textContent = floorName;
    floorLabels.appendChild(label);
    
    // Create floor row
    const floorRow = document.createElement('div');
    floorRow.className = 'floor-row';
    
    // Floor number (9 to 0)
    const floorNum = floorCount - 1 - index;
    
    // Store slots for this floor
    allSlots[floorNum] = [];
    
    // Create 5 slots for this floor
    for (let i = 0; i < 5; i++) {
      const slot = document.createElement('div');
      slot.className = 'elevator-slot';
      slot.dataset.floor = floorNum;
      slot.dataset.slot = i;
      
      // Add elevator to ground floor only
      if (floorNum === 0) {
        const elevator = createElevator(i);
        elevators[i] = elevator; // Store reference to elevator
        slot.appendChild(elevator);
      }
      
      floorRow.appendChild(slot);
      
      // Store reference to this slot
      allSlots[floorNum][i] = slot;
    }
    
    elevatorGrid.appendChild(floorRow);
    
    // Create button
    const button = document.createElement('button');
    button.className = 'call-button';
    button.textContent = 'Call';
    button.dataset.floor = floorNum;
    
    // Add click handler to move elevator
    button.addEventListener('click', function() {
      const targetFloor = parseInt(this.dataset.floor);
      
      // Show waiting state
      this.textContent = 'Waiting';
      this.className = 'call-button waiting';
      
      // Find the closest available elevator
      let chosenElevator = -1;
      let shortestDistance = Infinity;
      
      for (let i = 0; i < elevators.length; i++) {
        const elevator = elevators[i];
        const currentFloor = parseInt(elevator.dataset.currentFloor || 0);
        const distance = Math.abs(currentFloor - targetFloor);
        
        if (elevator.dataset.status !== 'moving' && distance < shortestDistance) {
          shortestDistance = distance;
          chosenElevator = i;
        }
      }
      
      if (chosenElevator >= 0) {
        // Move the chosen elevator
        moveElevator(elevators[chosenElevator], targetFloor, this);
      } else {
        // Queue the request for later
        pendingCalls.push({
          floor: targetFloor,
          button: this
        });
        console.log(`All elevators busy, queued call to floor ${targetFloor}`);
      }
    });
    
    buttonsColumn.appendChild(button);
  });
  
  // Check if any elevator is available
  function checkForAvailableElevator() {
    if (pendingCalls.length === 0) return; // No pending calls
    
    // Process all pending calls if elevators are available
    let processedCall = false;
    
    // First pass: try to assign calls to elevators that are already at that floor
    for (let callIndex = pendingCalls.length - 1; callIndex >= 0; callIndex--) {
      const call = pendingCalls[callIndex];
      
      // Find elevator that's already at the requested floor
      for (let i = 0; i < elevators.length; i++) {
        const elevator = elevators[i];
        const currentFloor = parseInt(elevator.dataset.currentFloor || 0);
        
        if (elevator.dataset.status !== 'moving' && currentFloor === call.floor) {
          // Remove this call from the queue
          pendingCalls.splice(callIndex, 1);
          
          // Notify user that elevator is already there
          call.button.textContent = 'Arrived';
          call.button.className = 'call-button arrived';
          
          // Reset after 2 seconds
          setTimeout(() => {
            call.button.textContent = 'Call';
            call.button.className = 'call-button';
          }, 2000);
          
          processedCall = true;
          break;
        }
      }
    }
    
    // Second pass: assign remaining calls to available elevators
    const availableElevators = [];
    
    // Collect all available elevators
    for (let i = 0; i < elevators.length; i++) {
      if (elevators[i].dataset.status !== 'moving') {
        availableElevators.push(elevators[i]);
      }
    }
    
    // Process as many calls as we have available elevators
    while (pendingCalls.length > 0 && availableElevators.length > 0) {
      const call = pendingCalls.shift();
      const elevator = availableElevators.pop();
      
      moveElevator(elevator, call.floor, call.button);
      processedCall = true;
    }
    
    // Log if we processed any calls
    if (processedCall) {
      console.log(`Processed queued calls. Remaining in queue: ${pendingCalls.length}`);
    }
  }
  
  // Function to move elevator to target floor
  function moveElevator(elevator, targetFloor, button) {
    const currentFloor = parseInt(elevator.dataset.currentFloor || 0);
    
    // Skip if already on that floor
    if (currentFloor === targetFloor) {
      button.textContent = 'Call';
      button.className = 'call-button';
      return;
    }
    
    // Skip if elevator is already moving
    if (elevator.dataset.status === 'moving') {
      console.log(`Elevator ${elevator.dataset.id} is already moving. Queueing request for floor ${targetFloor}`);
      pendingCalls.push({
        floor: targetFloor,
        button: button
      });
      return;
    }
    
    // Set elevator as moving
    elevator.dataset.status = 'moving';
    
    // Generate unique animation ID to track this movement
    const animationId = Date.now().toString() + Math.floor(Math.random() * 1000);
    elevator.dataset.animationId = animationId;
    
    // Get the elevator's current position
    const currentSlot = allSlots[currentFloor][elevator.dataset.id];
    const targetSlot = allSlots[targetFloor][elevator.dataset.id];
    
    // Calculate positions for animation
    const currentRect = currentSlot.getBoundingClientRect();
    const targetRect = targetSlot.getBoundingClientRect();
    const gridRect = elevatorGrid.getBoundingClientRect();
    
    // Calculate relative positions inside the grid
    const startY = currentRect.top - gridRect.top;
    const endY = targetRect.top - gridRect.top;
    const slotWidth = currentRect.width;
    const centerX = currentRect.left - gridRect.left + slotWidth/2;
    
    // Create a cloned elevator for animation
    const movingElevator = elevator.cloneNode(true);
    movingElevator.className = 'elevator moving';
    movingElevator.style.left = `${centerX - 12}px`; // 12px is half the icon width
    movingElevator.style.top = `${startY}px`;
    
    // Use the actual travel time for transition duration (1 second per floor)
    const transitionDuration = Math.abs(targetFloor - currentFloor);
    movingElevator.style.transition = `top ${transitionDuration}s linear`;
    movingElevator.dataset.animationId = animationId; // Track which animation this is
    
    // Update time indicator
    const timeIndicator = movingElevator.querySelector('.time-indicator');
    const floorsToTravel = Math.abs(targetFloor - currentFloor);
    const travelTime = floorsToTravel * 1000; // 1 second per floor in milliseconds
    
    // Change elevator color to red while moving
    const svgIcon = movingElevator.querySelector('svg');
    svgIcon.style.fill = '#f44336'; // Red for moving elevators
    
    // Create a countdown timer
    let countdownInterval = null;
    if (timeIndicator) {
      // Initial display
      timeIndicator.textContent = `${floorsToTravel} Sec.`;
      
      // Update countdown every second
      let remainingSeconds = floorsToTravel;
      countdownInterval = setInterval(() => {
        remainingSeconds--;
        if (remainingSeconds > 0) {
          timeIndicator.textContent = `${remainingSeconds} Sec.`;
        } else {
          timeIndicator.textContent = `Arrived`;
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
      }, 1000);
      
      // Clear interval when animation completes
      setTimeout(() => {
        if (countdownInterval) {
          clearInterval(countdownInterval);
          countdownInterval = null;
        }
      }, travelTime + 100);
    }
    
    // Remove from current slot
    if (elevator.parentElement) {
      elevator.parentElement.removeChild(elevator);
    }
    
    // Add the moving elevator to the grid
    elevatorGrid.appendChild(movingElevator);
    
    // Start the movement animation precisely at 1 floor per second
    setTimeout(() => {
      movingElevator.style.top = `${endY}px`;
    }, 10);
    
    // After animation is done, update the real elevator
    setTimeout(() => {
      // Check if this is still the current animation
      if (elevator.dataset.animationId !== animationId) {
        console.log(`Animation ${animationId} was superseded, cleaning up`);
        // Clean up the moving elevator if it's still in the DOM
        if (movingElevator.parentElement) {
          movingElevator.parentElement.removeChild(movingElevator);
        }
        return;
      }
      
      // Place elevator in target slot
      targetSlot.appendChild(elevator);
      
      // Update elevator's current floor
      elevator.dataset.currentFloor = targetFloor;
      
      // Remove the animated elevator
      if (movingElevator.parentElement) {
        movingElevator.parentElement.removeChild(movingElevator);
      }
      
      // Play arrival sound
      playArrivalSound();
      
      // Set as arrived and change to green
      elevator.dataset.status = 'arrived';
      elevator.classList.add('arrived');
      const elevatorIcon = elevator.querySelector('svg');
      elevatorIcon.style.fill = '#4CAF50'; // Green on arrival
      
      // Clear time indicator
      if (elevator.querySelector('.time-indicator')) {
        elevator.querySelector('.time-indicator').textContent = '';
      }
      
      // Update button to "Arrived"
      button.textContent = 'Arrived';
      button.className = 'call-button arrived';
      
      // Reset button and elevator status after a delay
      setTimeout(() => {
        // Check if this animation is still valid
        if (elevator.dataset.animationId !== animationId) return;
        
        button.textContent = 'Call';
        button.className = 'call-button';
        
        // Reset elevator
        elevator.classList.remove('arrived');
        elevator.dataset.status = 'idle';
        
        // Reset elevator color to black
        elevatorIcon.style.fill = "#000";
        
        // Check if there are pending calls
        checkForAvailableElevator();
      }, 2000);
    }, travelTime);
  }
  
  // Assemble the layout
  wrapper.appendChild(floorLabels);
  wrapper.appendChild(elevatorGrid);
  wrapper.appendChild(buttonsColumn);
  
  // Add to container
  container.appendChild(wrapper);
  
  console.log('Layout created with 5 elevators at ground floor and movement functionality');
}

// Create a single elevator element
function createElevator(id) {
  const elevator = document.createElement('div');
  elevator.className = 'elevator';
  elevator.dataset.id = id;
  elevator.dataset.currentFloor = 0;
  elevator.dataset.status = 'idle';
  
  // All elevators are black by default
  let iconColor = "#000";
  
  elevator.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="${iconColor}" width="24" height="24">
      <path d="M 15.875 0 C 15.617188 0.0351563 15.378906 0.167969 15.21875 0.375 L 10.21875 6.375 C 9.976563 6.675781 9.929688 7.085938 10.097656 7.433594 C 10.265625 7.78125 10.617188 8 11 8 L 21 8 C 21.382813 8 21.734375 7.78125 21.902344 7.433594 C 22.070313 7.085938 22.023438 6.675781 21.78125 6.375 L 16.78125 0.375 C 16.566406 0.101563 16.222656 -0.0429688 15.875 0 Z M 29.8125 0 C 29.460938 0.0625 29.171875 0.308594 29.046875 0.640625 C 28.925781 0.976563 28.992188 1.351563 29.21875 1.625 L 34.21875 7.625 C 34.410156 7.863281 34.695313 8 35 8 C 35.304688 8 35.589844 7.863281 35.78125 7.625 L 40.78125 1.625 C 41.023438 1.324219 41.070313 0.914063 40.902344 0.566406 C 40.734375 0.21875 40.382813 0 40 0 L 30 0 C 29.96875 0 29.9375 0 29.90625 0 C 29.875 0 29.84375 0 29.8125 0 Z M 32.125 2 L 37.875 2 L 35 5.4375 Z M 16 2.5625 L 18.875 6 L 13.125 6 Z M 3 10 C 1.355469 10 0 11.355469 0 13 L 0 47 C 0 48.644531 1.355469 50 3 50 L 47 50 C 48.644531 50 50 48.644531 50 47 L 50 13 C 50 11.355469 48.644531 10 47 10 Z M 3 12 L 47 12 C 47.554688 12 48 12.445313 48 13 L 48 47 C 48 47.554688 47.554688 48 47 48 L 3 48 C 2.445313 48 2 47.554688 2 47 L 2 13 C 2 12.445313 2.445313 12 3 12 Z M 11 14 C 8.800781 14 7 15.800781 7 18 C 7 20.199219 8.800781 22 11 22 C 13.199219 22 15 20.199219 15 18 C 15 15.800781 13.199219 14 11 14 Z M 11 22 C 7.675781 22 5 24.675781 5 28 L 5 35 C 4.996094 35.386719 5.214844 35.738281 5.5625 35.90625 L 7 36.625 L 7 45 C 7 45.550781 7.449219 46 8 46 L 14 46 C 14.550781 46 15 45.550781 15 45 L 15 36.625 L 16.4375 35.90625 C 16.785156 35.738281 17.003906 35.386719 17 35 L 17 28 C 17 24.675781 14.324219 22 11 22 Z M 25 14 C 22.800781 14 21 15.800781 21 18 C 21 20.199219 22.800781 22 25 22 C 27.199219 22 29 20.199219 29 18 C 29 15.800781 27.199219 14 25 14 Z M 25 22 C 21.675781 22 19 24.675781 19 28 L 19 35 C 18.996094 35.386719 19.214844 35.738281 19.5625 35.90625 L 21 36.625 L 21 45 C 21 45.550781 21.449219 46 22 46 L 28 46 C 28.550781 46 29 45.550781 29 45 L 29 36.625 L 30.4375 35.90625 C 30.785156 35.738281 31.003906 35.386719 31 35 L 31 28 C 31 24.675781 28.324219 22 25 22 Z M 39 14 C 36.800781 14 35 15.800781 35 18 C 35 20.199219 36.800781 22 39 22 C 41.199219 22 43 20.199219 43 18 C 43 15.800781 41.199219 14 39 14 Z M 39 22 C 35.675781 22 33 24.675781 33 28 L 33 35 C 32.996094 35.386719 33.214844 35.738281 33.5625 35.90625 L 35 36.625 L 35 45 C 35 45.550781 35.449219 46 36 46 L 42 46 C 42.550781 46 43 45.550781 43 45 L 43 36.625 L 44.4375 35.90625 C 44.785156 35.738281 45.003906 35.386719 45 35 L 45 28 C 45 24.675781 42.324219 22 39 22 Z M 11 16 C 12.117188 16 13 16.882813 13 18 C 13 19.117188 12.117188 20 11 20 C 9.882813 20 9 19.117188 9 18 C 9 16.882813 9.882813 16 11 16 Z M 25 16 C 26.117188 16 27 16.882813 27 18 C 27 19.117188 26.117188 20 25 20 C 23.882813 20 23 19.117188 23 18 C 23 16.882813 23.882813 16 25 16 Z M 39 16 C 40.117188 16 41 16.882813 41 18 C 41 19.117188 40.117188 20 39 20 C 37.882813 20 37 19.117188 37 18 C 37 16.882813 37.882813 16 39 16 Z M 11 24 C 13.277344 24 15 25.722656 15 28 L 15 34.375 L 13.5625 35.09375 C 13.214844 35.261719 12.996094 35.613281 13 36 L 13 44 L 9 44 L 9 36 C 9.003906 35.613281 8.785156 35.261719 8.4375 35.09375 L 7 34.375 L 7 28 C 7 25.722656 8.722656 24 11 24 Z M 25 24 C 27.277344 24 29 25.722656 29 28 L 29 34.375 L 27.5625 35.09375 C 27.214844 35.261719 26.996094 35.613281 27 36 L 27 44 L 23 44 L 23 36 C 23.003906 35.613281 22.785156 35.261719 22.4375 35.09375 L 21 34.375 L 21 28 C 21 25.722656 22.722656 24 25 24 Z M 39 24 C 41.277344 24 43 25.722656 43 28 L 43 34.375 L 41.5625 35.09375 C 41.214844 35.261719 40.996094 35.613281 41 36 L 41 44 L 37 44 L 37 36 C 37.003906 35.613281 36.785156 35.261719 36.4375 35.09375 L 35 34.375 L 35 28 C 35 25.722656 36.722656 24 39 24 Z"/>
    </svg>
    <div class="time-indicator"></div>
  `;
  
  return elevator;
}

// Initialize the simulation when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Create a simple layout first
  createSimpleLayout();
}); 