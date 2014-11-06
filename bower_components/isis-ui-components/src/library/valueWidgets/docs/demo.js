/*globals angular*/
'use strict';

var demoApp = angular.module( 'isis.ui.valueWidgets.demo', [ 'isis.ui.valueWidgets' ] );

demoApp.controller( 'ValueWidgetsDemoController', function ( $scope ) {

  var onValueChange,
  validators,
  selectedOption,
  options;

  selectedOption = {
    label: 'Should be selected',
    value: 'option_selected'
  };

  options = [
    {
      label: 'Option 1',
      value: 'option_1'
    },
    {
      label: 'Option 2',
      value: 'option_2'
    },
    {
      label: 'Option 3',
      value: 'option_3'
    },
    {
      label: 'Option 4',
      value: 'option_4'
    },
    {
      label: 'Option 5',
      value: 'option_5'
    }
  ];

  options.push( selectedOption );

  onValueChange = function ( val ) {
    console.log( 'Value changed:', val );
  };

  validators = {

    shorterThanTwenty: {
      id: 'shorterThanTwenty',
      errorMessage: 'This is not shorter than 20!',
      method: function ( modelValue, viewValue ) {
        var value = modelValue || viewValue;

        return !value || angular.isString( value ) && value.length < 20;
      }
    },

    shouldNotBeNo: {
      id: 'shouldNotBeNo',
      errorMessage: 'This can not be No!',
      method: function ( modelValue, viewValue ) {
        var value = modelValue || viewValue;

        return value !== false;
      }
    },

    shouldNotBeUndefinedOrNull: {
      id: 'shouldNotBeNo',
      errorMessage: 'This can not be undefined or null!',
      method: function ( modelValue, viewValue ) {
        var value = modelValue || viewValue;

        return value !== undefined && value !== null;
      }
    }

  };

  $scope.widgets = [

    {
      model: 'A string',
      modelConfigEdit: {
        validators: [ validators.shorterThanTwenty ],
        placeHolder: 'Enter something shorter than 20',
        modelChange: onValueChange
      },
      modelConfigDisplay: {
        modelChange: onValueChange,
        validators: [ validators.shorterThanTwenty ],
        placeHolder: 'N/A'
      },
      widgetConfigEdit: {
        label: 'stringWidget (autocomplete)',
        errorMessagesEmbedded: true,
        tooltip: 'Enter something here. This value represents a very important something.',
        autoCompleteItems: ['john', 'bill', 'charlie', 'robert', 'alban',
          'oscar', 'marie', 'celine', 'brad', 'drew', 'rebecca', 'michel',
          'francis', 'jean', 'paul', 'pierre', 'nicolas', 'alfred', 'gerard',
          'louis', 'albert', 'edouard', 'benoit', 'guillaume', 'nicolas', 'joseph']

      },
      widgetConfigDisplay: {
        label: 'stringWidget'
      },
      inputConfig: {
        name: 'stringWidget',
        id: 'stringWidget'
      }
    },

    {
      modelConfigEdit: {
        validators: [ validators.shouldNotBeUndefinedOrNull ],
        placeHolder: 'Credit card',
        modelChange: onValueChange
      },
      modelConfigDisplay: {
        modelChange: onValueChange,
        validators: [],
        placeHolder: 'N/A'
      },
      widgetConfigEdit: {
        label: 'stringWidget with mask',
        errorMessagesEmbedded: true,
        tooltip: 'Enter credit card number here.',
        mask: '9999 9999 9999 9999'
      },
      widgetConfigDisplay: {
        label: 'stringWidget'
      },
      inputConfig: {
        name: 'stringWidget',
        id: 'stringWidget'
      }
    },

    {
      model: 'The letter A stands for apple but can cause your brain melt. This is something you would not want to risk.',
      modelChange: onValueChange,
      modelConfigEdit: {
        validators: [ validators.shorterThanTwenty ],
        placeHolder: 'Enter something',
        modelChange: onValueChange
      },
      modelConfigDisplay: {
        modelChange: onValueChange,
        validators: [ validators.shorterThanTwenty ],
        placeHolder: 'N/A'
      },
      widgetType: 'string',
      widgetConfigEdit: {
        label: 'stringWidget - multiline',
        errorMessagesEmbedded: true,
        tooltip: 'Enter something here. This value represents a very important something.',
        multiLine: true,
        rows: 6
      },
      widgetConfigDisplay: {
        label: 'stringWidget - multiline'
      },
      inputConfig: {
        name: 'stringWidget',
        id: 'stringWidget'
      }
    },

    {
      model: true,
      modelConfigEdit: {
        validators: [ validators.shouldNotBeNo ],
        modelChange: onValueChange
      },
      modelConfigDisplay: {
        modelChange: onValueChange,
        validators: []
      },

      widgetConfigEdit: {
        label: 'checkboxWidget:',
        errorMessagesEmbedded: true,
        tooltip: 'Click it'
      },
      widgetConfigDisplay: {
        label: 'checkboxWidget:'
      },
      inputConfig: {
        name: 'checkboxWidget',
        id: 'checkboxWidget'
      }
    },

    {
      model: undefined,
      widgetType: 'checkbox',
      modelConfigEdit: {
        validators: [ validators.shouldNotBeUndefinedOrNull ],
        modelChange: onValueChange
      },
      modelConfigDisplay: {
        modelChange: onValueChange,
        placeHolder: 'No set',
        validators: []
      },

      widgetConfigEdit: {
        label: 'checkboxWidget (no default value):',
        errorMessagesEmbedded: true,
        trueLabel: 'Yes',
        falseLabel: 'No',
        tooltip: 'Some tooltip text'
      },
      widgetConfigDisplay: {
        label: 'checkboxWidget (no default value):'
      },
      inputConfig: {
        name: 'checkboxWidget',
        id: 'checkboxWidget'
      }
    },

    {
      model: selectedOption,
      widgetType: 'select',
      modelConfigEdit: {
        validators: [ validators.shouldNotBeUndefinedOrNull ],
        modelChange: onValueChange,
        placeHolder: '---',
        options: options
      },
      modelConfigDisplay: {
        modelChange: onValueChange,
        placeHolder: 'Not set',
        validators: []
      },

      widgetConfigEdit: {
        label: 'selectWidget (no default value):',
        errorMessagesEmbedded: true,
        trueLabel: 'Yes',
        falseLabel: 'No',
        tooltip: 'Some tooltip text'
      },
      widgetConfigDisplay: {
        label: 'selectWidget (no default value):'
      },
      inputConfig: {
        name: 'selectWidget',
        id: 'selectWidget'
      }
    },


    {
      model: [selectedOption],
      widgetType: 'select',
      modelConfigEdit: {
        validators: [ validators.shouldNotBeUndefinedOrNull ],
        modelChange: onValueChange,
        multiple: true,
        placeHolder: '---',
        options: options
      },
      modelConfigDisplay: {
        modelChange: onValueChange,
        placeHolder: 'Not set',
        multiple: true,
        validators: []
      },

      widgetConfigEdit: {
        label: 'selectWidget (multiple):',
        errorMessagesEmbedded: true,
        trueLabel: 'Yes',
        falseLabel: 'No',
        tooltip: 'Some tooltip text'
      },
      widgetConfigDisplay: {
        label: 'selectWidget (multiple):'
      },
      inputConfig: {
        name: 'selectWidget',
        id: 'selectWidget'
      }
    }


  ];

} );