﻿// Variables.
var app = angular.module("umbraco");

// Associate directive/controller.
app.controller("formulate.layoutBasic", controller);
app.directive("formulateLayoutBasic", directive);

// Directive.
function directive(formulateDirectives) {
    return {
        restrict: "E",
        replace: true,
        template: formulateDirectives.get(
            "layoutKinds/layoutBasic/layoutBasic.html"),
        scope: {
            data: "="
        },
        controller: "formulate.layoutBasic"
    };
}

//TODO: ...
function controller($scope, formulateForms, dialogService) {
    var services = {
        $scope: $scope,
        formulateForms: formulateForms,
        dialogService: dialogService
    };
    $scope.editRows = false;
    $scope.allFields = [];
    $scope.rows = [];
    $scope.getCellClass = function (row) {
        return "span" + (12 / row.cells.length).toString();
    };

    $scope.sortableOptions = {
        cursor: "move",
        connectWith: ".formulate-cell",
        tolerance: "pointer",
        items: ".formulate-cell-field",
        opacity: 0.5
    };

    $scope.rowsSortableOptions = {
        cursor: "move",
        tolerance: "pointer",
        axis: "y",
        opacity: 0.5,
        disabled: true
    };

    $scope.$watch("editRows", function (newValue, oldValue) {
        $scope.rowsSortableOptions.disabled = !newValue;
    });

    $scope.deleteRow = function (index) {
        $scope.rows.splice(index, 1);
        checkFields($scope);
    };

    $scope.addRow = function(columnCount) {
        var columns = [];
        for (var i = 0; i < columnCount; i++) {
            columns.push({
                fields: []
            });
        }
        $scope.rows.push({
            cells: columns
        });
    };

    checkFields($scope);

    $scope.pickForm = getPickForm(services);

}

function checkFields($scope) {
    var i, field, row, cell;
    var fields = {};
    for (i = 0; i < $scope.allFields.length; i++) {
        field = $scope.allFields[i];
        fields[field.id] = field;
    }
    for (i = 0; i < $scope.rows.length; i++) {
        row = $scope.rows[i];
        for (var j = 0; j < row.cells.length; j++) {
            cell = row.cells[j];
            for (var k = 0; k < cell.fields.length; k++) {
                field = cell.fields[k];
                if (fields.hasOwnProperty(field.id)) {
                    delete fields[field.id];
                }
            }
        }
    }
    var unassignedFields = [];
    for (var key in fields) {
        if (fields.hasOwnProperty(key)) {
            unassignedFields.push(fields[key]);
        }
    }
    if (unassignedFields.length > 0) {
        row = {
            cells: [
                {
                    fields: unassignedFields
                }
            ]
        };
        $scope.rows.push(row);
    }
}

//TODO: ...
function getPickForm(services) {
    var dialogService = services.dialogService;
    var formulateForms = services.formulateForms;
    var $scope = services.$scope;
    return function() {
        dialogService.open({
            template: "../App_Plugins/formulate/dialogs/pickForm.html",
            show: true,
            callback: function(data) {

                if (!data.length) {
                    clearFields($scope);
                    return;
                }

                // Get info about form based its ID,
                // then update the fields.
                formulateForms.getFormInfo(data[0])
                    .then(function (formData) {
                        clearFields($scope);
                        $scope.allFields = formData.fields
                            .map(function (item) {
                                return {
                                    id: item.id,
                                    name: item.name
                                };
                            });
                        checkFields($scope);
                    });

            }
        });
    };
}

function clearFields($scope) {
    var i, row, cell;
    $scope.allFields = [];
    for (i = 0; i < $scope.rows.length; i++) {
        row = $scope.rows[i];
        for (var j = 0; j < row.cells.length; j++) {
            cell = row.cells[j];
            cell.fields = [];
        }
    }
}