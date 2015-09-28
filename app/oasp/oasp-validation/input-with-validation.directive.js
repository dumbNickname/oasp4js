'use strict';

angular.module('oasp.validation')
    .directive('withValidationMessages', function () {

        function getInputElement(transcludedElements) {
            var firstElement, ELEMENT_NODE_TYPE = 1;
            angular.forEach(transcludedElements, function (transcludedElem) {
                if (transcludedElem.nodeType === ELEMENT_NODE_TYPE) {
                    firstElement = transcludedElem;
                    return;
                }
            });
            return firstElement;
        }


        function setTranslateOptionsIfRequired(scope) {
            scope.translateOptions = function (validation) {
                return angular.isDefined(validation.number) ? {number: validation.number} : {};
            };
        }

        //try to avoid passing scope via closure as it might lead to memory leaks:
        //https://developers.google.com/speed/articles/optimizing-javascript#avoiding-pitfalls-with-closures
        function hasValdrErrorMessage(errorKey, formItem, scope) {
            var hasError = false,
                errorsOccurredOnInput = formItem.valdrViolations;
            angular.forEach(errorsOccurredOnInput, function (errorOnInput) {
                if (errorKey === errorOnInput.validator) {
                    setTranslateOptionsIfRequired(scope);
                    hasError = true;
                    return;
                }
            });
            return hasError;
        }

        function isPropertyForTranslation(property) {
            if (property !== 'field' && property !== 'message' && property !== 'type' &&
                property !== 'valid' && property !== 'validator' && property !== 'value') {
                return true;
            } else {
                return false;
            }
        }

        function recalculateValdrErrors(formItem, scope) {
            var newErrors = [];

            angular.forEach(formItem.valdrViolations, function (valdrError) {
                var params = {};
                if (hasValdrErrorMessage(valdrError.validator, formItem, scope)) {
                    angular.forEach(valdrError, function (errorProp) {
                        if (isPropertyForTranslation(errorProp)) {
                            params[errorProp] = valdrError[errorProp];
                        }
                    });
                    newErrors.push({
                        text: valdrError.message,
                        params: params
                    });
                }
            });
            return newErrors
        }

        function hasCustomErrorMessage(errorKey, formItem) {
            if (errorKey.substring(0, 5) === 'valdr') {
                return false;
            }
            var errorsOccurredOnInput = formItem.$error;
            return angular.isDefined(errorsOccurredOnInput[errorKey]);
        }

        function recalculateCustomErrors(formItem, scope) {
            var newErrors = [];

            angular.forEach(formItem.$error, function (errorProp) {
                if (hasCustomErrorMessage(errorProp, formItem)) {
                    newErrors.push({
                        text: scope.customErrorMessages[errorProp],
                        params: []
                    });
                }
            });
            return newErrors;
        }

        function isCustomErrorChanged(newCustomErrors, currentCustomErrors) {
            var isChanged = false;

            angular.forEach(newCustomErrors, function (prop) {
                if (angular.isDefined(currentCustomErrors) && currentCustomErrors.hasOwnProperty(prop)) {
                    if (newCustomErrors[prop] !== currentCustomErrors[prop]) {
                        isChanged = true;
                        return;
                    }
                } else {
                    isChanged = true;
                    return;
                }
            });
            return isChanged;
        }

        function isValdrErrorChanged(newValdrErrors, currentValdrErrors) {
            if (newValdrErrors.length !== currentValdrErrors.length) {
                return true;
            }
            for (var i = 0; i < newValdrErrors.length; i++) {
                if (newValdrErrors[i].text !== currentValdrErrors[i].text) {
                    return true;
                }
            }
            return false;
        }

        return {
            restrict: 'A',
            require: '^form',
            replace: true,
            transclude: true,
            templateUrl: 'oasp/oasp-validation/validation-messages.html',
            link: function (scope, element, attrs, form, transcludeFn) {
                var currentValdrErrors, currentCustomErrors,
                    getFormItem; // function initialized in transclude function, form item not accessible on link

                transcludeFn(function (clone) {
                    var inputElement = getInputElement(clone),
                        inputElementName = inputElement.getAttribute('name') || inputElement.getAttribute('data-name'),

                        getFormItem = function () {
                            return form[inputElementName];
                        };
                    element.find('.input-with-validation-messages').prepend(clone);
                });


                scope.customErrorMessages = attrs.withValidationMessages || {};

                scope.isInputInvalid = function () {
                    if (angular.isUndefined(getFormItem())) {
                        return false;
                    }
                    return (getFormItem().$touched || form.$submitted) && !getFormItem().$valid;
                };

                scope.items = function () {
                    var errors = [],
                        newValdrErrors = getFormItem().valdrViolations || [],
                        newCustomErrors = getFormItem().$error;
                    if (isCustomErrorChanged(newCustomErrors, currentCustomErrors)
                        || isValdrErrorChanged(newValdrErrors, currentValdrErrors)) {
                        errors = recalculateValdrErrors(getFormItem(), scope)
                            .concat(recalculateCustomErrors( getFormItem(), scope));
                    }
                    currentValdrErrors = angular.copy(newValdrErrors);
                    currentCustomErrors = angular.copy(newCustomErrors);
                    return errors;
                };



            }
        };
    });

