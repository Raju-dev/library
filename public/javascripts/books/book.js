angular.module('features.book',['ui.router', 'ui.bootstrap'])
.config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider){
  $stateProvider
  .state('book',{
    abstract : true,
    url : '/book',
    views : {
      header : {
        templateUrl : 'views/sections/header.html'
      },
      content : {
        templateUrl : 'views/book/bookcontent.html'
      }
    },
    controller : 'features.controllers.BookController'
  })
  .state('book.addbook',{
    url : '/addbook',
    templateUrl : 'views/book/addbook.html',
    controller : 'features.controllers.BookController'
  })
  .state('book.manage',{
    url : '/manage',
    templateUrl : 'views/book/manage.html',
    controller : 'features.controllers.BookManageController'
  })
  .state('book.transactions',{
    url : '/transactions',
    templateUrl : 'views/book/transactions.html',
    controller : 'features.controllers.TransactionsController'
  })
}])
.controller("features.controllers.TransactionsController",[
  '$scope',
  '$http',
  function($scope, $http){
  //Set deafault status
  $scope.transactions = [];
  $scope.apiUrl = "http://localhost:3000/api/";

  $scope.loadTransactions = function(){
    $http.get($scope.apiUrl+'transactions')
    .then(function(result){
      $scope.transactions = result.data;
    })
    .catch(function(error){
      alert("Something went wrong. We were unale to load notifications");
    });
  };
  $scope.loadTransactions();
}])
.controller("features.controllers.BookController",[
  '$scope',
  '$http',
  '$uibModal',
  '$uibModalInstance',
  function($scope, $http, $uibModal, $uibModalInstance){
  //Set deafault status
  $scope.status = String(1);
  $scope.apiUrl = "http://localhost:3000/api/";

  $scope.save = function(){
    if($scope.bookForm.$valid){
      var params = {
        author_name : $scope.authorname,
        name : $scope.name,
        isbn : $scope.isbn,
        availability : $scope.status
      };

      $http.post($scope.apiUrl+'books', params)
      .then(function(result){
        $scope.success = true;
        $uibModalInstance.close(result.data);
      })
      .catch(function(error){
        alert("Something went wrong try again later!");
      })
    }
  }
}])
.controller("features.controllers.EditBookController",['$scope',
'$http',
'$uibModalInstance',
'user',
function($scope, $http, $uibModalInstance, user){
  //Set deafault status
  $scope.user = angular.copy(user);

  $scope.apiUrl = "http://localhost:3000/api/";

  $scope.save = function(){
    if($scope.editBookForm.$valid){
      var params = {
        _id : $scope.user._id,
        author_name : $scope.user.author_name,
        name : $scope.user.name,
        isbn : $scope.user.isbn
      };

      $http.post($scope.apiUrl+'books', params)
      .then(function(result){
        $scope.success = true;
        $uibModalInstance.close(params);
      })
      .catch(function(error){
        alert("Something went wrong try again later!");
      });
    }
  }
}])
.controller("features.controllers.BookManageController",['$scope', '$http', '$uibModal', function($scope, $http, $uibModal){
  $scope.books = [];
  $scope.apiUrl = "http://localhost:3000/api/";

  $scope.loadUsers = function(){
    $http.get($scope.apiUrl+'books')
    .then(function(result){
      $scope.books = result.data;
    })
    .catch(function(error){
      alert("Unable to load users this time. Something went wrong.");
    });
  };

  $scope.returnBook = function(book){
    var params = {
      book_id : book._id,
      returned_date : new Date(),
      type : "return"
    };
    $http.post($scope.apiUrl+"transaction", params)
    .then(function(result){
      $scope.loadUsers();
    })
    .catch(function(error){
      if(error.data.message){
        alert(error.data.message);
        return;
      }
      alert("Something went wrong try again later!");
    });
  };


  $scope.issueBook = function(book){
    var modal = $uibModal.open({
      templateUrl: 'views/book/issuebook.html',
      controller: 'features.controllers.IssueBookController',
      size: 'md',
      resolve : {
        book : function(){
          return angular.copy(book);
        }
      }
    });

    modal.result.then(function(result){
      $scope.loadUsers();
    });
  };

  $scope.deleteBook = function(book){
    var confirm = window.confirm("Are you sure you want to delete this book.");
    if(!confirm){
      return;
    }
    $http.delete($scope.apiUrl+"book/"+book._id)
    .then(function(result){
      $scope.loadUsers();
    })
    .catch(function(error){
      console.log(error);
    });
  };

  $scope.addBook = function(){
    var modal = $uibModal.open({
      templateUrl: 'views/book/addbook.html',
      controller: 'features.controllers.BookController',
      size: 'md'
    });
    modal.result.then(function(result){
      alert("Book added successfully!");
      $scope.books.push(result);
    });
  };

  $scope.editBook = function(user){
    var modal = $uibModal.open({
      templateUrl: 'views/book/editbook.html',
      controller: 'features.controllers.EditBookController',
      size: 'md',
      resolve : {
        user : function(){
          return user;
        }
      }
    });
    modal.result.then(function(result){
      alert("Book details updated successfully!");
      $scope.books.forEach(function(book){
        if(book._id==result._id){
          book.name = result.name;
          book.author_name = result.author_name;
          book.isbn = result.isbn;
        }
      });
    });
  };

  $scope.loadUsers();
}])
.controller("features.controllers.IssueBookController",[
  '$scope',
  '$http',
  '$uibModal',
  '$uibModalInstance',
  'book',
  function($scope, $http, $uibModal, $uibModalInstance, book){
    $scope.book = book;

    $scope.users = [];
    $scope.apiUrl = "http://localhost:3000/api/";
    $scope.book.opt = "";

    $scope.issueBook =  function(){
      if(!$scope.opt){
        $scope.selectedError = true;
      };
      var params = {
        book_id : $scope.book._id,
        user_id : $scope.book.opt,
        issue_date : new Date(),
        due_date : new Date((new Date()).getTime() + (7 * 86400000)),
        type : "issue"
      };
      $http.post($scope.apiUrl+"transaction", params)
      .then(function(result){
        $uibModalInstance.close();
      })
      .catch(function(error){
        if(error.data.message){
          alert(error.data.message);
          return;
        }
        alert("Something went wrong try again later!");
      });
    };

    $scope.loadUsers = function(){
      $http.get($scope.apiUrl+'users')
      .then(function(result){
        $scope.users = result.data;
      })
      .catch(function(error){
        alert("Unable to load users this time. Something went wrong.");
      });
    };
    $scope.loadUsers();
}]);
