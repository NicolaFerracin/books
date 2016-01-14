app.controller('HomeController', function($scope, $http, $location, loggedIn) {

  $scope.books = [];
  $scope.booksAmount = "many";
  $scope.trades = [];
  var asyncToComplete = 2;

  // check if user logged in and set userLoggedIn boolean
  loggedIn.getUser().then(
    function(payload) {
      if (payload.data) {
        $scope.userEmail = payload.data.local.email;
        $scope.userLoggedIn = true;
        // get all the Trades requested by the user
        getTradesRequestedByUser(payload.data.local.email);
      } else {
        console.log("The user is logged out")
      }
    },
    function(errorPayload) {
      console.log("Error: " + errorPayload)
    });

    // get all the books
    // get the total amount of books and update the key
    $http.get("/api/books")
    .success(function(books) {
      $scope.books = books;
      $scope.booksAmount = $scope.books.length;
      asyncToComplete--
      if (asyncToComplete == 0) {
        crossTradesAndBooks();
      }
    })
    .error(function(err) {
      console.log("An error occured: " + err);
    })

    // get all the Trades requested by the user, if the user exists
    getTradesRequestedByUser = function(email) {
      $http.get("/api/trades/" + email)
      .success(function(trades) {
        $scope.trades = trades;
        asyncToComplete--
        if (asyncToComplete == 0) {
          crossTradesAndBooks();
        }
      })
      .error(function(err) {
        console.log("An error occured: " + err);
      })
    }

    // called when the user wants to pass from the description to the books displayer
    $scope.showBooks = function() {
      $("#arrowDown").slideUp({ duration: 1000, queue: false }).fadeOut({ duration: 1000, queue: false});
      $scope.toggleBooks = true;
    }

    // called when the user wants to remove a book from his collection
    $scope.removeBook = function(book) {
      $("#removeBookLink").prop("disabled", true);
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
              // remove book from callerArray
              $scope.books = $scope.books.filter(function(item) { return item._id != book._id });
              $("#removeBookLink").prop("disabled", false);
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
          $("#removeBookLink").prop("disabled", false);
          console.log("Error: " + errorPayload)
        });
      }

      // called when a user request to trade a book - the owner can't call it
      $scope.requestTrade = function(book) {
        $("#requestTradeLink").prop("disabled", true);
        // check if user logged in and set userLoggedIn boolean
        loggedIn.getUser().then(
          function(payload) {
            if (payload.data) {
              // if user == owner return
              if (book.owner == payload.data.local.email) {
                alert("You can't request a trade for your own book.");
                return;
              }
              // create Trade in DB
              var trade = { requestedBy : payload.data.local.email, book : book, requestedTo : book.owner };
              $http.post("/api/trade", trade)
              .success(function(status) {
                console.log(status + " Trade requested!");
                // tag the book as requested so the request button is hidden
                book.isRequested = true;
                $("#requestTradeLink").prop("disabled", false);
              })
              .error(function(err) {
                alert("An error occured: " + err);
                return;
              })
            } else {
              // if userEmail == false, redirects to login
              $location.path("/login");
              return;
            }
          },
          function(errorPayload) {
            console.log("Error: " + errorPayload)
            $("#requestTradeLink").prop("disabled", false);
          });

        }

        // called by the last Ajax call to finish
        crossTradesAndBooks = function() {
          // tag all the books requestedBy user so they cannot be requested again
          var temp = $scope.trades.map(function(trade) { return trade.book._id }); // create an array with only the DB ids of the books requested
          $scope.books.forEach(function (element, index, array) {
            if (temp.indexOf(element._id) > -1) {
              element.isRequested = true;
            }
          });
        }
      });
