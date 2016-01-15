app.controller('MyBooksController', function($scope, $http, loggedIn, $location) {


  const GOOGLE_API_KEY = "&key=AIzaSyCtk8QlCCNZ9Wf7d88OEBqiCLOiY6SeuVg";
  const URL_START = "https://www.googleapis.com/books/v1/volumes?q=";
  $scope.books = [];
  $scope.myBooks = [];

  // alhorithm to produce random books
  /*
  var letters = ["a", "b", "c", "d", "e", "f", "g", "i"];
  var search = [];
  for (var i = 0; i < 800; i++) {
    var word = "";
    for (var x = 0; x < 5; x++) {
      word += (letters[Math.floor(Math.random() * 8)]);
    }
    search.push(word);
  }

  for (var i = 0; i < search.length; i++) {
    var url = URL_START + search[i] + GOOGLE_API_KEY;
    // GET request
    $.ajax({
      url: url
    })
    .done(function(data) {
      console.log("Search was successfull");
      $scope.addBook({
        googleId : data.items[0].id,
        image : (data.items[0].volumeInfo.imageLinks) ? data.items[0].volumeInfo.imageLinks.thumbnail : "img/no_image.png", // if no imageLinks obj in volumeInfo, return default image
        authors : reduceAuthors(data.items[0].volumeInfo.authors),
        title : data.items[0].volumeInfo.title.length > 50 ? data.items[0].volumeInfo.title.substring(0, 50) + "..." : data.items[0].volumeInfo.title, // if title longer than 50, return 0 to 100 + ...
        subtitle : data.items[0].volumeInfo.subtitle,
        publishedDate : data.items[0].volumeInfo.publishedDate,
        publisher : data.items[0].volumeInfo.publisher
      })
    })
    .fail(function(err) {
      console.log("An error occured: " + err);
    })
  }
  */

  // check if user logged in
  loggedIn.getUser().then(
    function(payload) {
      if (payload.data) {
        // get all the books owned by the user
        $http.get("/api/books/" + payload.data.local.email)
        .success(function(books) {
          $scope.myBooks = books;
        })
        .error(function(err) {
          console.log("An error occured: " + err);
        })
      } else {
        $location.path("/login");
        return;
      }
    },
    function(errorPayload) {
      console.log("Error: " + errorPayload)
    });

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
      // check if user logged in
      loggedIn.getUser().then(
        function(payload) {
          if (payload.data) {
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
            // add owner
            newBook.owner = payload.data.local.email;
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
          } else {
            // if userEmail == false, redirects to login
            $location.path("/login");
            return;
          }
        },
        function(errorPayload) {
          console.log("Error: " + errorPayload)
        });
      }

      // called when the user wants to remove a book from his collection
      $scope.removeBook = function(index, book) {
        // check if user logged in
        loggedIn.getUser().then(
          function(payload) {
            if (payload.data) {
              // make sure the user is the owner
              if (payload.data.local.email != book.owner) {
                alert("You are not the owner of this book.");
                return;
              }
              // remove the book from the DB
              $http.delete("/api/book/" + book.googleId + "/" + book._id + "/" + book.owner)
              .success(function(status) {
                console.log("The deletion was successfull!");
                // remove book from $scope
                $scope.myBooks.splice(index, 1);
              })
              .error(function(err) {
                console.log("An error occured: " + err);
              })
            } else {
              // if userEmail == false, redirects to login
              $location.path("/login");
              return;
            }
          },
          function(errorPayload) {
            console.log("Error: " + errorPayload)
          });
        }

        // process the data got from the Google Books API
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

        });
