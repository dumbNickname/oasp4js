describe('Module: \'oasp.validation\', directive: \'with-validation-messages\'', function () {
  'use strict';
  var $compile, $scope, translatedRequiredErrorMessage = 'Dies ist ein Mussfeld';

  beforeEach(module('oasp.validation', 'oasp.oaspI18n',
    function ($translateProvider) {
      $translateProvider.translations('de', {
        common: {
          validation: {
            required: translatedRequiredErrorMessage
          }
        }
      });
      $translateProvider.preferredLanguage('de');
    }));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $scope = _$rootScope_;
  }));

  it('transcludes an input with no validation', function () {
    // when
    var element = $compile(
      '<form name="myForm1" novalidate>' +
      '  <div with-validation-messages>' +
      '    <input ng-model="abc" name="myField1" type="text">' +
      '  </div>' +
      '</form>')($scope);
    $scope.$digest();
    // then
    expect(element.find('div.input-with-validation-messages > input').length).toEqual(1);
  });
});
