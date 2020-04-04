/**
 * Copyright Digital Engagement Xperience 2017
 */

ko.bindingHandlers.checkedButtons = {
    'init': function (element, valueAccessor, allBindingsAccessor) {
        var type = element.getAttribute('data-toggle') || 'radio';
        var updateHandler = function () {
            var valueToWrite;
            var isActive = !!~element.className.indexOf('active');
            var dataValue = element.getAttribute('data-value');
            if (type == 'checkbox') {
                valueToWrite = !isActive;
            } else if (type == 'radio' && !isActive) {
                valueToWrite = dataValue;
            } else {
                return; // "checkedButtons" binding only responds to checkbox and radio data-toggle attribute
            }

            var modelValue = valueAccessor();
            if ((type == 'checkbox') && (ko.utils.unwrapObservable(modelValue) instanceof Array)) {
                // For checkboxes bound to an array, we add/remove the checkbox value to that array
                // This works for both observable and non-observable arrays
                var existingEntryIndex = ko.utils.arrayIndexOf(ko.utils.unwrapObservable(modelValue), dataValue);
                if (!isActive && (existingEntryIndex < 0))
                    modelValue.push(dataValue);
                else if (isActive && (existingEntryIndex >= 0))
                    modelValue.splice(existingEntryIndex, 1);
            } else {
                if (modelValue() !== valueToWrite) {
                    modelValue(valueToWrite);
                }
            }
        };

        ko.utils.registerEventHandler(element, 'click', updateHandler);
    },
    'update': function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var type = element.getAttribute('data-toggle') || 'radio';

        if (type == 'checkbox') {
            if (value instanceof Array) {
                // When bound to an array, the checkbox being checked represents its value being present in that array
                if (ko.utils.arrayIndexOf(value, element.getAttribute('data-value')) >= 0) {
                    ko.utils.toggleDomNodeCssClass(element, 'active', true);
                }
                else {
                    ko.utils.toggleDomNodeCssClass(element, 'active', false);
                }

            } else {
                // When bound to anything other value (not an array), the checkbox being checked represents the value being trueish
                ko.utils.toggleDomNodeCssClass(element, 'active', value);
            }
        } else if (type == 'radio') {
            ko.utils.toggleDomNodeCssClass(element, 'active', element.getAttribute('data-value') == value);
        }
    }
};

