var interactApp = angular.module('enteractApp', ['ionic', 'ionic-datepicker', 'ionic-timepicker',
                                                'ngResource', 'ngCookies', 'ngCordova']);

var databaseHandler = null;
interactApp.config(function ($stateProvider, $httpProvider, $urlRouterProvider, $ionicConfigProvider) {
    $ionicConfigProvider.views.maxCache(0);
    $stateProvider
        .state('signin', {
            url: '/sign-in',
            templateUrl: 'templates/login.html',
            controller: 'SignInCtrl'
        })
        .state('forgotpassword', {
            url: '/forgot-password',
            templateUrl: 'templates/forgot.html'
        })
        .state('signup', {
            url: '/signup',
            templateUrl: 'templates/signup.html'
        })
        .state('cdashboard', {
            url: '/cdashboard',
            abstract: true,
            templateUrl: 'templates/main.html',
            controller: 'EnteractCtrl'
        })
        .state('cdashboard.dashboard', {
            url: '/dashboard',
            views: {
                'menuContent': {
                    templateUrl: 'templates/dashboard.html',
                    controller: 'DashboardCtrl'
                }
            }
        })
        .state('cdashboard.reviewersDetail', {
            url: '/reviewersDetail',
            views: {
                'menuContent': {
                    templateUrl: 'templates/profile.html',
                    controller: 'ProfileCtrl'
                }
            }
        })
        .state('cdashboard.questionnaire', {
            url: '/questionnaire',
            views: {
                'menuContent': {
                    templateUrl: 'templates/questionnaire.html',
                    controller: 'QuestionnaireCtrl'
                }
            }
        })
        .state('cdashboard.settings', {
            url: '/settings',
            views: {
                'menuContent': {
                    templateUrl: 'templates/settings.html',
                    controller: 'SettingsCtrl'
                }
            }
        })
        .state('cdashboard.take', {
            url: '/questionnaire/:runId',
            views: {
                'menuContent': {
                    templateUrl: 'templates/take.html',
                    controller: 'TakeQuestionnaireCtrl'
                }
            }
        });


    $urlRouterProvider.otherwise('/sign-in');

    //$httpProvider.interceptors.push('httpRequestInterceptor');
    /// $httpProvider.defaults.headers.xsrfCookieName = 'csrftoken';
    // $httpProvider.defaults.headers.xsrfHeaderName = 'X-CSRFToken';
    //$httpProvider.defaults.xsrfCookieName = 'csrftoken';
    // $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';

    // $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    //$httpProvider.defaults.withCredentials = true;

});



interactApp.constant('API', 'https://www.enteract.io/api/v1/');

interactApp.constant('Token', 'https://www.enteract.io/o/token/');

interactApp.run(function ($ionicPlatform, $localstorage, $http, $state, $cookies, $cordovaSQLite, Sessions, $localstorage) {
    Sessions.getToken().then(function (result) {
        console.log(result);
        $http.defaults.headers.post['X-CSRFToken'] = result.value;
        $localstorage.set("token", result.value);


    });


    $ionicPlatform.ready(function () {

        if (window.Connection) {

            if (navigator.connection.type == Connection.NONE) {
                $ionicPopup.confirm({
                        title: "Internet Disconnected",
                        content: "The internet is disconnected on your device."
                    })
                    .then(function (result) {
                        /*  if (!result) {
                              ionic.Platform.exitApp();
                          }*/
                    });
            } else {
                $ionicPopup.confirm({
                    title: "Internet Connected",
                    content: "The internet is connected on your device."
                });
            }
        }

        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }



        /* if (databaseHandler === null || angular.isUndefined(databaseHandler)) {

             if (window.cordova && window.SQLitePlugin) {
                 databaseHandler = $cordovaSQLite.openDB('enteract.db', 1);
             } else {
               //  databaseHandler = window.openDatabase('enteract', '1.0', 'enteract.db', 100 * 1024 * 1024);
             }

             $cordovaSQLite.execute(databaseHandler, 'CREATE TABLE IF NOT EXISTS questionnaire (unique_id text primary key, runid text, object text, sticky text, started integer, toShow integer)');
             $cordovaSQLite.execute(databaseHandler, 'CREATE TABLE IF NOT EXISTS questionsets (questionset_id integer primary key, questionset text, questionnaire_id text, sortid integer)');
             $cordovaSQLite.execute(databaseHandler, 'CREATE TABLE IF NOT EXISTS answers (answer_id integer primary key, answer text, questionnaire_id text, questionset_id integer, section_id integer)');
         }*/
    });


    /* $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
     $http.defaults.headers.xsrfHeaderName = 'X-CSRFToken';
     $http.defaults.headers.xsrfCookieName = 'csrftoken';
     $http.defaults.xsrfHeaderName = 'X-CSRFToken';
     $http.defaults.xsrfCookieName = 'csrftoken';*/
});