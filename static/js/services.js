interactApp.factory('Request', function ($resource, $localstorage, $cookies, $http, $q, API) {

    /* $http.defaults.headers.post['X-CSRFToken'] = $cookies.csrftoken;
     $http.defaults.headers.xsrfHeaderName = 'X-CSRFToken';
     $http.defaults.headers.xsrfCookieName = 'csrftoken';
     $http.defaults.xsrfHeaderName = 'X-CSRFToken';
     $http.defaults.xsrfCookieName = 'csrftoken';*/


    return {
        getRequest: function (url) {
            var promise = $q.defer();
            $http.get(url).success(function (data) {
                promise.resolve(data);
            }).error(function (data) {
                promise.reject(data);
            });
            return promise.promise;
        },

        putRequest: function (url, postdata) {
            var promise = $q.defer();
            $http.put(url, postdata, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                }

            }).success(function (data) {
                promise.resolve(data);
            }).error(function (data) {
                promise.reject(data);
            });
            return promise.promise;
        },
        postRequest: function (url, postdata) {
            var promise = $q.defer();
            $http.post(url,
                postdata, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                    }

                }).then(function (data) {
                promise.resolve(data);
            }, function (data) {
                console.error('Failed in submitting');
                console.error(data);
                promise.reject(data);
            });
            return promise.promise;

        }
    }
});



interactApp.service('Questionnaires', function ($q, $http, API, $log, $localstorage, QuestionaireRequest) {
    var token = $localstorage.getObject("AccessToken");
    $http.defaults.headers.common['X-CSRFToken'] = $localstorage.get("token");
    $http.defaults.headers.common['Authorization'] = token.token_type + ' ' + token.access_token;


    this.submit = function (runid, passedData) {
        return QuestionaireRequest.submitQuestionnare(runid, passedData);
    };
    this.submitJumbo = function (unique_id, object) {
        return QuestionaireRequest.submitJumbo(unique_id, object);
    };
    this.getNextPage = function (runid) {
        return QuestionaireRequest.getNextPage(runid);
    };
    this.getData = function (client) {
        return QuestionaireRequest.getQuestions(client);
    };
    this.getQuestionnaires = function (company) {
        return QuestionaireRequest.getQuestionnaires(company);
    };
    this.getQuestionnaire = function (runId) {
        return QuestionaireRequest.getQuestionnaire(runId);
    };
});

interactApp.service('Clients', function ($q, $http, API, $localstorage, $log, Settings, $filter) {
    var storedClient = undefined;
    var client = $localstorage.getObject("user");

    var loadTokens = function () {
        var token = $localstorage.getObject("AccessToken");
        $http.defaults.headers.common['X-CSRFToken'] = $localstorage.get("token");
        $http.defaults.headers.common['Authorization'] = token.token_type + ' ' + token.access_token;

    }

    this.sideMenu = function () {
        loadTokens();
        return Settings.sideMenu(client);
    };
    this.boxes = function () {

        loadTokens();
        return Settings.boxes(client);
    };
    this.save = function () {
        loadTokens();
        client.dob = $filter('date')(client.dob, 'yyyy-MM-dd') + 'T00:00:00.000Z';
        return Settings.save(client);
    };
    this.settings = function () {
        loadTokens();
        return Settings.getUserSettings();
    };
    this.theme = function (object) {
        loadTokens();
        return Settings.theme();
    };

});

interactApp.factory('$localstorage', function ($window) {
    return {
        set: function (key, value) {
            $window.localStorage[key] = value;
        },
        get: function (key, defaultValue) {
            return $window.localStorage[key] || defaultValue;
        },
        setObject: function (key, value) {
            $window.localStorage[key] = JSON.stringify(value);
        },
        getObject: function (key) {
            return JSON.parse($window.localStorage[key] || '{}');
        }
    }
});

interactApp.factory('$cordovaDatePicker', function ($window, $q) {

    return {
        show: function (options) {
            var q = $q.defer();
            options = options || {
                date: new Date(),
                mode: 'date'
            };
            $window.datePicker.show(options, function (date) {
                q.resolve(date);
            });
            return q.promise;
        }
    }
});


interactApp.service('Camera', function ($cordovaCamera, $q) {
    this.takePicture = function () {
        var deferred = $q.defer();
        var options = {
            quality: 75,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 300,
            targetHeight: 300,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
        $cordovaCamera.getPicture(options).then(function (imageData) {
            deferred.resolve(imageData);
        }, function (data) {
            deferred.reject(data);
        });
        return deferred.promise;
    };

    this.choosePicture = function () {
        var deferred = $q.defer();
        navigator.camera.getPicture(function (imageData) {
            deferred.resolve(imageData);
        }, deferred.reject, {
            quality: 75,
            targetWidth: 300,
            targetHeight: 300,
            destinationType: navigator.camera.DestinationType.FILE_URI,
            sourceType: navigator.camera.PictureSourceType.PHOTOLIBRARY
        });
        return deferred.promise;
    };
});

interactApp.factory('Sessions', function ($http, Request, $window, $ionicHistory, $timeout, $resource, $q, API, $localstorage) {


    return {
        getToken: function () {
            return Request.getRequest(API + 'accounts/get_csrf_token/');
        },
        getAccessToken: function (user) {
            $http.defaults.headers.common['Authorization'] = 'Bearer tFpx9xzICdy7Y4sV2PcqxF8fKOC62m';
            return Request.postRequest('https://www.enteract.io/o/token/', user);
        },
        getSettings: function () {
            return angular.isUndefined($window.localStorage.settings) ? undefined : $localstorage.getObject("settings");
        },
        retrieveToken: function () {
            return angular.isUndefined($window.localStorage.AccessToken) ? undefined : $localstorage.getObject("AccessToken");
        },
        retrieveClient: function () {
            return angular.isUndefined($window.localStorage.user_profile) ? undefined : $localstorage.getObject("user_profile");
        },
        getBoxes: function () {
            return angular.isUndefined($window.localStorage.boxes) ? undefined : $localstorage.getObject("boxes");
        },
        getCustClass: function () {
            return angular.isUndefined($window.localStorage.custClass) ? 'bar-calm' : $localstorage.get("custClass");
        },
        setCustClass: function (custClass) {
            $window.localStorage.custClass = custClass;
        },
        getLoggedIn: function () {
            return angular.isUndefined($window.localStorage.isLoggedIn) ? false : $localstorage.get("isLoggedIn");
        },
        setMenu: function (menu) {
            $window.localStorage.menu = JSON.stringify(menu);
        },
        getMenu: function () {
            return angular.isUndefined($window.localStorage.menu) ? {} : $localstorage.getObject("menu");
        },
        setName: function (name) {
            $window.localStorage.name = name;
        },
        getName: function () {
            return angular.isUndefined($window.localStorage.name) ? '' : $localstorage.get("name");
        },
        logout: function () {
            $window.localStorage.isLoggedIn = false;
            $window.localStorage.removeItem('AccessToken');
            $window.localStorage.removeItem('user_profile');
            $window.localStorage.removeItem('settings');
            $ionicHistory.clearCache();
            $ionicHistory.clearHistory();
            $timeout(function () {}, 100);
        }
    }
});


interactApp.factory('QuestionStored', function ($http, $cookies, $filter, $localstorage, Request, $resource, $q, API) {
    return {

        getQuestionsetBySectionId: function (runid) {
            questionnaireObj = $localstorage.getObject("questionnaires");
            questionnaireSet = $localstorage.getObject("questionset");

            var notStarted = questionnaireObj;
            data = null;
            questions = null;
            questionnaireObj.forEach(function (question) {
                if (question.runid == runid)
                    questionnaireSet.forEach(function (questionset) {
                        if (question.unique_id == questionset.unique_id) {
                            questions = questionset.questionset;
                            data = question;
                        }
                    });
            });

            result = questions[0];
            return {
                "results": result,
                "questionnaireObj": data,
                "notStarted": notStarted
            }
        },
        getQuestionsetById: function (questionId) {
            questionnaireSet = $localstorage.getObject("questionset");
            questionnaireSet.forEach(function (questionset) {
                console.log("by id", questionset);
                if (questionset.id == questionId) {
                    console.log("by id", questionset);
                    return questionset;

                }
            });
        },
        updateQuestionsetById: function (questionId, question, obj_id) {
            questionnaireSet = $localstorage.getObject("questionset");
            var i = 0;
            questionnaireSet.forEach(function (questionset) {
                if (questionset.id == questionId) {
                    questionnaireSet[i].unique_id = obj_id;
                    questionnaireSet[i].questionset = question;
                }
                i++;
            });
            $localstorage.setObject("questionset", questionnaireSet);
        },
        updateQuestionsetByUniqueId: function (uniqueId, question) {
            questionnaireObj = $localstorage.getObject("questionnaire");
            console.log(questionnaireObj);
            var i = 0;
            questionnaireObj.forEach(function (questionset) {
                if (questionset.unique_id == uniqueId) {
                    console.log(question, questionset);
                    // questionnaireSet[i]
                }
                i++;
            });
            $localstorage.setObject("questionnaire", questionnaireObj);
        },
        insertQuestion: function (obj) {
            questionnaireSet = $localstorage.getObject("questionset");
            questionnaireSet.push(obj);
            $localstorage.setObject("questionset", questionnaireSet);
        }
    }

});
interactApp.factory('UserRequest', function ($http, $cookies, $filter, $localstorage, Request, $resource, $q, API) {

    return {
        loginUser: function (user) {
            return Request.postRequest(API + 'accounts/login/consumer/', user);
        },
        getUserProfile: function () {
            var token = $localstorage.getObject("AccessToken");
            $http.defaults.headers.common['X-CSRFToken'] = $localstorage.get("token");
            $http.defaults.headers.common['Authorization'] = token.token_type + ' ' + token.access_token;

            return Request.getRequest(API + 'reviewers/' + $localstorage.getObject("user").slug + '/?type=' + $localstorage.getObject("user").type);
        },
        changePassword: function (new_password1, new_password2) {
            return Request.postRequest(API + 'accounts/' + $localstorage.getObject("user").user.id + '/change_password/', {
                'old_password': client.password,
                'new_password1': new_password1,
                'new_password2': new_password2
            });
        },
        updateUser: function (user) {
            var token = $localstorage.getObject("AccessToken");
            $http.defaults.headers.common['X-CSRFToken'] = $localstorage.get("token");
            $http.defaults.headers.common['Authorization'] = token.token_type + ' ' + token.access_token;
            user.dob = $filter('date')(user.dob, 'yyyy-MM-dd') + 'T00:00:00.000Z';
            console.log(user, user);
            return Request.putRequest(API + 'accounts/' + $localstorage.getObject("user").slug + '/?type=' + $localstorage.getObject("user").type, user);
        }
    }
});


interactApp.factory('Settings', function ($http, $cookies, $localstorage, Request, $resource, $q, API) {

    return {
        getUserSettings: function () {
            return Request.getRequest(API + 'reviewers/' + $localstorage.getObject("user").slug + '/settings/?type=' + $localstorage.getObject("user").type);
        },
        sideMenu: function (client) {
            return Request.getRequest(API + 'reviewers/' + client.slug + '/layout/sidemenu/');
        },
        boxes: function (client) {
            return Request.getRequest(API + 'reviewers/' + client.slug + '/layout/box/');
        },
        save: function (client) {
            return Request.putRequest(API + 'reviewers/' + client.slug + '/?type=' + client.type, client);
        },
        theme: function (object) {
            return Request.putRequest(API + 'reviewers/' + $localstorage.getObject("user").slug + '/settings/?type=' + $localstorage.getObject("user").type, object);
        }
    }
});

interactApp.factory('QuestionaireRequest', function ($http, $localstorage, Request, $resource, $q, API) {
    return {
        getQuestionProgress: function () {

            var token = $localstorage.getObject("AccessToken");
            $http.defaults.headers.common['X-CSRFToken'] = $localstorage.get("token");
            $http.defaults.headers.common['Authorization'] = token.token_type + ' ' + token.access_token; //+$localstorage.get("token");
            return Request.getRequest(API + 'reviewers/' + $localstorage.getObject("user").slug + '/questionnaires/?type=' + $localstorage.getObject("user").type);
        },

        getQuestions: function (client) {
            return Request.getRequest(API + 'reviewers/' + client.slug + '/questionnaires/?type=' + client.type + '&mode=offline');
        },

        submitQuestionnare: function (runid, passedData) {
            var token = $localstorage.getObject("AccessToken");
            $http.defaults.headers.common['X-CSRFToken'] = $localstorage.get("token");            
            $http.defaults.headers.common['Authorization'] = token.token_type + ' ' + token.access_token; 
            
            return Request.postRequest(API + 'questionnaires/q/' + runid + '/', passedData);
        },
        submitJumbo: function (unique_id, object) {
            return Request.postRequest(API + 'questionnaires/' + unique_id + '/take/results', {
                responses: object
            });
        },
        getNextPage: function (unique_id, object) {
            return Request.postRequest(API + 'questionnaires/' + unique_id + '/take/results', {
                responses: object
            });
        },
        getQuestionnaires: function (company) {
            return Request.getRequest(API + '/' + company + '/questionnaires/');
        },
        getQuestionnaire: function (runId) {
            return Request.getRequest(API + 'questionnaires/q/' + runId + '/');
        }
    }
});