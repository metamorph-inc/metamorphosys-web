'use strict';

module.exports = function(symbolManagerProvider, mmsUtils) {

    var generateSymbols;

    generateSymbols = function (count) {

        var i,
            portCount,
            makeARandomSymbol,
            makeSomePorts,
            minPorts = 6,
            maxPorts = 30,
            placements = ['top', 'right', 'bottom', 'left'];

        makeSomePorts = function (countOfPorts) {

            var sides,
                port,
                placement,
                j;

            sides = {
                top: [],
                right: [],
                bottom: [],
                left: []
            };

            for (j = 0; j < countOfPorts; j++) {

                port = {
                    id: 'p_' + j,
                    label: 'Port-' + j
                };

                placement = mmsUtils.getRandomElementFromArray(placements);

                sides[placement].push(port);
            }

            return sides;

        };

        makeARandomSymbol = function (idPostfix, countOfPorts) {

            var portDescriptors,
                descriptor;

            portDescriptors = makeSomePorts(countOfPorts);

            descriptor =  {
                cssClass: 'random_' + idPostfix,
                labelPrefix: 'RND_' + countOfPorts + '_' + idPostfix + ' '
            };

            symbolManagerProvider.makeBoxSymbol(
                'box',
                'random_' + idPostfix,
                descriptor,
                portDescriptors,
                {
                    justifyPorts: false
                }
            );

        };

        for (i = 0; i < count; i++) {

            portCount = Math.max(
                Math.floor(Math.random() * maxPorts),
                minPorts
            );

            makeARandomSymbol(i, portCount);

        }

    };



    this.generateSymbols = generateSymbols;

};
