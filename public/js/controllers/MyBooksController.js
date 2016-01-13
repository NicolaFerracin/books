app.controller('MyBooksController', ['$scope', '$http', '$window', '$location', function($scope, $http, $window, $location) {


  const GOOGLE_API_KEY = "&key=AIzaSyDlf7ANED9sDitd3yVL71yH5HQ4uMxsqQo";
  const URL_START = "https://www.googleapis.com/books/v1/volumes?q="
  $scope.books = [];
  $scope.myBooks = [];
  $scope.user = JSON.parse(window.localStorage.user);

  // if user is logged out, redirect to login page
  if (typeof $scope.user === 'undefined') {
    $location.path("/login");
    return;
  }

  // when loading the page get all the books owned by the user
  $http.get("/api/books/" + $scope.user.local.email)
  .success(function(books) {
    $scope.myBooks = books;
  })
  .error(function(err) {
    console.log("An error occured: " + err);
  })

  // called when searching for a new book to add to the collection
  $scope.search = function(searchString) {
    console.log("Searching");
    // if the alert has been enabled, disable it now
    $scope.showAlert = false;
    // generate URL using API and ENGIN keys plus the search the user wants to perform
    var url = URL_START + searchString + GOOGLE_API_KEY;
    // GET request
    $.ajax({
      url: url
    })
    .done(function(data) {
      console.log("Search was successfull");
      processResults(data);

    })
    .fail(function(err) {
      console.log("An error occured: " + err);
    })
  }

  // called when a book searched is added to the collection
  $scope.addBook = function(newBook) {
    // if user is logged out, redirect to login page
    if (typeof $scope.user.local === 'undefined') {
      $location.path("/login");
      return;
    }
    // if book already in collection, return
    if ($scope.myBooks.map(function(book) {return book.googleId}).indexOf(newBook.googleId) > -1) {
      // let the user know the book is in the collection
      $scope.showAlert = true;
      return;
    }
    // if the alert has been enabled, disable it now
    $scope.showAlert = false;
    // add book to collection
    $scope.myBooks.push(newBook);
    // add owner and trading status
    newBook.owner = $scope.user.local.email;
    newBook.isCurrentlyTraded = false;
    // store in database
    $http.post("/api/book", newBook)
    .success(function(status) {
      console.log(status + " Data saved.");
    })
    .error(function(err) {
      console.log("An error occured: " + err);
    })
    // remove results
    $scope.books = [];
  }

  // called when the user wants to remove a book from his collection
  $scope.removeBook = function(index, book) {
    // make sure the user is the owner
    if ($scope.user.local.email != book.owner) {
      alert("You are not the owner of this book.");
      return;
    }
    // remove the book from the DB
    $http.delete("/api/book/" + book.googleId + "/" + book.owner)
    .success(function(status) {
      console.log("The deletion was successfull!");
      // remove book from $scope
      $scope.myBooks.splice(index, 1);
    })
    .error(function(err) {
      console.log("An error occured: " + err);
    })
    // TODO what about the requests?
  }

  processResults = function(data) {
    console.log("Processing results");
    $scope.books = data.items.map(function(book) {
      return {
        googleId : book.id,
        image : (book.volumeInfo.imageLinks) ? book.volumeInfo.imageLinks.thumbnail : "img/no_image.png", // if no imageLinks obj in volumeInfo, return default image
        authors : reduceAuthors(book.volumeInfo.authors),
        title : book.volumeInfo.title.length > 50 ? book.volumeInfo.title.substring(0, 50) + "..." : book.volumeInfo.title, // if title longer than 50, return 0 to 100 + ...
        subtitle : book.volumeInfo.subtitle,
        publishedDate : book.volumeInfo.publishedDate,
        publisher : book.volumeInfo.publisher}
      });
      $scope.$apply();
    }

    reduceAuthors = function(array) {
      // if no author and array is undefined
      if (!array) {
        return "Not specified";
      }
      // if there are many authors, authors > 3
      if (array.length > 3) {
        // return the first 3 authors plus the "and x more" string attached
        return array.slice(0, 3).join(" - ") + " and " + array.length + " more.";
      }
      // else return just the 3 authors
      return array.slice(0, 3).join(" - ");
    }

  }]);
