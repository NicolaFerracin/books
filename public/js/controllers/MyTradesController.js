app.controller('MyTradesController', function($scope, $http, loggedIn, $location) {

  // check if user logged in
  loggedIn.getUser().then(
    function(payload) {
      if (payload.data) {
        // get email
        $scope.userEmail = payload.data.local.email;
        // get all the trades with user as requestedBy or requestedTo
        $http.get("/api/trades/" + payload.data.local.email)
        .success(function(trades) {
          processTrades(trades)
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

    // called while loading the page, right after receving all the trades in which the user is involved
    processTrades = function(trades) {
      // divide the trades in 3
      // waiting to be accepted
      $scope.tradesToAccept = trades.filter(function(trade) {
        return trade.requestedTo == $scope.userEmail && !trade.accepted;
      });
      // requested by the User
      $scope.tradesRequested = trades.filter(function(trade) {
        return trade.requestedBy == $scope.userEmail && !trade.accepted;
      });
      // accepted, with who accepted it
      $scope.tradesAccepted = trades.filter(function(trade) {
        return trade.accepted == true;
      });
    }

    // called by the user when it wants to accept a trade requestedTo it
    $scope.acceptTrade = function(trade) {
      // check if user logged in
      loggedIn.getUser().then(
        function(payload) {
          if (payload.data) {
            // make sure the user is the requestedBy or requestedTo
            if (payload.data.local.email != trade.requestedBy && payload.data.local.email != trade.requestedTo) {
              alert("This is not your request.");
              return;
            }
            console.log("here")
            // update the trade from the DB
            $http.post("/api/trade/" + trade._id)
            .success(function(status) {
              console.log("The deletion was successfull!");
              // get trade's index
              var index = $scope.tradesToAccept.map(function(trade) {return trade._id}).indexOf(trade._id);
              // set the trade as accepted
              $scope.tradesToAccept[index].accepted = true;
              // copy the trade to the tradesAccepted array
              $scope.tradesAccepted.push($scope.tradesToAccept[index]);
              // remove the trade
              $scope.tradesToAccept.splice(index, 1);
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

    // called when a user wants to remove a trade from his trades, requestedBy or requestedTo it
    $scope.deleteTrade = function(trade) {
      // check if user logged in
      loggedIn.getUser().then(
        function(payload) {
          if (payload.data) {
            // make sure the user is the requestedBy or requestedTo
            if (payload.data.local.email != trade.requestedBy && payload.data.local.email != trade.requestedTo) {
              alert("This is not your request.");
              return;
            }
            // remove the trade from the DB
            $http.delete("/api/trade/" + trade._id)
            .success(function(status) {
              console.log("The deletion was successfull!");
              // remove trade from $scope
              var index = $scope.tradesToAccept.map(function(trade) {return trade._id}).indexOf(trade._id);
              if (index > -1) {
                $scope.tradesToAccept.splice(index, 1);
              } else {
                index = $scope.tradesRequested.map(function(trade) {return trade._id}).indexOf(trade._id);
                $scope.tradesRequested.splice(index, 1);
              }
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

    });
