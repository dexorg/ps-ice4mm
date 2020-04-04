/**
 * @copyright Digital Engagement Xperience 2017-2019
 *
 */
/* global dexit, _ */

/**
 *
 * @param {object} [args]
 * @constructor
 */
dexit.app.ice.EngagementMetricVM = function (args) {
    var self = this;


    /**
     * @typedef {Object} EM
     * @property {String} [createdTime]
     * @property {String} metricDefinition
     * @property {Object} metricDefinitionDetail
     * @property {String} metricDefinitionDetail.retrieval - value or 'precomputed'
     * @property {Object} [metricDefinitionDetail.options]
     * @property {String} [metricDefinitionDetail.options.datastore] - where to save
     * @property {String} metricDefinitionDetail.options.formula - extended formula
     * @property {String} metricDesc
     * @property {String} metricId
     * @property {String} metricName
     * @property {String} metricType
     * @property {String} modifiedTime
     */


    /**
     * @field {ko.observableArray<EM>}
     */
    self.availableMetrics = ko.observableArray([]);


    /**
     * @typedef {object} Ept
     * @property {String} name
     * @property {String} behaviourId
     * @property {String} created
     * @property {String} dataPoint
     * @property {String} engagementPointId
     * @property {String} id
     * @property {String} modified
     * @property {String} source
     */

    /**
     * @field {ko.observableArray<Ept>}
     */
    self.availableEpts = ko.observableArray([]);


    /**
     * @typedef {object} Formula
     * @property {String} name
     * @property {String} description
     * @property {object} schema - uses JSON schema to generate form fields, each field includes data type
     *
     * @see {@link http://www.alpacajs.org/documentation.html|for details }
     */

    /**
     * @field {ko.observableArray<Formula>}
     */
    self.availableFormulas = ko.observableArray([]);


    self.availableDataTypes= ko.observableArray(['integer','string','decimal','percent']);
    //mode is either 'list' or 'create'
    self.mode = ko.observable('list');


    self.metricName = ko.observable('');
    self.metricDescription = ko.observable('');
    self.metricEpts = ko.observableArray([]);

    //holds metric formula
    self.metricFormula = ko.observable('');
    self.metricValueType = ko.observable('');






    self.metricFormulaParameters = ko.observableArray([]);

    /**
     * @field {ko.observable<Formula>}
     */
    self.selectedMetricFormula = ko.observable('');


    self.selectedEpt = ko.observable();


    self.formulaValidated = ko.observable(false);


    // self.createFieldsFilled = ko.computed(function () {
    self.createFieldsFilled = function () {
        var res = (self.metricName() && self.metricDescription() && self.selectedEpt() &&
            self.metricValueType() && self.formulaValidated());
        return (res ? true : false);
    };


    self.selectedMetricIdsForFormula = ko.pureComputed(function () {
        if (self.selectedMetricsForFormula() && self.selectedMetricsForFormula().length < 1) {
            return [];
        }

        var picked = _.map(self.selectedMetricsForFormula(), function (val) {
            return val.metricId;
        });
        return picked;
    });


    self.selectMetricForFormula = function(index) {

        var metric = self.availableMetrics()[index];

        var existingSelected = self.selectedMetricsForFormula() || [];

        var alreadySelectedIndex = _.findIndex(existingSelected, function (val) {
            return (metric && metric.metricId && val.metricId && val.metricId === metric.metricId);
        });

        if (alreadySelectedIndex === -1) {
            //add
            self.selectedMetricsForFormula.push(metric);
        }else {
            //remove if it was clicked again
            var newArr = existingSelected.splice(alreadySelectedIndex,1);
            self.selectedMetricsForFormula(newArr);
        }
    };



    self.selectFormula = function (index) {

        //select formula
        self.selectedMetricFormula(self.availableFormulas()[index]);
        //select output of formula

    };

    /**
     * Clears all observables related to creating new metric
     */
    self.clearCreate = function () {
        self.metricName('');
        self.metricDescription('');
        self.metricEpts('');
        self.metricFormula('');
        self.metricValueType('');
        self.selectedMetricFormula('');
        self.metricFormulaParameters([]);
        self.formulaValidated(false);

    };

    /**
     * Show List View
     */
    self.goToList = function () {
        self.mode('list');
        self.clearCreate();
        self.listEM();
    };


    /**
     * jquery helper method for after when Ept is dragged to list
     * @param {object} element - html
     * @param {object} number - number of items in list
     * @param {object} obj - dragged engagement point object
     */
    self.afterAddedEpt = function (element, event, obj) {
        var params = self.metricFormulaParameters();

        //TODO: validate it being added to formula
        //assumption: more than 1 metric is required
        if (params.length > 1) {
            self.formulaValidated(true);
            //re-build formula

            var ids = _.map(self.metricFormulaParameters(),function (val) {
                var id = val.id || val.eptId;
                return 'ept' + id;
            });
            self.metricFormula(self.selectedMetricFormula().name + '([' + ids.join(',') + '])');

            if (self.selectedMetricFormula().outputValueType) {
                self.metricValueType(self.selectedMetricFormula().outputValueType);
            }
        }
        //TODO:check formula

    };

    /**
     * Show Create View
     */
    self.goToCreate = function () {
        self.clearCreate();
        self.mode('create');
        self.retrieveAvailableFormulas();
        dexit.app.ice.integration.ept.listAvailableEngagementPoints(function (err, res) {
            if (err) {
                //TODO: handle error
                console.error(('could not list any available Epts'));
            } else {
                //TODO: sort by type== explicit first and type == implicit second
                self.availableEpts(res);
            }

        });
    };

    /**
     * Creates a new EM
     */
    self.saveEM = function () {


        //
        // if (!self.createFieldsFilled()) {
        //     alert('you must fill in all fields');
        //     return;
        // }

        //Build formula

        //only case: formula takes an array of items and formula area is shown that accepts an array of items
        if (self.selectedEpt()) {

            //ept ids
            // var eptIds = _.map(self.metricFormulaParameters(),function (val) {
            //     var id = val.id || val.eptId;
            //     return id;
            // });

            var eptId = self.selectedEpt().id;
            /**
             * EM Request (EM minus metricId)
             * @type {EM}
             */
            var params = {
                'metricName': self.metricName(),
                'metricType': self.metricValueType() || 'number',
                'metricDesc': self.metricDescription(),
                'metricDefinition': 'value(ept)',
                'metricDefinitionDetail': {
                    'retrieval': 'precomputed',
                    'options': {
                        'formula': self.metricFormula() || 'value'
                    }

                },
                'engagementPoint':[eptId]

            };

            dexit.app.ice.integration.metrics.createEM(params, function (err, result) {
                if (err) {
                    console.error('could not create metric');
                }
                self.goToList();

            });


        }
    };

    self.deleteEM = function (metricObj) {
        if (!metricObj || !metricObj.metricId) {
            console.error('metric id is required');
            return;
        }
        //TODO: should show a spinner and error message to user
        dexit.app.ice.integration.metrics.removeEM(metricObj.metricId, function (err) {
            if (err) {
                console.error('problem removing metric %s: %o',metricObj.metricId, err);
            }
            $('.popover').popover('hide');
            self.listEM();
        });
    };


    var arraySchema = {
        'definitions': {},
        '$schema': 'http://json-schema.org/draft-04/schema#',
        'type': 'object',
        'properties': {
            'type': 'array',
            'minItems': 1,
            'items': {
                'default': '',
                'type': 'number',
                'description': 'A numeric value'
            }
        }
    };

    var arraySchemaMaxLen4 = {
        'definitions': {},
        '$schema': 'http://json-schema.org/draft-04/schema#',
        'type': 'object',
        'properties': {
            'type': 'array',
            'minItems': 2,
            'maxItems': 4,
            'items': {
                'default': '',
                'type': 'number',
                'description': 'A numeric value'
            }
        }
    };


    //self.metricEditorTypes = ko.observableArray(['simple', 'complex']);
    //disable complex selection for now
    self.metricEditorTypes = ko.observableArray(['simple']);
    self.selectedMetricEditorType = ko.observable('simple');
    self.selectedMetricsForFormula = ko.observableArray([])

    self.showArrayFormulaArea = ko.pureComputed(function () {
        return (self.selectedMetricFormula() && self.selectedMetricFormula().schema &&
            self.selectedMetricFormula().schema.properties &&
            self.selectedMetricFormula().schema.properties.type &&
            self.selectedMetricFormula().schema.properties.type.toLowerCase() === 'array');
    });


    self.retrieveAvailableFormulas = function () {
        var formulas = [
            {name:'sum', description:'The aggregate of 2 or more numbers', schema:arraySchemaMaxLen4, outputValueType:'decimal'},
            {name:'count', description:'The total number of items in an array', schema:arraySchemaMaxLen4, outputValueType:'integer'},
            {name:'average', description:'Mean of an array of numbers', schema:arraySchema, outputValueType:'decimal'},
            {name:'max', description:'Returns the maximum value in an array', schema:arraySchema, outputValueType:'decimal'},
            {name:'min', description:'Returns the minimum value in an array', schema:arraySchema, outputValueType:'decimal'}
        ];

        self.availableFormulas(formulas);
    };

    /**
     * Populates availableMetrics
     */
    self.listEM = function () {
        dexit.app.ice.integration.metrics.listMetrics(function (err, result) {
            if (err) {
                //TODO: handle error
                console.error(('could not list metrics'));
            }else {
                // var mapped = _.map(result) {
                //     var res = result;
                //     res.isChecked
                // }
                self.availableMetrics(result);
            }
        });
    };





};
