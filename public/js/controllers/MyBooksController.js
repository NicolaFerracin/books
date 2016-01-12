app.controller('MyBooksController', ['$scope', '$http', '$window', function($scope, $http, $window) {


  const GOOGLE_API_KEY = "&key=AIzaSyDlf7ANED9sDitd3yVL71yH5HQ4uMxsqQo";
  const URL_START = "https://www.googleapis.com/books/v1/volumes?q="
  $scope.books = [];
  $scope.myBooks = [];

  // TODO when loading the page get all the books owned by the user

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
    // store in database TODO
    newBook.owner = $scope.user.email;
    // remove results
    $scope.books = [];
  }

  // called when the user wants to remove a book from his collection
  $scope.removeBook = function(index) {
      // remove book from $scope
      $scope.myBooks.splice(index, 1);

      // TODO remove book from DB

      // TODO what about the requests?
  }

  processResults = function(data) {
    console.log("Processing results");
    $scope.books = data.items.map(function(book) {
      return {
        googleId : book.id,
        image : (book.volumeInfo.imageLinks) ? book.volumeInfo.imageLinks.thumbnail : "img/no_image.png",
        authors : reduceAuthors(book.volumeInfo.authors),
        title : book.volumeInfo.title,
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
