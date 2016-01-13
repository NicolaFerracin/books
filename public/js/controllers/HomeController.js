app.controller('HomeController', ['$scope', '$http', function($scope, $http) {

  $scope.toggleBooks = false;
  $scope.books = [];
  $scope.booksAmount = "many";

  // get all the books
  // get the total amount of books and update the key
  $http.get("/api/books")
  .success(function(books) {
    $scope.books = books;
    $scope.booksAmount = $scope.books.length;
  })
  .error(function(err) {
    console.log("An error occured: " + err);
  })

  $scope.showBooks = function() {
    $("#loggedInHome").slideUp({ duration: 1000, queue: false }).fadeOut({ duration: 1000, queue: false});
    $scope.toggleBooks = true;
  }

  // called when the user wants to remove a book from his collection
  $scope.removeBook = function(book) {
    // make sure the user is the owner
    if ($scope.user.local.email != book.owner) {
      alert("You are not the owner of this book.");
      return;
    }
    // remove the book from the DB
    $http.delete("/api/book/" + book.googleId + "/" + book.owner)
    .success(function(status) {
      console.log("The deletion was successfull!");
      // remove book from callerArray
      $scope.books = $scope.books.filter(function(item) { return item._id != book._id });
    })
    .error(function(err) {
      console.log("An error occured: " + err);
    })
    // TODO what about the requests?
  }

}]);
