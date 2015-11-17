interactApp.directive('sideMenu', function ($state, $localstorage, Sessions) {
        return {
            restrict: 'E',
            scope: {
                items: '=items',
                name: '=name',
                image: '=image'
            },
            link: function (scope, element, attrs) {
                scope.change = function (item) {
                    $state.go(item);
                };
                scope.signout = function () {
                    Sessions.logout();
                    $state.go('signin');
                };
            },
            templateUrl: 'templates/sidemenu.html'
        };
    })
    .directive('boxes', function () {
        return {
            restrict: 'E',
            scope: {
                data: '=data',
            },
            templateUrl: 'templates/boxes.html'
        };
    })
    .directive('range', function ($log) {
        return {
            restrict: 'E',
            scope: {
                min: '=min',
                max: '=max',
                step: '=step',
                key: '=key'
            },
            link: function (scope, element, attrs) {
                scope.range = 0;
                scope.clearRange = function () {
                    scope.range = '';
                };
            },
            templateUrl: 'templates/range.html'
        };
    })
    .directive('time', function ($log, $filter, $cordovaDatePicker) {
        return {
            restrict: 'E',
            scope: {
                key: '=key'
            },
            link: function (scope, element, attrs) {
                scope.viewableDate = '';
                scope.set = function () {
                    var options = {
                        date: new Date(),
                        mode: 'time', // or 'time'
                        doneButtonLabel: 'DONE',
                        doneButtonColor: '#F2F3F4',
                        cancelButtonLabel: 'CANCEL',
                        cancelButtonColor: '#000000'
                    };
                    $cordovaDatePicker.show(options).then(function (time) {
                        scope.time = $filter('date')(time, 'h:mm a');
                    });
                };
                scope.time = '';
                scope.clearTime = function () {
                    scope.time = '';
                };
            },
            templateUrl: 'templates/time.html'
        };
    })
    .directive('date', function ($log, $filter, $cordovaDatePicker) {
        return {
            restrict: 'E',
            scope: {
                key: '=key'
            },
            link: function (scope, element, attrs) {
                scope.viewableDate = '';
                scope.set = function () {
                    var minDate = new Date();
                    minDate.setYear(minDate.getYear() - 1000);
                    var options = {
                        date: new Date(),
                        mode: 'date', // or 'time'
                        minDate: minDate,
                        allowOldDates: true,
                        allowFutureDates: true,
                        doneButtonLabel: 'DONE',
                        doneButtonColor: '#F2F3F4',
                        cancelButtonLabel: 'CANCEL',
                        cancelButtonColor: '#000000'
                    };
                    $cordovaDatePicker.show(options).then(function (date) {
                        scope.viewableDate = $filter('date')(date, 'MMM dd, yyyy');
                    });
                };
                scope.clear = function () {
                    scope.viewableDate = '';
                };
            },
            templateUrl: 'templates/date.html'
        };
    });