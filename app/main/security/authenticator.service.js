angular.module('app.main')
    .factory('authenticator', function ($modal) {
        'use strict';

        return {
            execute: function () {
                return $modal.open({
                    templateUrl: 'main/sign-in/sign-in-modal.html',
                    backdrop: 'static',
                    keyboard: false,
                    controller: 'SignInModalCntl as SIC',
                    size: 'sm'
                }).result;
            }
        };
    });
