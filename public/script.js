const showTtodoBeforeGetsDeletedContainer = document.querySelector('.show-todo-before-gets-deleted-container');
const prevBtn= document.getElementById('prevBtn');
const nextBtn= document.getElementById('nextBtn');

function goBack() {
  window.history.back();
}
let currentPage = 1;
let limit = 5;
let totalpages = 1;

const fetchTodos = async () => {
  const fetchedData = document.querySelector('.fetched-data');
  const loader = document.getElementById('loader');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  fetchedData.innerHTML = '';
  loader.classList.remove('d-none');

  try {
    const response = await fetch(`/fetch-todos?page=${currentPage}&limit=${limit}`);
    const data = await response.json();

    totalpages = data.totalPages;

    // 🔁 Handle button disabling
    prevBtn.classList.toggle('disabled', currentPage === 1);
    nextBtn.classList.toggle('disabled', currentPage === totalpages);

    loader.classList.add('d-none');

    // 🔁 Render todos
    data.todos.forEach((item) => {
      const fetcheditem = document.createElement('div');
      const fromDate = item.from ? new Date(item.from).toLocaleDateString() : 'N/A';
      const toDate = item.to ? new Date(item.to).toLocaleDateString() : 'N/A';
      const status = item.completed ? '✅ Completed' : '❌ Not Completed';

      fetcheditem.innerHTML = `
        <div class="fetch-todos-data mt-3">
          <div class="row mt-2 p-2 border rounded border-success">
            <div class="col-12">
              <h5 class="text-dark text-center mb-2 fw-semibold">${item.title}</h5>
              <p class="text-center mb-1"><strong>Status:</strong> ${status}</p>
            </div>
            <div class="col-12 d-flex gap-1">
              <div class="col-6 border border-dark rounded">
                <div class="row">
                  <div class="col-12 text-center">From:</div>
                  <div class="col-12 text-center">${fromDate}</div>
                </div>
              </div>
              <div class="col-6 border border-dark rounded">
                <div class="row">
                  <div class="col-12 text-center">To:</div>
                  <div class="col-12 text-center">${toDate}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      fetchedData.appendChild(fetcheditem);
    });

  } catch (err) {
    console.error("Error fetching todos:", err);
    loader.classList.add('d-none');
  }
};

const nextPage = () => {
  if (currentPage < totalpages) {
    currentPage++;
    fetchTodos();
  }
};

const prevPage = () => {
  if (currentPage > 1) {
    currentPage--;
    fetchTodos();
  }
};


const fetchTodoByTitle = async (title) => {
  const showTtodoBeforeGetsDeletedContainer = document.querySelector('.show-todo-before-gets-deleted-container');
  const loader = document.getElementById('loader');

  showTtodoBeforeGetsDeletedContainer.innerHTML = '';
  loader.classList.remove('d-none');

  try {
    const response = await fetch('/fetchSingleTodo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value: title }),
    });

    const data = await response.json();
    loader.classList.add('d-none');

    const todoCard = document.createElement('div');

    if (data.message) {
      todoCard.innerHTML = `
        <div class="fetch-todos-data mt-3">
          <h5 class="text-center">Not Found</h5>
        </div>
      `;
    } else {
      const status = data.completed ? '✅ Completed' : '❌ Not Completed';

      todoCard.innerHTML = `
  <div class="fetch-todos-data mt-3">
    <div class="row mt-2 p-2 border rounded border-success">
      <div class="col-12">
        <h5 class="text-dark text-center mb-2 fw-semibold">${data.title}</h5>
        <p class="text-center mb-1"><strong>Status:</strong> ${status}</p>
      </div>
      <div class="col-12 d-flex gap-1 mb-2">
        <button class="btn btn-danger w-100 fw-bold" onclick="deleteThisTodo('${data._id}')">🗑️ Delete</button>
      </div>
      <div class="col-12 d-flex gap-1">
        <div class="col-6 border border-dark rounded">
          <div class="row">
            <div class="col-12 text-center">From:</div>
            <div class="col-12 text-center">${data.from}</div>
          </div>
        </div>
        <div class="col-6 border border-dark rounded">
          <div class="row">
            <div class="col-12 text-center">To:</div>
            <div class="col-12 text-center">${data.to}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <h5 class="text-center mt-2">Record Found</h5>
`;

    }

    showTtodoBeforeGetsDeletedContainer.appendChild(todoCard);
  } catch (error) {
    console.error('Error fetching todo:', error);
    loader.classList.add('d-none');
    alert('Something went wrong. Please try again.');
  }
};
// Handle Delele Api
const deleteThisTodo = async (id) => {

  const confirmation = confirm('Do you want to delete this todo?');

  if (confirmation) {
    try {
      const res = await fetch('/deleteThisTodo', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const responseData = await res.json();

      if (res.ok) {
        alert(responseData.message || "Todo Deleted Successfully");
        value = '';
        showTtodoBeforeGetsDeletedContainer.innerHTML = '';

      } else {
        alert(responseData.message || "Failed to delete todo");
      }

    } catch (error) {
      console.error("Error deleting todo:", error);
      alert("Something went wrong!");
    }
  }
};

const handleInput = ({ addPageActive, todoAddPageFromDate, todoAddPageToDate, todoStatus, updatePageActive, searchPageActive, userEnteredInput, deletePageActive }) => {

  if (addPageActive) {
    console.log(userEnteredInput, todoAddPageFromDate, todoAddPageFromDate, todoStatus)
    if (!userEnteredInput) {
      alert('Enter todo to add');
    } else if (!isNaN(userEnteredInput)) {
      alert('Please enter a task name (not a number)');
    } else if (!todoAddPageFromDate || !todoAddPageToDate) {
      alert("Please choose both From and To dates");
    } else if (new Date(todoAddPageFromDate) > new Date(todoAddPageToDate)) {
      alert('From Date cannot be after To Date');
    } else if (!todoStatus) {
      alert("Please choose a status (completed or not completed)");
    } else {
      const confirmation = confirm('Do you want to save this todo?');
      if (confirmation) {
        addNewTodo(
          userEnteredInput,
          todoAddPageFromDate,
          todoAddPageToDate,
          todoStatus
        );
      }
    }
  }

  else if (updatePageActive) {
    if (userEnteredInput) {
      firstFetchThenUpdate(userEnteredInput);
    } else {
      alert('Enter Todo Name to fetch first then update after it is fetched');
    }
  }

  else if (searchPageActive) {
    if (userEnteredInput) {
      searchPageFetchTodo(userEnteredInput);
    } else {
      alert('Enter Todo Name to search whether it exists or not');
    }
  }
  else if (deletePageActive) {
    if (userEnteredInput) {
      fetchTodoByTitle(userEnteredInput);
    }
    else {
      alert("Enter something to search");
    }
  }

};



if (window.location.pathname === '/updateTodo') {
  const searchButton = document.querySelector('.search-button');
  const updatePage = true;
  searchButton.addEventListener('click', () => {
    const userEnteredInput = document.querySelector('.user-entered-input').value.trim();
    handleInput({ addPageActive: false, todoAddPageFromDate: null, todoAddPageToDate: null, todoStatus: null, updatePageActive: true, searchPageActive: false, userEnteredInput: userEnteredInput, deletePageActive: false });
  });
}

if (window.location.pathname === "/addTodo") {
  const searchButtton = document.querySelector('.search-button');
  const userEnteredInput = document.querySelector('.user-entered-input');
  const fromDate = document.getElementById('fromDate');
  const toDate = document.getElementById('toDate');
  const status = document.getElementById('status');
  if (searchButtton) {
    searchButtton.addEventListener('click', () => {
      handleInput({ addPageActive: true, userEnteredInput: userEnteredInput.value.trim(), todoAddPageFromDate: fromDate.value.trim(), todoAddPageToDate: toDate.value.trim(), todoStatus: status.value.trim(), updatePageActive: false, searchPageActive: false, deletePageActive: false });
    });
  }
}

if (window.location.pathname === "/searchTodo") {
  const searchButtton = document.querySelector('.search-button');
  const userEnteredInput = document.querySelector('.user-entered-input');
  searchButtton.addEventListener('click', () => {
    handleInput({ addPageActive: false, todoAddPageFromDate: null, todoAddPageToDate: null, todoStatus: null, updatePageActive: false, searchPageActive: true, userEnteredInput: userEnteredInput.value.trim(), deletePageActive: false });
  });
}

if (window.location.pathname === "/viewAllTodos") {
  fetchTodos(1, 5);
}

if (window.location.pathname === "/deleteTodo") {
  const searchButtton = document.querySelector('.search-button');
  const userEnteredInput = document.querySelector('.user-entered-input');
  searchButtton.addEventListener('click', () => {
    handleInput({ addPageActive: false, todoAddPageFromDate: null, todoAddPageToDate: null, todoStatus: null, updatePageActive: false, searchPageActive: false, deletePageActive: true, userEnteredInput: userEnteredInput.value.trim() });
  });
}
// Handle POST API TO ADD NEW TODO
const addNewTodo = async (userEnteredInput, todoAddPageFromDate, todoAddPageToDate, todoStatus) => {
  const loader = document.getElementById('loader')
  try {
    loader.classList.remove('d-none')
    const data = await fetch('/addNewTodo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userEnteredInput, todoAddPageFromDate, todoAddPageToDate, todoStatus }),
    });
    const responseData = await data.json();
    loader.classList.add('d-none')
    if (responseData.ok) {
      alert(responseData.message || "Todo added Successfully");
    } else {
      alert(responseData.message || "Failed to add todo");
    }
    clearAllFields()
  }
  catch (err) {
    console.log(err)
  }
}

const clearAllFields = () => {
  document.getElementById('user-entered-input').value = '';
  document.getElementById('fromDate').value = '';
  document.getElementById('toDate').value = '';
  document.getElementById('status').value = '';

}

const handleConfirmUpdate = (id) => {
  const updatedTitle = document.querySelector('.user-want-to-update-todo-title').value.trim();
  const updatedFromDate = document.querySelector('.user-want-to-update-from-date').value.trim();
  const updatedToDate = document.querySelector('.user-want-to-update-to-date').value.trim();
  const updatedStatus = document.querySelector('.user-want-to-update-option').value.trim();

  if (updatedTitle === '') {
    alert("Please enter an updated title");
  } else if (updatedToDate < updatedFromDate) {
    alert("From date cannot be after To date");
  } else if (updatedStatus === '') {
    alert("Please select a status");
  } else {
    const confirmation = confirm("Do you want to update this?");
    if (confirmation) {
      updateTodo(updatedTitle, updatedFromDate, updatedToDate, updatedStatus, id)
    }
  }
};



const firstFetchThenUpdate = async (value) => {
  const showUnupdatedDetailsContainer = document.querySelector('.show-unupdated-details-container');
  showUnupdatedDetailsContainer.innerHTML = '';
  const loader = document.getElementById('loader');
  loader.classList.remove('d-none');

  try {
    const response = await fetch('/fetchSingleTodo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value }),
    });

    const data = await response.json();
    loader.classList.add('d-none');

    if (response.status === 200) {
      const recordFoundOrNotContainer = document.createElement('div');
      recordFoundOrNotContainer.classList.add('record-found-or-not-container', 'mt-3');

      recordFoundOrNotContainer.innerHTML = `
        <h6 class="text-center">Record Found</h6>
      `;

      showUnupdatedDetailsContainer.appendChild(recordFoundOrNotContainer);

      const showUnUpdatedDetails = document.createElement('div');
      showUnUpdatedDetails.classList.add('show-un-updated-data-container');
      showUnUpdatedDetails.innerHTML = `
        <div class="row mt-3">
          <div class="col-12">
              <input type="text" value="${data.title}" class="w-100 user-want-to-update-todo-title">
          </div>
          <div class="col-12 d-flex mt-2 gap-2 ">
              <div class="col-6">
                  <div class="row">
                      <div class="col-12 text-center w-100">From Date</div>
                      <div class="col-12"><input type="date" class="w-100 user-want-to-update-from-date" value="${data.from}"></div>
                  </div>
              </div>
              <div class="col-6">
                  <div class="row">
                      <div class="col-12 text-center w-100">Due Date</div>
                      <div class="col-12"><input type="date" class="w-100 user-want-to-update-to-date" value="${data.to}"></div>
                  </div>
              </div>
          </div>
          <div class="col-12 d-flex mt-3">
              <div class="col-12">
                  <select id="status" name="status" class="w-100 user-want-to-update-option">
                      <option value="">Select Status</option>
                      <option value="true" ${data.completed === true ? 'selected' : ''}>Completed</option>
                      <option value="false" ${data.completed === false ? 'selected' : ''}>Not Completed</option>
                  </select>
              </div>
          </div>
          <div class="col-12 mt-3">
              <button class="bg-success w-100 text-light" onclick="handleConfirmUpdate('${data._id}')">Update</button>
          </div>
        </div>
      `;
      showUnupdatedDetailsContainer.appendChild(showUnUpdatedDetails);

    } else {
      const recordFoundOrNotContainer = document.createElement('div');
      recordFoundOrNotContainer.classList.add('record-found-or-not-container', 'mt-3');
      recordFoundOrNotContainer.innerHTML = `
        <h6 class="text-center">Record Not Found</h6>
      `;
      showUnupdatedDetailsContainer.appendChild(recordFoundOrNotContainer);
    }

  } catch (error) {
    console.log(error);
  }
};
// Handle PUT API TO UPDATE TODO
const updateTodo = async (addNewTodoInput, fromDate, toDate, status, id) => {
  const showUnupdatedDetailsContainer = document.querySelector('.show-unupdated-details-container');
  try {
    const data = await fetch('/updateTodo', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ addNewTodoInput, fromDate, toDate, status, id }),
    });

    const responseData = await data.json();

    if (responseData.ok) {
      alert("Todo Updated Successfully");

    } else {
      alert("Failed to update todo");
    }
    showUnupdatedDetailsContainer.innerHTML = '';
  }
  catch (error) {
    console.log(error)
  }


}

// HANDLE API TO FETCH SINGLE TODO
const searchPageFetchTodo = async (value) => {
  const showTodoAvailableOrNot = document.querySelector('.show-todo-available-or-not-container');
  const loader = document.getElementById('loader');

  loader.classList.remove('d-none');
  showTodoAvailableOrNot.innerHTML = '';

  try {
    const response = await fetch('/fetchSingleTodo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value }),
    });

    const searchFetchedData = await response.json();
    loader.classList.add('d-none');

    const showTodoAvailableStatus = document.createElement('div');
    showTodoAvailableStatus.classList.add('show-todo-available-status');

    if (response.status === 200 && searchFetchedData) {
      showTodoAvailableStatus.innerHTML = `
        <h6 class="mt-3 text-center">✅ Record Found</h6>
      `;

    }
    else if (response.status === 404) {
      showTodoAvailableStatus.innerHTML = `
        <h6 class="mt-3 text-center">❌ Sorry, No Record Found</h6>
      `;
    }

    showTodoAvailableOrNot.appendChild(showTodoAvailableStatus);

  } catch (error) {
    loader.classList.add('d-none');
    console.log(error);
  }
};




