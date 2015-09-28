angular.module('app.main')
    .factory('signIn', function (oaspSecurityService, globalSpinner) {
        'use strict';

        return function (ctrl, signInSuccessCallback) {
            ctrl.errorMessage = {
                text: '',
                hasOne: function () {
                    return this.text ? true : false;
                },
                clear: function () {
                    this.text = '';
                }
            };

            ctrl.credentials = {};

            ctrl.validation = {
                userNameNotProvided: function () {
                    return (ctrl.getLoginForm().userName.$dirty || this.forceShowingValidationErrors) &&
                        ctrl.getLoginForm().userName.$error.required;
                },
                passwordNotProvided: function () {
                    return (ctrl.getLoginForm().password.$dirty || this.forceShowingValidationErrors) &&
                        ctrl.getLoginForm().password.$error.required;
                },
                forceShowingValidationErrors: false
            };

            ctrl.signIn = function () {
                var addErrorMessageAndClearForm = function (message) {
                    ctrl.errorMessage.text = message;
                    ctrl.credentials = {};
                    ctrl.validation.forceShowingValidationErrors = false;
                    ctrl.getLoginForm().$setPristine();
                };
                if (ctrl.getLoginForm().$invalid) {
                    ctrl.validation.forceShowingValidationErrors = true;
                } else {
                    globalSpinner.decorateCallOfFunctionReturningPromise(function () {
                        return oaspSecurityService.logIn(ctrl.credentials.username, ctrl.credentials.password);
                    }).then(function () {
                        signInSuccessCallback();
                    }, function () {
                        addErrorMessageAndClearForm('Authentication failed. Please try again!');
                    });
                }
            };
        };
    });

