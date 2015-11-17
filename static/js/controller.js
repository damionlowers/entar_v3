interactApp.controller('SignInCtrl', function ($scope, $q, $ionicLoading, $localstorage, UserRequest, Sessions, $state) {

    $document[0].addEventListener('online', function () {

        questionnaireObjs = $localstorage.getObject("toUploadQuestion");

        questionnaireObjs.forEach(function (question) {
            QuestionaireRequest.submitJumbo(question.runId, {
                data: question.toSubmit
            }).then(function (data) {
                $ionicPopup.alert({
                    title: 'Answer\'s Submitted',
                    template: 'All previosuly stored answers have now been submitted thank you.'
                });
                console.log(data);
            }, function (data) {
                console.log(data);
            });
           
            $window.localStorage.removeItem('toUploadQuestion');
        });


        console.log("to submit",questionnaireObjs);


    }, false);


    $scope.noUsername = false;
    $scope.noPassword = false;
    $scope.valid = false;
    $scope.notValidUser = false;

    $scope.login = {
        username: '',
        password: ''
    };


    console.log($scope.login);
    $scope.$watch('login.username', function () {
        if ($scope.login.username === '') {
            $scope.valid = false;
            $scope.noUsername = true;
        } else {
            $scope.noUsername = false;
            if ($scope.login.password !== '' && !angular.isUndefined($scope.login.username) && !angular.isUndefined($scope.login.password)) {
                $scope.valid = true;
            }
        }
    });


    $scope.$watch('login.password', function () {
        if ($scope.login.password === '') {
            $scope.valid = false;
            $scope.noPassword = true;
        } else {
            $scope.noPassword = false;
            if ($scope.login.username !== '' && !angular.isUndefined($scope.login.username) && !angular.isUndefined($scope.login.password)) {
                $scope.valid = true;
            }
        }
    });



    $scope.doLogin = function (user) {

        $ionicLoading.show({
            content: 'Logging in',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 200,
            showDelay: 0
        });

        //hard coded please remove 

       /* user = {
            username: "deano24",
            password: "cookie24"
                //username: "stanu_yiannamaria",
                // password: "Test123"
        };*/


        UserRequest.loginUser(user).then(function (data) {

            $localstorage.set('isLoggedIn', true);

            var userobj = data.data;
            userobj.password = user.password;

            $localstorage.setObject("user", userobj);

            UserRequest.getUserProfile().then(function (data) {
                $localstorage.setObject("user_profile", data.results);
            });

            Sessions.getAccessToken({
                "client_id": escape(userobj.client_id),
                "grant_type": "password",
                "username": userobj.username,
                "password": userobj.password
            }).then(function (data) {
                $localstorage.setObject("AccessToken", data.data);
            });

            setTimeout(function () {
                $state.go('cdashboard.dashboard');
            }, 100);


            $ionicLoading.hide();

        }, function (data) {


            $ionicLoading.hide();
            if (data.status === 0) {
                $scope.noInternet = true;
            } else {
                $scope.notValidUser = true;
            }
            $ionicLoading.hide();
        });

    };


    if ($localstorage.get('isLoggedIn') === 'true') {

        $state.go('cdashboard.dashboard');
    }
    $scope.clear = function () {
        //$localstorage.set('isLoggedIn', false);
        //$state.go('signin');
    };

    $scope.signOut = function () {
        $state.go('signup');
    };

});


interactApp.controller('DashboardCtrl', function ($scope, Clients, Sessions, $rootScope, $localstorage, Questionnaires, $ionicLoading, $ionicPopup, $state, QuestionaireRequest, $http, $ionicScrollDelegate, filterFilter) {


    /* if ($localstorage.get('isLoggedIn') === 'true') {

        userobj = $localstorage.getObject("user");
        Sessions.getAccessToken({
            "client_id": escape(userobj.client_id),
            "grant_type": "password",
            "username": userobj.username,
            "password": userobj.password
        }).then(function (data) {
            console.log("at1", data.data);
            $localstorage.setObject("AccessToken", data.data);
        });

    }
*/
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 0
    });
    $rootScope.$emit('changeTitle', 'Dashboard');
    $rootScope.$emit('changeMenu', {
        val: false,
        url: ''
    });

    $scope.client = $localstorage.getObject("user_profile");

    $scope.name = $scope.client.user.first_name + ' ' + $scope.client.user.last_name;
    $scope.username = $scope.client.user.username;


    userobj = $localstorage.getObject("user");
    Sessions.getAccessToken({
        "client_id": escape(userobj.client_id),
        "grant_type": "password",
        "username": userobj.username,
        "password": userobj.password
    }).then(function (data) {
        console.log("at1", data.data);
        $localstorage.setObject("AccessToken", data.data);

        Clients.boxes().then(function (info) {
            $ionicLoading.hide();
            $scope.boxes = info;
        }, function () {
            $scope.boxes = {
                "in_progress": "?",
                "completed": "?",
                "not_started": "?"
            };

            $scope.boxes = Sessions.getBoxes();
            $ionicLoading.hide();
        });
    }, function () {
        $scope.boxes = {
            "in_progress": "?",
            "completed": "?",
            "not_started": "?"
        };

        $scope.boxes = Sessions.getBoxes();
        $ionicLoading.hide();

    });




    var doSearch = ionic.debounce(function (query) {


        Questionnaires.submit($stateParams.runId, {
            data: toSubmit
        }).then(function (tmp) {

        });


    }, 500);

    console.log('DashboardCtrl');

});


interactApp.controller('ProfileCtrl', function ($scope, $log, $localstorage, UserRequest, $ionicLoading, $rootScope, $cordovaDatePicker, $filter, $ionicPopup) {

    console.log("profile");
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 0
    });
    $rootScope.$emit('changeTitle', 'Profile');
    $rootScope.$emit('changeMenu', {
        val: true,
        url: 'templates/profileMoreMenu.html'
    });
    $rootScope.$on('imageChanged', function (event, data) {
        $scope.image = data;
    });
    var client = {};
    $scope.init = function () {
        $scope.client = $localstorage.getObject("user_profile");
        $scope.client.dob = $filter('date')($scope.client.dob, 'MMM dd, yyyy');
        $scope.image = 'https://www.enteract.io' + $scope.client.photo.thumbnail_sm;
    };
    $scope.init();
    $ionicLoading.hide();
    $scope.set = function () {
        var minDate = new Date();
        minDate.setYear(minDate.getYear() - 1000);
        var options = {
            date: new Date(),
            mode: 'date',
            minDate: minDate,
            allowOldDates: true,
            allowFutureDates: true,
            doneButtonLabel: 'DONE',
            doneButtonColor: '#F2F3F4',
            cancelButtonLabel: 'CANCEL',
            cancelButtonColor: '#000000'
        };
        $cordovaDatePicker.show(options).then(function (date) {
            $scope.client.dob = $filter('date')(date, 'MMM dd, yyyy');
        });
    };
    $scope.clear = function () {
        $scope.client.dob = '';
    };
    $scope.save = function () {
        if ($scope.client.user.first_name === '') {
            $ionicPopup.alert({
                title: 'Profile update',
                content: 'First Name is required.'
            });
        } else if ($scope.client.user.last_name === '') {
            $ionicPopup.alert({
                title: 'Profile update',
                content: 'Last Name is required.'
            });
        } else {
            $ionicLoading.show({
                content: 'Loading',
                animation: 'fade-in',
                showBackdrop: false,
                maxWidth: 200,
                showDelay: 0
            });
            $scope.client.dob = Date.parse($scope.client.dob);
            console.log($scope.client);
            UserRequest.updateUser($scope.client).then(function (innerClient) {
                $ionicLoading.hide();
                $rootScope.$emit('changeClientName', $scope.client.user.first_name + ' ' + $scope.client.user.last_name);
                $ionicPopup.alert({
                    title: 'Profile Updated',
                    content: 'Profile has been successfully updated.'
                });
            }, function () {
                $ionicLoading.hide();
                $ionicPopup.alert({
                    title: 'Profile Updated',
                    content: 'Profile failed to be updated.'
                });
            });
        }

    };
});

interactApp.controller('EnteractCtrl', function ($scope, $rootScope, Sessions, $ionicPopover, $ionicLoading, $localstorage, Clients, $state, $document, QuestionaireRequest, $http, $ionicScrollDelegate, filterFilter) {

    $document[0].addEventListener('online', function () {
        console.log('Device is now online');
    });


    $scope.init = function () {
        var client = $localstorage.getObject("user");
        $scope.custClass = 'bar-calm';
        $scope.moreMenu = false;
        $scope.moreMenuFunction = function ($event) {
            $scope.popover.show($event);
        };
        $scope.changePassword = function () {
            $scope.popover.hide();
            var regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
            $scope.data = {};
            var myPopup = $ionicPopup.show({
                template: '<input type="password" ng-model="data.password" placeholder="Current Password"><input type="password" ng-model="data.newPassword" placeholder="New Password"><input type="password" ng-model="data.newPasswordConfirm" placeholder="Confirm New Password">',
                title: 'Change Password',
                subTitle: 'All fields are mandatory',
                scope: $scope,
                buttons: [
                    {
                        type: 'button-assertive icon ion-close-circled',
                        onTap: function (e) {
                            return 'cancel';
                        }
          },
                    {
                        type: 'button-positive icon ion-checkmark-circled',
                        onTap: function (e) {
                            if (angular.isUndefined($scope.data.password) || $scope.data.password !== client.password) {
                                return 'Password does not match current password.';
                            } else if (angular.isUndefined($scope.data.newPassword) || $scope.data.newPassword === '') {
                                return 'New password is required.';
                            } else if (!regex.test($scope.data.newPassword)) {
                                return 'Password must contain atleast 1 upper case character, lower case character and one number.';
                            } else if (angular.isUndefined($scope.data.newPasswordConfirm) || $scope.data.newPasswordConfirm === '' || $scope.data.newPasswordConfirm !== $scope.data.newPassword) {
                                return 'Confirmed password does not match new password.';
                            } else {
                                return $scope.data;
                            }
                        }
          }
        ]
            });
            myPopup.then(function (res) {
                if (typeof res === 'object') {
                    $scope.client.changePassword(res.newPassword, res.newPasswordConfirm).then(function () {
                        client.password = res.newPassword;
                        $ionicPopup.alert({
                            title: 'Password Change',
                            template: 'Password has been successfully changed.'
                        });
                    }, function (data) {
                        $ionicPopup.alert({
                            title: 'Password Change',
                            template: 'Password was not successfully changed because: ' + data
                        });
                    });
                } else if (res === 'cancel') {} else {
                    $ionicPopup.alert({
                        title: 'Invalid Form',
                        template: res
                    });
                }
            });
        };
        $scope.uploadImage = function () {
            $scope.popover.hide();
            Camera.choosePicture().then(function (imageData) {
                $rootScope.$broadcast('imageChanged', imageData);
            });
        };
        $scope.takePicture = function () {
            $scope.popover.hide();
            Camera.takePicture().then(function (imageData) {
                $rootScope.$broadcast('imageChanged', imageData);
            });
        };
        $rootScope.$on('changeTitle', function (event, data) {
            $scope.title = data;
        });
        $rootScope.$on('changeHeaderColor', function (event, data) {
            var em = angular.element(document.querySelectorAll('ion-header-bar'));
            em.removeClass($scope.custClass);
            em.addClass(data);
            $scope.custClass = data;
            // Sessions.setCustClass(data);
        });
        $rootScope.$on('changeMenu', function (event, data) {
            $scope.moreMenu = data.val;
            if (data.url !== '') {
                $ionicPopover.fromTemplateUrl(data.url, {
                    scope: $scope
                }).then(function (popover) {
                    $scope.popover = popover;
                });
            }
        });
        $rootScope.$on('changeClientName', function (event, data) {
            $scope.name = data;
        });


        var client = $localstorage.getObject("user_profile");
        console.log(client);
        $scope.name = client.user.first_name + ' ' + client.user.last_name;
        //  Sessions.setName($scope.name);
        $scope.image = client.photo.thumbnail_sm;
        Clients.sideMenu().then(function (menu) {
            $scope.menu_items = menu.results.menu_item;
            Sessions.setMenu(menu.results.menu_item);
        }, function () {
            $scope.menu_items = Sessions.getMenu();
        });
        $scope.client = client;

    };
    $scope.init();

});


interactApp.controller('SettingsCtrl', function ($scope, $log, Settings, Clients, $localstorage, $ionicLoading, $rootScope, Sessions, Clients) {
    $rootScope.$emit('changeTitle', 'Settings');
    $rootScope.$emit('changeMenu', {
        val: false,
        url: ''
    });
    var map = {
        'blue': 'bar-positive',
        'green': 'bar-balanced',
        'yellow': 'bar-energized',
        'red': 'bar-assertive',
        'purple': 'bar-royal',
        'black': 'bar-dark'
    };
    var backmap = {
        'bar-positive': 'blue',
        'bar-balanced': 'green',
        'bar-energized': 'yellow',
        'bar-assertive': 'red',
        'bar-royal': 'purple',
        'bar-dark': 'black'
    };
    var realClient = {};
    var results = {};

    var client = $localstorage.getObject("user");
    realClient = client;
    console.log(client);
    Clients.settings().then(function (data) {
        var color = data.results.theme;
        results = data.results;
        color = color.split('-');
        color = color[1];
        $rootScope.$emit('changeHeaderColor', $scope.color);
        $scope.color = map[color];
        $scope.itm = 'item-' + map[color].split('-')[1];
        console.log($scope.itm);
    });

    $scope.color = Sessions.getCustClass();
    $scope.changeColor = function () {
        results.theme = 'skin-' + backmap[$scope.color];
        $scope.itm = 'item-' + map[backmap[$scope.color]].split('-')[1];
        console.log($scope.itm);
        Settings.theme(results);
        $rootScope.$emit('changeHeaderColor', $scope.color);
    };
});


interactApp.controller('QuestionnaireCtrl', function ($scope, $window, Questionnaires, $localstorage, Sessions, $state, $ionicPopup, $ionicLoading, $rootScope) {
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 0
    });
    $rootScope.$emit('changeTitle', 'Questionnaire');
    $rootScope.$emit('changeMenu', {
        val: false,
        url: ''
    });

    var client = $localstorage.getObject("user");
    //var client = Sessions.retrieveClient();
    $scope.started = false;

    function completeUpdate(list, questionnaires) {

        $localstorage.setObject("questionnaires", list);
        $localstorage.setObject("questionset", questionnaires);

        var i, j, k, qstset, sticky;
        for (i = 0; i < list.length; i++) {
            for (j = 0; j < questionnaires.length; j++) {
                if (list[i].unique_id === questionnaires[j].unique_id) {
                    qstset = questionnaires[j].questionset;
                    sticky = questionnaires[j].sticky;
                    for (k = 0; k < qstset.length; k++) {

                        /* $window.localStorage.question_local = {
                             "questionsets": {
                                 "questionset_id": qstset.id,
                                 "questionset": qstset[k],
                                 "questionnaire_id": questionnaires[j].unique_id
                             }
                         };*/


                        //Database.insertQuestionSet(qstset.id, qstset[k], questionnaires[j].unique_id);
                    }
                    break;
                }
            }
            /*$window.localStorage.question_local = {
                "questionnaire.sortid ": {
                    "unique_id": list[i].unique_id,
                    "runid": list[i].runid,
                    "object": list[i],
                    "sticky": sticky,
                    "started": list[i].section_id - 1,
                    "toShow": 1
                }
            };*/
            // Database.insertQuestionnaire(list[i].unique_id, list[i].runid, list[i], sticky, list[i].section_id - 1, 1);
        }


    }


    Questionnaires.getData(client).then(function (data) {


        if (data.status === 154 || data.status === 0) {
            data = $localstorage.getObject("ques_data");
            if (data.in_progress.length === 0 && data.not_started.length === 0) {
                $ionicPopup.alert({
                    title: 'No Questionniares Found',
                    content: 'Their exist no internet connection so the questionnaire list could not be downloaded and no questionnaire was foud on the device.'
                });
            } else {
                $scope.notStarted = data.not_started;
                $scope.inProgress = data.in_progress;
            }

        } else {
            /* Database.emptyQuestionniare();
             Database.emptyQuestionset();*/
            console.log("ques", data);

            completeUpdate(data.in_progress, data.questionnaires);
            completeUpdate(data.not_started, data.questionnaires);

            $localstorage.setObject("ques_data", data);

            /*for(i = 0; i < data.data.not_started.length; i++){
              downloadFile('https://enteract.io' + data.data.not_started[i].item_reviewed_photo.thumbnail_sm);
            }*/

            $scope.inProgress = data.in_progress;
            $scope.notStarted = data.not_started;


        }
    }, function (data) {
        $scope.inProgress = [];
        var data = $localstorage.getObject("ques_data");

        if (data.length === 0) {
            $ionicPopup.alert({
                title: 'No Questionniares Found',
                content: 'Their exist no internet connection so the questionnaire list could not be downloaded and no questionnaire was foud on the device.'
            });
        } else {
            $scope.notStarted = data.questionnaires;
        }

        var data = $localstorage.getObject("ques_data");
        if (data.in_progress.length === 0 && data.not_started.length === 0) {
            $ionicPopup.alert({
                title: 'No Questionniares Found',
                content: 'Their exist no internet connection so the questionnaire list could not be downloaded and no questionnaire was foud on the device.'
            });
        } else {
            $scope.notStarted = data.not_started;
            $scope.inProgress = data.in_progress;
        }
    }, function (data) {
        $ionicPopup.alert({
            title: 'No Internet Connection',
            content: 'Please connect to the internet before trying to download the questionnaire list.'
        });

        $ionicLoading.hide();
    });

    $ionicLoading.hide();
    $scope.contQuestionnaire = function (questionnaire) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Questionnaire Confirmation',
            template: 'Are you sure you want to continue with the questionnaire entitled ' + questionnaire.name + '?'
        });
        confirmPopup.then(function (res) {
            if (res) {
                // Database.questionset = questionnaire;
                $state.go('cdashboard.take', {
                    runId: questionnaire.runid
                });
            }
        });
    };
    $scope.doQuestionnaire = function (questionnaire) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Questionnaire Confirmation',
            template: 'Are you sure you want to start the questionnaire entitled ' + questionnaire.name + '?'
        });
        confirmPopup.then(function (res) {
            if (res) {
                //Database.questionset = questionnaire;
                $state.go('cdashboard.take', {
                    runId: questionnaire.runid,
                    question_set: questionnaire
                });
            }
        });
    };

    function downloadFile(url) {
        var filename = url.split("/").pop();

        var targetPath = cordova.file.externalRootDirectory + 'enteract/' + filename;
        $cordovaFileTransfer.download(url, targetPath, {}, true).then(function (result) {
            alert(JSON.stringify(result));
        }, function (error) {
            alert(JSON.stringify(error));
        });
    }
    console.log("question");
});


interactApp.controller('TakeQuestionnaireCtrl', function ($scope, $localstorage, QuestionStored, QuestionaireRequest, $stateParams, $log, Questionnaires, $ionicPopup, $filter, $state, $ionicLoading, $rootScope, $ionicScrollDelegate) {
    var questionnaireObj;
    var questionsetId = -1;
    $rootScope.$emit('changeMenu', {
        val: false,
        url: ''
    });
    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: false,
        maxWidth: 200,
        showDelay: 0
    });

    console.log($localstorage.getObject("questionnaires"));
    console.log($localstorage.getObject("questionset"));
    console.log($stateParams.runId);
    Questionnaires.getQuestionnaire($stateParams.runId).then(function (data) {
        questionnaireObj = data.questionset;

        //Database.questionset = {};
        if (data.status === 154 || data.status === 0) {

            questions = QuestionStored.getQuestionsetBySectionId($stateParams.runId);

            $scope.notStarted = questions.notStarted;
            result = questions.results;
            questionnaireObj = questions.questionnaireObj;

            questionsetId = result.id;
            $rootScope.$emit('changeTitle', questionnaireObj.name);
            $scope.questions = result.questions;
            if ('item_to_review_name' in questionnaireObj) {
                $scope.name = questionnaireObj.reviewed.name;
                $scope.image = 'https://www.enteract.io' + questionnaireObj.reviewed.photo.thumbnail_sm;
            } else if ('item_reviewed' in questionnaireObj) {
                $scope.name = questionnaireObj.reviewed.name;
                $scope.image = 'https://www.enteract.io' + questionnaireObj.reviewed.photo.thumbnail_sm;
            }

        } else {

            $rootScope.$emit('changeTitle', data.runinfo.questionnaire);
            $scope.questions = data.questionset.questions;
            $scope.name = (data.runinfo.reviewed == null ? data.runinfo.reviewer_name : data.runinfo.reviewed.name);
            $scope.image = 'https://www.enteract.io/' + (data.runinfo.reviewed == null ? data.custom_branding.logo.photo.thumbnail_sm : data.runinfo.reviewed.photo.thumbnail_sm);
        }
        $ionicLoading.hide();
    }, function (data) {
        //check if the error code is that stated for no internet
        questions = QuestionStored.getQuestionsetBySectionId($stateParams.runId);

        $scope.notStarted = questions.notStarted;
        result = questions.results;
        questionnaireObj = questions.questionnaireObj;

        questionsetId = result.id;
        $rootScope.$emit('changeTitle', questionnaireObj.name);
        $scope.questions = result.questions;
        if ('item_to_review_name' in questionnaireObj) {
            $scope.name = questionnaireObj.reviewed.name;
            $scope.image = 'https://www.enteract.io' + questionnaireObj.reviewed.photo.thumbnail_sm;
        } else if ('item_reviewed' in questionnaireObj) {
            $scope.name = questionnaireObj.reviewed.name;
            $scope.image = 'https://www.enteract.io' + questionnaireObj.reviewed.photo.thumbnail_sm;
        }

        $ionicLoading.hide();
    });

    function submit() {
        var elem = document.getElementById('questionForm').childNodes;
        var toSubmit = [];
        for (var i = 0; i < elem.length; i++) {
            if (elem[i].className === 'card') {
                var object = {};
                var obj = JSON.parse(elem[i].getAttribute('data-type'));
                object.question_id = obj.id;
                switch (obj.type.code_name) {
                    case 'choice':
                        for (var x = 0; x < elem[i].getElementsByClassName('data_choice').length; x++) {
                            if (elem[i].getElementsByClassName('data_choice')[x].checked) {
                                object.choice = JSON.parse(elem[i].getElementsByClassName('data_choice')[x].getAttribute('data-choice'));
                                break;
                            }
                        }
                        break;
                    case 'rank':
                        for (var x = 0; x < elem[i].getElementsByClassName('data_rank').length; x++) {
                            if (elem[i].getElementsByClassName('data_rank')[x].checked) {
                                object.score = JSON.parse(elem[i].getElementsByClassName('data_rank')[x].getAttribute('data-choice'));
                                break;
                            }
                        }
                        break;
                    case 'open':
                        if (elem[i].getElementsByClassName('data_open')[0].value !== '') {
                            object.text = elem[i].getElementsByClassName('data_open')[0].value;
                        }
                        break;
                    case 'number':
                        if (elem[i].getElementsByClassName('data_number')[0].value !== '') {
                            object.number = parseInt(elem[i].getElementsByClassName('data_number')[0].value);
                        }
                        break;
                    case 'time':
                        if (elem[i].getElementsByClassName('data_time')[0].value !== '') {
                            var meridian = elem[i].getElementsByClassName('data_time')[0].value.substr(elem[i].getElementsByClassName('data_time')[0].value.length - 2);
                            var hour = '';
                            var parts = elem[i].getElementsByClassName('data_time')[0].value.split(":");
                            var min = parts[1][0] + '' + parts[1][1];
                            if (meridian === 'AM' || meridian === 'am') {
                                hour = parseInt(parts[0], 10);
                                hour = hour < 10 ? '0' + hour : hour;
                                hour = hour === 12 ? '00' : hour;
                            } else {
                                hour = parseInt(parts[0], 10);
                                hour += 12;
                            }
                            object.time = '1970-01-01T' + hour + ':' + min + ':00.000Z';
                        }
                        break;
                    case 'open_textfield':
                        if (elem[i].getElementsByClassName('data_open_textfield')[0].value !== '') {
                            object.text = elem[i].getElementsByClassName('data_open_textfield')[0].value;
                        }
                        break;
                    case 'dropdown':
                        if (elem[i].getElementsByClassName('data_dropdown')[0].value !== '') {
                            object.choice = JSON.parse(elem[i].getElementsByClassName('data_dropdown')[0].value);
                        }
                        break;
                    case 'choice_multiple':
                        var choicesArray = [];
                        for (var x = 0; x < elem[i].getElementsByClassName('data_choice_multiple').length; x++) {
                            if (elem[i].getElementsByClassName('data_choice_multiple')[x].checked) {
                                choicesArray.push(JSON.parse(elem[i].getElementsByClassName('data_choice_multiple')[x].getAttribute('data-choice')));
                            }
                        }
                        if (choicesArray.length > 0) {
                            object.choices = choicesArray;
                        }
                        break;
                    case 'date':
                        if (elem[i].getElementsByClassName('data_date')[0].value !== '') {
                            var date = new Date(elem[i].getElementsByClassName('data_date')[0].value);
                            object.date = $filter('date')(date, 'yyyy-MM-dd') + 'T00:00:00.000Z';
                        }
                        break;
                    case 'range':
                        if (elem[i].getElementsByClassName('data_range')[0].value !== '') {
                            object.number = parseInt(elem[i].getElementsByClassName('data_range')[0].value);
                        }
                        break;
                }
                if (obj.comment) {
                    if (elem[i].getElementsByClassName('comment_input')[0].value !== '') {
                        object.comment = elem[i].getElementsByClassName('comment_input')[0].value;
                    }
                }
                toSubmit.push(object);
            }
        }

        QuestionaireRequest.submitQuestionnare($stateParams.runId, {
            data: toSubmit
        }).then(function (tmp) {
            var data = tmp;

            questionnaireObj.section_id++;
            console.log("questionnaireObj", questionnaireObj);

            finQuess = $localstorage.getObject("toUploadQuestion");

            console.log("finQuess1", finQuess);
            var finQues = {
                "toSubmit": toSubmit,
                "unique_id": questionnaireObj.unique_id,
                "questionsetId": questionsetId,
                "section_id": questionnaireObj.section_id - 1,
                "runId": $stateParams.runId
            };

            try {
                finQuess.push(finQues);
                $localstorage.setObject("toUploadQuestion", finQuess);
            } catch (e) {
                var tempfinQuess = [];
                tempfinQuess.push(finQuess);
                $localstorage.setObject("toUploadQuestion", tempfinQuess);
            }

            console.log("finQuess2", finQuess);

            if (data.status === 154 || data.status === 0) {
                QuestionStored.updateQuestionsetByUniqueId(questionnaireObj.unique_id, questionnaireObj);
                $ionicLoading.hide();

                var finQues = {
                    "toSubmit": toSubmit,
                    "unique_id": questionnaireObj.unique_id,
                    "questionsetId": questionsetId,
                    "section_id": questionnaireObj.section_id - 1,
                    "runId": $stateParams.runId
                };

                $localstorage.setObject("toUploadQuestion", finQues);

                console.log(questionnaireObj.section_id);
                console.log(questionnaireObj.num_of_questionsets);
                if (questionnaireObj.num_of_questionsets < questionnaireObj.section_id) {
                    $ionicPopup.alert({
                        title: 'Answers Stored',
                        template: 'Thank you for completing the questionnaire, your answers have been stored and will be submitted once internet is detected on the device.'
                    }).then(function () {
                        $state.go('cdashboard.questionnaire');
                        /*Database.hideQuestionnaire(questionnaireObj.unique_id, 0).then(function () {
                            $state.go('cdashboard.questionnaire');
                        }, function () {
                            $state.go('cdashboard.questionnaire');
                        });*/
                    });
                } else {

                    var questions = QuestionStored.getQuestionsetBySectionId(questionnaireObj.section_id);

                    if (questions != null) {
                        var result = questions.results;
                        questionnaireObj = questions.questionnaireObj;
                        questionsetId = result.id;
                        $scope.questions = result.questions;
                        $ionicScrollDelegate.scrollTop();
                    }


                }
            } else {
                if ('messages' in data) {
                    if (data.messages[0].text === 'Questionnaire Completed') {
                        $ionicLoading.hide();
                        var popup = $ionicPopup.alert({
                            title: 'Questionnaire Completed',
                            template: 'Thank you for taking the time to complete the questionnaire you will now be redirected to the questionnaire page.'
                        });
                        popup.then(function () {
                            $state.go('cdashboard.questionnaire');
                        });
                    }
                } else {

                    $scope.questions = [];
                    Questionnaires.getNextPage(data.runcode).then(function (data) {
                        data.questionset.questions.forEach(function (question) {
                            var res = QuestionStored.getQuestionsetById(question.id);
                            if (Object.keys(res).length === 0) {
                                QuestionStored.insertQuestion(question);
                            } else {
                                QuestionStored.updateQuestionsetById(question.id, question, obj.id);
                            }
                        });

                        $scope.questions = data.questionset.questions;
                        $ionicScrollDelegate.scrollTop();
                    }, function () {
                        $ionicLoading.hide();
                    });


                    $ionicLoading.hide();
                }
            }

        }, function () {

            var finQues = {
                "toSubmit": toSubmit,
                "unique_id": questionnaireObj.unique_id,
                "questionsetId": questionsetId,
                "section_id": questionnaireObj.section_id - 1,
                "runId": $stateParams.runId
            };


            $localstorage.setObject("toUploadQuestion", finQues);
            if (questionnaireObj.num_of_questionsets < questionnaireObj.section_id) {
                $ionicPopup.alert({
                    title: 'Answers Stored',
                    template: 'Thank you for completing the questionnaire, your answers have been stored and will be submitted once internet is detected on the device.'
                }).then(function () {
                    $state.go('cdashboard.questionnaire');
                    /* Database.hideQuestionnaire(questionnaireObj.unique_id, 0).then(function () {
                         $state.go('cdashboard.questionnaire');
                     }, function () {
                         $state.go('cdashboard.questionnaire');
                     });*/
                });

                $ionicLoading.hide();
            } else {

                console.log("questionnaireObj22", questionnaireObj);
                try {
                    var questions = QuestionStored.getQuestionsetBySectionId(questionnaireObj.section_id);
                    var result = questions.results;
                    questionnaireObj = questions.questionnaireObj;
                    questionsetId = result.id;
                    $scope.questions = result.questions;
                    $ionicScrollDelegate.scrollTop();
                } catch (e) {}

            }
        });
    }

    $scope.validate = function () {
        $ionicLoading.show({
            content: 'Submitting...',
            animation: 'fade-in',
            showBackdrop: false,
            maxWidth: 200,
            showDelay: 0
        });
        var elem = document.getElementById('questionForm').childNodes;
        var error = false;
        var message = '';
        var checked;
        var x;
        for (var i = 0; i < elem.length; i++) {
            if (elem[i].className === 'card') {
                if (error) {
                    break;
                }
                var obj = JSON.parse(elem[i].getAttribute('data-type'));
                if (obj.required) {
                    message = 'The question entitled ' + obj.text + ' was not answered.';
                    switch (obj.type.code_name) {
                        case 'choice':
                            checked = false;
                            for (x = 0; x < elem[i].getElementsByClassName('data_choice').length; x++) {
                                if (elem[i].getElementsByClassName('data_choice')[x].checked) {
                                    checked = true;
                                    break;
                                }
                            }
                            if (!checked) {
                                message += ' One item must be selected.';
                                error = true;
                            }
                            break;
                        case 'rank':
                            checked = false;
                            for (x = 0; x < elem[i].getElementsByClassName('data_rank').length; x++) {
                                if (elem[i].getElementsByClassName('data_rank')[x].checked) {
                                    checked = true;
                                    break;
                                }
                            }
                            if (!checked) {
                                message += ' One item must be selected.';
                                error = true;
                            }
                            break;
                        case 'open':
                            if (elem[i].getElementsByClassName('data_open')[0].value === '') {
                                error = true;
                            }
                            break;
                        case 'number':
                            if (elem[i].getElementsByClassName('data_number')[0].value === '') {
                                error = true;
                            }
                            break;
                        case 'time':
                            if (elem[i].getElementsByClassName('data_time')[0].value === '') {
                                error = true;
                            }
                            break;
                        case 'open_textfield':
                            if (elem[i].getElementsByClassName('data_open_textfield')[0].value === '') {
                                error = true;
                            }
                            break;
                        case 'dropdown':
                            if (elem[i].getElementsByClassName('data_dropdown')[0].value === '') {
                                error = true;
                            }
                            break;
                        case 'choice_multiple':
                            checked = false;
                            for (x = 0; x < elem[i].getElementsByClassName('data_choice_multiple').length; x++) {
                                if (elem[i].getElementsByClassName('data_choice_multiple')[x].checked) {
                                    checked = true;
                                    break;
                                }
                            }
                            if (!checked) {
                                message += ' Atleast one item must be checked.';
                                error = true;
                            }
                            break;
                        case 'date':
                            if (elem[i].getElementsByClassName('data_date')[0].value === '') {
                                error = true;
                            }
                            break;
                        case 'range':
                            if (elem[i].getElementsByClassName('data_range')[0].value === '') {
                                error = true;
                            }
                            break;
                    }
                }

            }
        }
        if (!error) {
            submit();
        } else {
            $ionicLoading.hide();
            $ionicPopup.alert({
                title: 'Invalid Form',
                template: message
            });
        }
    };
});
