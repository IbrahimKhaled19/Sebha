const homeButton = document.getElementById("home-button");
const historyButton = document.getElementById("history-button");
const settingsButton = document.getElementById("settings-button");
const homeSection = document.getElementById('home-section');
const historySection = document.getElementById('history-section');
const settingsSection = document.getElementById('settings-section');  
const prayer = document.getElementById("prayer");
const PrayerInfo = document.getElementById("info");
const recordNumber = document.getElementById("record-number");
const Modal = new bootstrap.Modal(document.querySelector(".modal"));
const ModalText = document.querySelector(".modal-text");
const ModalTitle = document.querySelector(".modal-title");
const countBtn = document.querySelector("#count-btn")
let countInt = 0;

//----------------------------------------------------//
// All the functions
// let time = performance.timing;

// let pageloadtime = time.loadEventStart - time.navigationStart;
// console.log(pageloadtime)
function vibrate(){ 
  if(navigator.vibrate){
    navigator.vibrate(100);
  }
}
//----------------------------------------------------//
// Retrieve stored data on page load
window.addEventListener('load', () => {
  const storedPrayer = localStorage.getItem('selectedPrayer');
  const storedCount = localStorage.getItem('prayerCount');
  
  if (storedPrayer && storedCount !== null) {
    prayer.textContent = storedPrayer;
    prayer.style.fontSize = '0.5px'
    prayer.style.visibility='hidden'
    document.getElementById('dropdownMenuButton2').textContent = storedPrayer;
    countInt = parseInt(storedCount);
    document.querySelector("#count").textContent = countInt.toString();
  }
  // let pageloadtime = time.loadEventStart - time.navigationStart;
  // alert(pageloadtime)
});

document.querySelectorAll('.dropdown-item').forEach(item => {
  item.addEventListener('click', function(e) {
    e.preventDefault();

    let selectedText = this.textContent;
    let content = this.getAttribute('data-content');

    if (selectedText !== prayer.textContent) {
      resetCount(); // Reset the count when a different prayer is selected
      savePrayerData(selectedText, 0); // Save new prayer with reset count
    }
    //Update the modal text and title
    ModalText.textContent = content;
    ModalTitle.textContent = selectedText;
    // Show the modal
    Modal.show()
    // Update the prayer name and dropdown button text
    prayer.textContent = selectedText;
    document.getElementById('dropdownMenuButton2').textContent = selectedText;
  });
});
//-------------------------------------------------
function setupButtonListeners(buttons) {
  buttons.forEach((button) => {
    button.element.addEventListener('click', () => {
      // Hide all sections and reset all button classes
      
      buttons.forEach(btn => {
        btn.element.className = 'text-black-50'; // Reset class for all buttons
        btn.section.classList.add('d-none');
      });
      
      // Show the clicked section and activate the corresponding button
      button.section.classList.remove('d-none');
      button.element.className = button.activeClass; // Apply active class to clicked button

      
    });
   
  });
}
const buttons = [
  { element: homeButton ,activeClass:"active",section:homeSection},
  { element: historyButton ,activeClass:"active",section:historySection},
  { element: settingsButton ,activeClass:"active",section:settingsSection}
]

setupButtonListeners(buttons);
//-------------------------------------------------
document.querySelector("#count-btn").addEventListener('click', () => {
  countInt++; // Increment the count
  document.querySelector("#count").textContent = countInt.toString(); // Update the display
  savePrayerData(prayer.textContent, countInt); // Save the updated count for the current prayer
});

document.querySelector("#reset-btn").addEventListener('click', () => {
  resetCount()
});
//-------------------------------------------------
function resetCount(){
  countInt = 0; // Reset the count
  document.querySelector("#count").textContent = countInt.toString(); // Update the display
  savePrayerData(prayer.textContent, countInt); // Save the updated count for the current prayer
}
function savePrayerData(prayerName, countValue) {
  const lastSaveTime = localStorage.getItem('lastSaveTime');
  const currentTime = Date.now();

  if (lastSaveTime) {
    const timeDifference = (currentTime - parseInt(lastSaveTime, 10)) / 1000; // Convert milliseconds to seconds

    if (timeDifference >= 10 && timeDifference <= 30) {
      console.log('Record not saved: Time difference is between 10 to 30 seconds from the last record.');
      return;
    }
  }

  // Save the new record and update the last save time
  localStorage.setItem('selectedPrayer', prayerName);
  localStorage.setItem('prayerCount', countValue.toString());
  localStorage.setItem('lastSaveTime', currentTime.toString());
}
//-------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const historyContainer = document.getElementById('history-container');
  let  prayerHistory = JSON.parse(localStorage.getItem('prayerHistory')) || [];
    
  
  const updateRecordCount = () => {
    recordNumber.textContent = prayerHistory.length + (prayerHistory.length === 1 ? " Record" : " Records");
  };

  const updateLocalStorage = () => {
    localStorage.setItem('prayerHistory', JSON.stringify(prayerHistory));
  };

  const addClearButton = (historyItemWrapper, clearButton) => {
    if (!historyItemWrapper.contains(clearButton)) {
      historyItemWrapper.appendChild(clearButton);
    }
  };

  const removeClearButton = (historyItemWrapper, clearButton) => {
    if (historyItemWrapper.contains(clearButton)) {
      clearButton.remove();
    }
  };

  const deleteHistoryItem = (prayerData, historyItemWrapper) => {
    // Update the prayerHistory array
    prayerHistory = prayerHistory.filter(data => data !== prayerData);
    updateLocalStorage();

    // Remove the history item from the DOM
    historyItemWrapper.remove();

    // Update the record count
    updateRecordCount();
  };

  prayerHistory.forEach(prayerData => {
    const historyItemWrapper = document.createElement('div');
    historyItemWrapper.className = 'history-item-wrapper';

    const historyItem = document.createElement('div');
    historyItem.className = 'history-item shadow user-select-none';
    historyItem.innerHTML = `
        <p><strong>Prayer Name:</strong> ${prayerData.name}</p>
        <p><strong>Prayer Count:</strong> ${prayerData.count}</p>
        <p><strong>Date:</strong> ${prayerData.date}</p>
    `;

    const clearButton = document.createElement('button');
    clearButton.className = 'clear-btn';
    clearButton.innerHTML = '<i class="fas fa-trash-alt"></i>';

    clearButton.addEventListener('click', () => {
      deleteHistoryItem(prayerData, historyItemWrapper);
    });

    historyItemWrapper.appendChild(historyItem);
    historyContainer.appendChild(historyItemWrapper);

    // Add swipe event listener
    addSwipeListener(historyItemWrapper);

    // Handle swipe event
    historyItemWrapper.addEventListener('swipe', () => {
      addClearButton(historyItemWrapper, clearButton);
    });

    // Handle double-click event, only on Windows
    if (navigator.platform.indexOf('Win') > -1) {
      historyItem.addEventListener('dblclick', () => {
        addClearButton(historyItemWrapper, clearButton);
      });
    }

    // Ensure the clear button is removed if not in use
    document.addEventListener('click', (e) => {
      if (!historyItemWrapper.contains(e.target) && !e.target.classList.contains('clear-btn')) {
        removeClearButton(historyItemWrapper, clearButton);
      }
    });

    // Update the record count initially
    updateRecordCount();
  });
});

window.addEventListener('beforeunload', function (event) {
  // Save the prayer data here
  const prayerData = {
      name: prayer.textContent,
      count: countInt,
      date: new Date().toLocaleString()
  };
  if(prayerData.count !=0){
    let prayerHistory = JSON.parse(localStorage.getItem('prayerHistory')) || [];
    prayerHistory.push(prayerData);
    localStorage.setItem('prayerHistory', JSON.stringify(prayerHistory));
  } else {
    console.error("Count is zero, not saving to history.");
  }
});



let touchstartX = 0;
let touchendX = 0;
let swipeThreshold = 50; // Minimum distance in pixels for a valid swipe

function addSwipeListener(element) {
  element.addEventListener('touchstart', function(event) {
    touchstartX = event.changedTouches[0].screenX;
  }, false);

  element.addEventListener('touchmove', function(event) {
    let touchCurrentX = event.changedTouches[0].screenX;
    let swipeDistance = touchCurrentX - touchstartX;
    if (swipeDistance < 0) {
      element.style.transform = `translateX(${swipeDistance}px)`;
    }
  }, false);

  element.addEventListener('touchend', function(event) {
    touchendX = event.changedTouches[0].screenX;
    let swipeDistance = touchendX - touchstartX;
    if (Math.abs(swipeDistance) > swipeThreshold) {
      handleSwipe(element, swipeDistance);
    } else {
      // Reset the element's position if swipe is not valid
      element.style.transform = 'translateX(0)';
    }
  }, false);
}

function handleSwipe(element, swipeDistance) {
  if (swipeDistance < 0) {
    // Shrink the element and show the clear button
    element.style.transform = 'translateX(0px)'; // Move it left by 0px
    element.classList.add('shrink');
    
    // Check if a clear button already exists
    if (!element.querySelector('.clear-btn')) {
      const clearButton = document.createElement('button');
      clearButton.className = 'clear-btn';
      clearButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
      element.appendChild(clearButton);

      clearButton.addEventListener('click', function() {
        const prayerHistory = JSON.parse(localStorage.getItem('prayerHistory')) || [];
        const updatedHistory = prayerHistory.filter(prayerData => {
          return !element.innerHTML.includes(prayerData.name) || !element.innerHTML.includes(prayerData.date);
        });
        localStorage.setItem('prayerHistory', JSON.stringify(updatedHistory));
        element.remove();
        recordNumber.textContent = updatedHistory.length + (updatedHistory.length === 1 ? " Record" : " Records");
      });
    }
  } else if (swipeDistance > 0) {
    // Expand the element and hide the clear button
    element.style.transform = 'translateX(0)';
    element.classList.remove('shrink');
    const clearButton = element.querySelector('.clear-btn');
    if (clearButton) {
      clearButton.remove();
    }
  }
}
document.getElementById('clear-history-btn').addEventListener('click', function() {
  if (confirm('Are you sure you want to clear the history?')) {
      recordNumber.textContent = "0 Records"
      localStorage.removeItem('prayerHistory');
      const historyContainer = document.getElementById('history-container');
      while (historyContainer.firstChild) {
        historyContainer.removeChild(historyContainer.firstChild);
      }
  }

});
function toogleDropdownColor(){
  document.querySelector(".dropdown-toggle").classList.remove("text-black-50")
}
document.addEventListener('DOMContentLoaded', () => {
  const darkModeSwitch = document.getElementById('flexSwitchCheckDark');
  const vibrationSwitch = document.getElementById('flexSwitchCheckVibration');

  // Retrieve and apply the saved states from local storage
  const darkModeState = localStorage.getItem('darkMode') === 'true';
  const vibrationState = localStorage.getItem('vibration') === 'true';

  darkModeSwitch.checked = darkModeState;
  vibrationSwitch.checked = vibrationState;

  if (darkModeState) {
    document.body.classList.add('dark-mode');
    toogleDropdownColor();
  }

  if (vibrationState) {
    countBtn.onclick = vibrate;
  }

  // Save the state of the dark mode switch in local storage when it changes
  darkModeSwitch.addEventListener('change', () => {
    let isChecked = darkModeSwitch.checked;
    localStorage.setItem('darkMode', isChecked);
    if (isChecked) {
      document.body.classList.add('dark-mode');
      toogleDropdownColor();
    } else {
      document.body.classList.remove('dark-mode');
      document.querySelector(".dropdown-toggle").classList.add("text-black-50");
    }
  });

  // Save the state of the vibration switch in local storage when it changes
  vibrationSwitch.addEventListener('change', () => {
    let isChecked = vibrationSwitch.checked;
    localStorage.setItem('vibration', isChecked);
    if (isChecked) {
      countBtn.onclick = vibrate;
    } else {
      countBtn.onclick = null;
    }
  });
});
