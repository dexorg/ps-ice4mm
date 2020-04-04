/**
 * Copyright Digital Engagement Xperience 2017
 */

/**
 * Uses jquery fade in and fade out effect for visible not visible
 * @type {{init: ko.bindingHandlers.visibleFade.init, update: ko.bindingHandlers.visibleFade.update}}
 * @example <script>var obs = ko.observable(true);</script><div data-bind="visibleFade: obs">hello</div>
 */
ko.bindingHandlers.visibleFade = {
    init: function(element, valueAccessor) {
        var value = valueAccessor();
        $(element).toggle(value());
    },
    update: function(element, valueAccessor) {
        var value = valueAccessor();
        value() ? $(element).fadeIn() : $(element).fadeOut();
    }
};

ko.bindingHandlers.epafilesUpload = {
    init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        $(element).after('<div class="progress"><div class="bar"></div><div class="percent">0%</div></div><div class="progressError"></div>');
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var options = ko.utils.unwrapObservable(valueAccessor()),
            property = ko.utils.unwrapObservable(options.property),
            tagName = ko.utils.unwrapObservable(options.tag);
        if (property) {

            $(element).unbind();
            $(element).change(function () {
                if (element.files.length) {
                    var $this = $(this),
                        fileName = $this.val(),
                        bgSrc;

                    if (element.files[0].type.match('image.*')) {
                        bgSrc = window.URL.createObjectURL(element.files[0]);
                    } else if (element.files[0].type.match('video.*')) {
                        bgSrc = 'images/videoIcon.png';
                    } else {
                        bgSrc = 'images/gradable.png';
                    }

                    var style = $('<style>.no-content::before { content: ""; background-image: url(' + bgSrc +'); background-repeat: no-repeat; background-size: auto 70%; background-position: center center; }</style>');

                    if ($('html > head > style')) {
                        $('html > head > style').remove();
                    }

                    $('html > head').append(style);

                    $('#uploadFM').addClass('no-content');

                    $('.fileUploader + h4 span').text(element.files[0].name);

                    $('.fileUploader ~ button').removeAttr('disabled');

                    //In ice4mm, when upload file from EPA page, get fileName from $data and call a callback function in the main VM to upload the file.
                    bindingContext.$root[property](fileName);
                    bindingContext.$root.filesUploadCallback(element.id, tagName, function () {
                        //updated MM for epa and bc-instanceVM
                        bindingContext.$root.selectedCourse().courseVM.imageMM(bindingContext.$root.imageMM());
                        bindingContext.$root.selectedCourse().courseVM.videoMM(bindingContext.$root.videoMM());
                        bindingContext.$root.selectedCourse().courseVM.docMM(bindingContext.$root.docMM());
                        //reload mm
                        dpa_VM.initMM();
                    });
                }
            });
        }
    }
};





/**
 * Binding for bootstrap button group to act as radio or check list
 * @type {{init: ko.bindingHandlers.checkedButtons.init, update: ko.bindingHandlers.checkedButtons.update}}
 */
ko.bindingHandlers.checkedButtons = {
    init: function (element, valueAccessor, allBindingsAccessor) {
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
    update: function (element, valueAccessor) {
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

ko.bindingHandlers.dateTimePickerIce4m = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        //initialize datepicker with some optional options
        var options = allBindingsAccessor().dateTimePickerOptions || {};
        $(element).datetimepicker(options);

        //when a user changes the date, update the view model
        ko.utils.registerEventHandler(element, "dp.change", function (event) {
            var value = valueAccessor();
            if (ko.isObservable(value)) {
                if (event.date != null){
                    value(event.date);
                }
            }
        });

        ko.utils.domNodeDisposal.addDisposeCallback(element, function () {
            var picker = $(element).data("DateTimePicker");
            if (picker) {
                picker.destroy();
            }
        });
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

        var picker = $(element).data("DateTimePicker");
        //when the view model is updated, update the widget
        if (picker) {
            var koDate = ko.utils.unwrapObservable(valueAccessor());
            //in case return from server datetime i am get in this form for example /Date(93989393)/ then fomat this
            koDate = (typeof (koDate) !== 'object') ? new Date(parseFloat(koDate.replace(/[^0-9]/g, ''))) : koDate;
            picker.date(koDate);
        }
    }
};



ko.bindingHandlers.datepicker2 = {
    init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
        //initialize datepicker with some optional options
        var options = {

            changeMonth: true,
            numberOfMonths: 3,
            dateFormat: "yy-mm-dd"
        };

        _.extend( options, allBindingsAccessor().datepickerOptions );

        $(element).datepicker(options);

        //handle the field changing
        ko.utils.registerEventHandler(element, "change", function () {
            var observable = valueAccessor();
            observable($(element).datepicker("getDate"));
        });

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
            $(element).datepicker("destroy");
        });

    },
    //update the control when the view model changes
    update: function(element, valueAccessor, allBindingsAccessor, viewModel) {

        var value = ko.utils.unwrapObservable(valueAccessor()),
            current = $(element).datepicker("getDate");

        // set the value if different
        if (value - current !== 0) {

            $(element).datepicker("setDate", value);
        }
    }
};

ko.bindingHandlers.jquerydatepicker = {
    init: function(element, valueAccessor, allBindingsAccessor) {
        var options = allBindingsAccessor().datepickerOptions || {},
            $el = $(element);

        //initialize datepicker with some optional options
        $el.datepicker(options);

        //handle the field changing
        ko.utils.registerEventHandler(element, "change", function() {
            var observable = valueAccessor();
            observable($el.datepicker("getDate"));
        });

        //handle disposal (if KO removes by the template binding)
        ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
            $el.datepicker("destroy");
        });

    },
    update: function(element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor()),
            $el = $(element),
            current = $el.datepicker("getDate");

        if (value - current !== 0) {
            $el.datepicker("setDate", value);
        }
    }
};



ko.bindingHandlers.trimmedLink = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        $(element).on('change', function () {
            var observable = valueAccessor();
            var text = $(this).text();
            var trimedValue =  text.substring(text.lastIndexOf('/') +1);
            observable(trimedValue);
        });
    },
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        var trimedValue =  value.substring(value.lastIndexOf('/') +1);
        $(element).text(trimedValue);
    }
};



ko.bindingHandlers.dataTablesForEach = {
    page: 0,
    init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var binding = ko.utils.unwrapObservable(valueAccessor());

        ko.unwrap(binding.data);

        if (binding.options.paging) {
            binding.data.subscribe(function(changes) {
                var table = $(element).closest('table').DataTable();
                ko.bindingHandlers.dataTablesForEach.page = table.page();
                table.destroy();
            }, null, 'arrayChange');
        }

        var nodes = Array.prototype.slice.call(element.childNodes, 0);
        ko.utils.arrayForEach(nodes, function(node) {
            if (node && node.nodeType !== 1) {
                node.parentNode.removeChild(node);
            }
        });

        return ko.bindingHandlers.foreach.init(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
        var binding = ko.utils.unwrapObservable(valueAccessor()),
            key = 'DataTablesForEach_Initialized';

        ko.unwrap(binding.data);

        var table;
        if (!binding.options.paging) {
            table = $(element).closest('table').DataTable();
            table.destroy();
        }

        ko.bindingHandlers.foreach.update(element, valueAccessor, allBindings, viewModel, bindingContext);

        table = $(element).closest('table').DataTable(binding.options);

        if (binding.options.paging) {
            if (table.page.info().pages - ko.bindingHandlers.dataTablesForEach.page === 0) {
                table.page(--ko.bindingHandlers.dataTablesForEach.page).draw(false);
            } else {
                table.page(ko.bindingHandlers.dataTablesForEach.page).draw(false);
            }
        }

        if (!ko.utils.domData.get(element, key) && (binding.data || binding.length)) {
            ko.utils.domData.set(element, key, true);
        }

        return {
            controlsDescendantBindings: true
        };
    }
};

ko.bindingHandlers.filesUploadModal = {
    init: function (element, valueAccessor) {
        $(element).after('<div class="progress"><div class="bar"></div><div class="percent">0%</div></div><div class="progressError"></div>');
    },
    update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
        var options = ko.utils.unwrapObservable(valueAccessor()),
            property = ko.utils.unwrapObservable(options.property);
        if (property) {
            $(element).unbind();
            $(element).change(function () {
                if (element.files.length) {
                    var $this = $(this),
                        fileName = $this.val(),
                        bgSrc;

                    if (element.files[0].type.match('image.*')) {
                        bgSrc = window.URL.createObjectURL(element.files[0]);
                    } else if (element.files[0].type.match('video.*')) {
                        bgSrc = "images/videoIcon.png";
                    } else {
                        bgSrc = "images/gradable.png";
                    }

                    var style = $("<style>.no-content::before { content: ''; background-image: url(" + bgSrc + "); background-repeat: no-repeat; background-size: auto 70%; background-position: center center; }</style>");

                    if ($('html > head > style')) {
                        $('html > head > style').remove();
                    }

                    $('html > head').append(style);

                    $('#uploadFM').addClass('no-content');

                    $('.fileUploader + h4 span').text(element.files[0].name);

                    $('.fileUploader ~ button').removeAttr('disabled');

                    //Based on the parent viewmodle, in fileManager, the binding vm is $data, but other views such as ep, the binding is $parent, or $parents[0]
                    if (bindingContext.$parent && bindingContext.$parent[property] && bindingContext.$parent[property](fileName)) {
                        bindingContext.$parent[property](fileName);
                        // For uploading media not through file manager, we need to call a callback function in the VM to do auto upload with file sharing
                        bindingContext.$parent.filesUploadCallback(element.id);
                    } else if (bindingContext.$parents[1] && bindingContext.$parents[1][property] && bindingContext.$parents[1][property](fileName)) {
                        bindingContext.$parents[1][property](fileName);
                        bindingContext.$parents[1].filesUploadCallback(element.id);
                    } else {
                        //In modal use its own callback
                        bindingContext.$data[property](fileName);
                        bindingContext.$data.filesUploadCallback(element.id);
                    }
                }
            });
        }
    }
};

ko.bindingHandlers.checkedInArray = {
    init: function (element, valueAccessor) {
        ko.utils.registerEventHandler(element, "click", function() {
            var options = ko.utils.unwrapObservable(valueAccessor()),
                array = options.array, // don't unwrap array because we want to update the observable array itself
                value = ko.utils.unwrapObservable(options.value),
                checked = element.checked;
            ko.utils.addOrRemoveItem(array, value, checked);
        });
    },
    update: function (element, valueAccessor) {
        var options = ko.utils.unwrapObservable(valueAccessor()),
            array = ko.utils.unwrapObservable(options.array),
            value = ko.utils.unwrapObservable(options.value);

        element.checked = ko.utils.arrayIndexOf(array, value) >= 0;
    }
};
