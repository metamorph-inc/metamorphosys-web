/**
 * Created by J on 11/6/2014.
 */

define( [], function () {
    'use strict';

    function manifestProjectJson( cyPhyProjectName ) {
        return {
            Project: {
                Components: [],
                DesignSpaceModels: [],
                Configurations: [],
                TestBenches: [],
                Results: {
                    UrlHints: [
                        "./results/results.metaresults.json"
                    ]
                },
                Requirements: {
                    UrlHints: [
                        "./requirements/requirements.json"
                    ],
                    id: "",
                    vfLink: "",
                    text: ""
                },
                CyPhyProjectFileName: cyPhyProjectName || "None provided",
                LastModified: "2014-11-5"
            }
        };
    }

    function resultsMetaresultsJson() {
        return {
            Results: []
        };
    }

    function resultMetaresult( designID, testbenchName, timeStamp, summaryPath ) {
        return {
            "Design": null,
            "DesignID": '{' + designID + '}' || "{aaabbbccc111222333}",
            "TestBench": testbenchName + ".testbench.json" || "some testbench",
            "Time": timeStamp,
            "Summary": "./" + summaryPath + "/testbench_manifest.json" ||
                "random dir name / testbench manifest destiny"
        };
    }

    function testbenchJson( name ) {
        return {
            $id: "1",
            Name: name || "SinusInput",
            Metrics: [],
            Parameters: [],
            Requirements: []
        };
    }

    function testbenchMetric( name, value, unit, id ) {
        return {
            $id: id || Math.round( 1000 * Math.random() ),
            Requirement: null,
            Name: name || "DefaultName (dashboardTypes.js line 87)",
            Unit: unit || "Unitless",
            Value: value || null
        };
    }

    function testbenchParameter( name, value, unit, id ) {
        return {
            $id: id || Math.round( 1000 * Math.random() ),
            Name: name || "DefaultName (dashboardTypes.js line 87)",
            Unit: unit || "Unitless",
            Value: value || null
        };
    }

    function requirementsJson() {
        return {
            name: "Undefined",
            children: []
        };
    }

    function testbenchManifest( designID, designName, testbenchName ) {
        return {
            "Status": "OK",
            "CopyTestResults": false,
            "Parameters": [],
            "TierLevel": 0,
            "Artifacts": [],
            "VisualizationArtifacts": [],
            "DesignName": designName || "no design name provided",
            "LimitChecks": [],
            "Metrics": [],
            "DesignID": designID || "no id provided",
            "Dependencies": [],
            "Steps": [],
            "TestBench": testbenchName || "No name provided",
            "Created": "some time in the future"
        };
    }

    return {
        manifestProjectJson: manifestProjectJson,
        resultsMetaresultsJson: resultsMetaresultsJson,
        resultMetaresult: resultMetaresult,
        testbenchJson: testbenchJson,
        testbenchMetric: testbenchMetric,
        requirementsJson: requirementsJson,
        testbenchParameter: testbenchParameter
    };

} );