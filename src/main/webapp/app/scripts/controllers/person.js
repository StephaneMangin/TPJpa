(function () {

  'use strict';

  /**
   * @ngdoc function
   * @name sirApp.controller:PersonCtrl
   * @description
   * # PersonCtrl
   * Controller of the sirApp
   */
  angular
    .module('sirApp')
    .controller('PersonCtrl', function ($rootScope, $route, $scope, $routeParams, $http, $location, Person, ngDialog, $filter, ngTableParams, growl) {

      $scope.getPerson = function() {
        $scope.person = Person.get({personId: $routeParams.id}, function (response) {

          $scope.tablePersonHomes = new ngTableParams({
                page: 1,            // show first page
                count: 10          // count per page
            }, {
              counts: [], // hide page counts control
                total: 1,  // value less than count hide pagination
                getData: function ($defer, params) {
                    var orderedData = params.filter() ? $filter('filter')($scope.person.homes, params.filter()) : $scope.person.homes;
                    orderedData = params.sorting() ? $filter('orderBy')(orderedData, params.orderBy()) : orderedData;
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));

                    params.total(orderedData.length);
                    $defer.resolve($scope.person.homes);
                }
            });
         });
      };

      $scope.getPersons = function () {
          Person.query(function (response) {
            $scope.persons = response;
              $scope.tableParams = new ngTableParams({
                  page: 1,            // show first page
                  count: 10          // count per page
              }, {
                  total: $scope.persons.length, // length of data
                  getData: function ($defer, params) {
                      var orderedData = params.filter() ? $filter('filter')($scope.persons, params.filter()) : $scope.persons;
                      orderedData = params.sorting() ? $filter('orderBy')(orderedData, $scope.tableParams.orderBy()) : orderedData;
                      $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));

                      params.total(orderedData.length);
                      $defer.resolve($scope.persons);
                  }
              });
          });
      };

      $scope.delete = function (id) {
        Person.get({personId: id}, function (response) {
          response.$delete({personId: response.id}, function () {
            growl.success("Person deleted.");
                $location.path('/persons');
            });
        });
      };

      $scope.deletePersons = function() {
          angular.forEach($scope.checkboxes.items, function(value, key) {
              var checked = 0;
              angular.forEach($rootScope.persons, function(item) {
                  checked   +=  ($scope.checkboxes.items[item.id]) || 0;
              });
              $scope.current = 0;
              Person.get({personId: key}, function (response) {
                  $scope.current = $scope.current + 1;
                  console.log(response);
                  response.$delete({personId: key});
                  if($scope.current == checked) {
                      growl.success("Persons deleted.");
                      $route.reload();
                  }
              });
          });
      };

      $scope.addPerson = function () {
          ngDialog.open({
              template: 'app/views/personAdd.html',
              controller: 'PersonCreateCtrl',
              appendTo: '#dialog-person',
              scope: $scope
          });
      };

      $scope.addHome = function () {
          ngDialog.open({
              template: 'app/views/homeAdd.html',
              controller: 'HomeCreateCtrl',
              appendTo: '#dialog-person',
              scope: $scope
          });
      };

      $scope.addFriend = function () {
          ngDialog.open({
              template: 'app/views/friendAdd.html',
              controller: 'PersonCreateCtrl',
              appendTo: '#dialog-person',
              scope: $scope
          });
      };

      $scope.updatePerson = function () {
          ngDialog.open({
              template: 'app/views/personAdd.html',
              controller: 'PersonUpdateCtrl',
              appendTo: '#dialog-person',
              scope: $scope
          });
      };
  })
  .controller('PersonCreateCtrl', function ($rootScope, $scope, $routeParams, $http, $location, Person, ngDialog, growl) {
      $scope.titleNgDialog = "Add a person";

      $scope.dateOptions = {
          startingDay: 1
        };

      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
      };
      $scope.person = new Person();

      $scope.submit = function () {
          // Bugfix 1 day behing : https://github.com/angular-ui/bootstrap/issues/2072
          var d = new Date($scope.person.birthday);
          d.setMinutes( d.getMinutes() - d.getTimezoneOffset());
          $scope.person.birthday = d;

          $scope.person.$save(
              function (data) {
                  growl.success("Person has been created.");
                  $location.path('/persons');
              },
              function (error) {
                  console.log(error);
                  growl.error("An error occurs while creating the person !");
              }
          );
          $scope.closeThisDialog();
      };
  })
  .controller('PersonUpdateCtrl', function ($rootScope, $scope, $routeParams, $http, $location, Person, ngDialog, growl) {
      $scope.titleNgDialog = "Update a person";
      $scope.update = true;

      $scope.dateOptions = {
          startingDay: 1
        };

      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.opened = true;
      };
      $scope.submit = function () {
          // Bugfix 1 day behing : https://github.com/angular-ui/bootstrap/issues/2072
          var d = new Date($scope.person.birthday);
          d.setMinutes( d.getMinutes() - d.getTimezoneOffset());
          $scope.person.birthday = d;

          delete $scope.person.friends;
          delete $scope.person.homes;
          $scope.person.$update({},
              function (data) {
                  growl.success("Person has been updated.");
              },
              function (error) {
                  console.log(error);
                  growl.error("An error occurs while updating the person !");
              }
          );
          $scope.closeThisDialog();
      };
  });

})();