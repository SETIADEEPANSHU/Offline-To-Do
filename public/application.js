(function() {
  var db, namee, datee, ul;
 
  databaseOpen(function() {
    namee = document.querySelectorAll('input')[0];
    datee = document.querySelectorAll('input')[1];
    ul = document.querySelector('ul');
    document.getElementById('todoForm').addEventListener('submit', onSubmit);
    ul.addEventListener('click', onClick);
    databaseTodosGet(renderAllTodos);
  });
 
  function onClick(e) {
    if (e.target.hasAttribute('id') ) {
      databaseTodosDelete(parseInt(e.target.getAttribute('id'), 10), function() {
        databaseTodosGet(renderAllTodos);
      });
    }
  }
 
  function renderAllTodos(todos) {
    var html = '';
    todos.forEach(function(todo) {
      html += todoToHtml(todo);
    });
    ul.innerHTML = html;
  }
 
  function todoToHtml(todo) {
    return '<li id="'+todo.timeStamp+'" class="list-group-item">'+todo.name+' : '+todo.date+'</li>';
  }

  function onSubmit(e) {
    e.preventDefault();
    databaseTodosAdd(namee.value,datee.value, function() {
    databaseTodosGet(renderAllTodos);
      namee.value = '';
      datee.value = '';
    });
  }
 
  function databaseOpen(callback) {
    var version = 1;
    var request = indexedDB.open('todos', version);
    request.onupgradeneeded = function(e) {
      db = e.target.result;
      e.target.transaction.onerror = databaseError;
      db.createObjectStore('todo', { keyPath: 'timeStamp' });
    };

    request.onsuccess = function(e) {
      db = e.target.result;
      callback();
    };
    request.onerror = databaseError;
  }
 
  function databaseError(e) {
    console.error('An IndexedDB Error has occurred', e);
  }
 
  function databaseTodosAdd(name, date, callback) {
    var transaction = db.transaction(['todo'], 'readwrite');
    var store = transaction.objectStore('todo');
    var request = store.put({
      name: name,
      date: date,
      timeStamp: Date.now()
    });
 
    transaction.oncomplete = function(e) {
      callback();
    };
    request.onerror = databaseError;
  }

  function databaseTodosGet(callback) {
    var transaction = db.transaction(['todo'], 'readonly');
    var store = transaction.objectStore('todo');
    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = store.openCursor(keyRange);
    var data = [];
    cursorRequest.onsuccess = function(e) {
      var result = e.target.result;
      if (result) {
        data.push(result.value); 
        result.continue();
      } else {
        callback(data);
      }
    };
  }

  function databaseTodosDelete(id, callback) {
    var transaction = db.transaction(['todo'], 'readwrite');
    var store = transaction.objectStore('todo');
    var request = store.delete(id);
    transaction.oncomplete = function(e) {
      callback();
    };
    request.onerror = databaseError;
  }
 
}());
