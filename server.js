const express = require('express');
const path = require('path');

const app = express();
const PORT = 5000;



app.set('view engine', 'ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
})
app.get('/viewAllTodos', async (_, res) => {
  res.render('viewAllTodos', { operation :"Fetched Todos" });
});


app.get('/deleteTodo', async (_, res) => {
  res.render('deleteTodo', { operation :"Delete Todo", placeholder: "Enter Todo Name To delete" });
});
app.get('/addTodo', async (_, res) => {
  res.render('addTodo', { operation :"Add Todo", placeholder:"Enter a Todo"});
});
app.get('/updateTodo', async (_, res) => {
  res.render('updateTodo', { operation :"Update Todo",placeholder:"Enter Todo Name To Update"});
});
app.get('/searchTodo', async (_, res) => {
  res.render('searchTodo', { operation :"Search Todo",placeholder:"Enter Todo Name To search"});
});

app.post('/addNewTodo', async (req, res) => {
  try {
    const {  userEnteredInput, todoAddPageFromDate, todoAddPageToDate, todoStatus} = req.body;

    const todoData = {
      title: userEnteredInput,
      completed: sliceStatus(todoStatus),
      from: todoAddPageFromDate,
      to: todoAddPageToDate
    };

    const response = await fetch('https://todo-app-ashen-pi.vercel.app/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(todoData)
    });

    if (response.ok) {
      res.status(201).json({ message: "Todo added successfully" });
    } else {
      res.status(400).json({ message: "Failed to add todo" });
    }
  } catch (error) {
    console.error('Error adding todo:', error);
    res.status(500).json({ error: 'Failed to add todo' });
  }
});

app.get('/fetch-todos', async (req, res) => {
  const page = parseInt(req.query.page)     
  const limit = parseInt(req.query.limit);  

  try {
    const response = await fetch('https://todo-app-ashen-pi.vercel.app/api/todos');
    const data = await response.json();

    const totalTodos = data.length;
    const totalPages = Math.ceil(totalTodos / limit);

    if (page < 1 || page > totalPages) {
      return res.status(400).json({ error: 'Invalid page number' });
    }

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTodos = data.slice(startIndex, endIndex);

    res.json({
      currentPage: page,
      totalPages,
      totalTodos,
      limit,
      todos: paginatedTodos
    });

  } catch (error) {
    console.error('Error fetching todos:', error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


app.post('/fetchSingleTodo', async (req, res) => {
  const { value } = req.body;

  try {
    const response = await fetch('https://todo-app-ashen-pi.vercel.app/api/todos');
    const data = await response.json();

    const found = data.find(item => item.title === value);

    if (found) {
      res.status(200).json(found);
    } else {
      res.status(404).json({ message: 'Not Found' });
    }
  } catch (error) {
    console.error("Error fetching todos:", error);
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});
app.delete('/deleteThisTodo', async (req, res) => {
  const { id } = req.body;

  try {
    const response = await fetch(`https://todo-app-ashen-pi.vercel.app/api/todos/${id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      res.status(200).json({ message: "Todo deleted successfully" });
    } else {
      res.status(400).json({ message: "Failed to delete todo" });
    }
  } catch (error) {
    console.error("Error deleting todo:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.put('/updateTodo', async (req, res) => {
  const { addNewTodoInput, fromDate, toDate, status, id } = req.body;

  try {

    const response = await fetch(`https://todo-app-ashen-pi.vercel.app/api/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: addNewTodoInput,
        from: fromDate,
        to: toDate,
        completed: status
      }),
    });

    if (response.ok) {
      res.status(200).json({ ok: true, message: "Todo updated successfully" });
    } else {
      res.status(400).json({ ok: false, message: "Failed to update todo" });
    }
  } catch (error) {
    console.error("Error updating todo:", error);
    res.status(500).json({ ok: false, error: "Internal server error" });
  }
});



const sliceStatus = (status) => {
  if (status === 'true') {
    return true;
  }
  else {
    return false;
  }
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
