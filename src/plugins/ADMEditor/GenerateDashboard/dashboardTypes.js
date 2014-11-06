/**
 * Created by J on 11/6/2014.
 */

define([], function () {
    'use strict';

    function manifestProjectJson(cyPhyProjectName) {
        return {
            Project: {
                Components: [ ],
                DesignSpaceModels: [
                    "./design-space/Wheel.adm"
                ],
                Configurations: [
                    "./designs/Wheel_cfg1.adm",
                    "./designs/Wheel_cfg4.adm"
                ],
                TestBenches: [
                    "./test-benches/SinusInput.testbench.json",
                    "./test-benches/SinusInput2.testbench.json"
                ],
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
                CyPhyProjectFileName: "RollingWheel.mga",
                LastModified: "2014-10-31 11-43-25"
            }
        };
    }

    function resultsMetaresultsJson() {
        return {
            Results: []
        };
    }

    function resultMetaresult(designID, testbench, summaryPath) {
        return {
            "Design": null,
            "DesignID": designID || "{6a122855-da30-47d0-83a4-fe97607074f1}",
            "TestBench": testbench || "SinusInput2.testbench.json",
            "Time": "2014-10-31 11-43-25",
            "Summary": summaryPath || "./ftflkky0/testbench_manifest.json"
        };
    }

    function testbenchJson(name) {
        return {
            $id: "1",
            Name: name || "SinusInput",
            Metrics: [
                {
                    $id: "2",
                    Requirement: null,
                    Name: "MaxSpeed",
                    Unit: "",
                    Value: null
                }
            ],
            Parameters: [
                {
                    $id: "3",
                    Name: "WheelMass",
                    Unit: "Kilogram",
                    Value: "2"
                }
            ],
            Requirements: [ ]
        };
    }

    function requirementsJson() {
        return {
            name: "Undefined",
            children: [ ]
        };
    }

    function testbenchManifest(designID, designName, testbenchName) {
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

//    function testbenchMetric(name, id, value) {
//        return {
//            "GMEID": "id-0067-00000665",
//            "Description": "",
//            "DisplayedName": null,
//            "VisualizationArtifacts": [
//                "plots/MaxSpeed.svg"
//            ],
//            "Value": value || "1.58532802606",
//            "ID": id || "73184523-e4eb-4fa7-9298-3a964b94e212",
//            "Unit": "m/s",
//            "Name": name || "MaxSpeed"
//        };
//    }
//
//    function testbenchParameter(name, id, value) {
//        return {
//            "Description": "",
//            "DisplayedName": null,
//            "GMEID": "id-0067-00000663",
//            "Value": value || "2",
//            "Range": "-inf..inf",
//            "ID": id || "9c22ff16-a786-48b7-a759-20200494c8d3",
//            "Unit": "Kilogram",
//            "Name": name || "WheelMass"
//        };
//    }
//
//    function testbenchSteps() {
//        return {
//            "ExecutionCompletionTimestamp": null,
//            "Description": null,
//            "Parameters": [],
//            "ExecutionStartTimestamp": null,
//            "Invocation": "simulate_om.cmd OpenModelica__latest_",
//            "PostProcess": null,
//            "PreProcess": null,
//            "Type": null
//        };
//    }

return {
    manifestProjectJson: manifestProjectJson,
    resultsMetaresultsJson: resultsMetaresultsJson
};

});