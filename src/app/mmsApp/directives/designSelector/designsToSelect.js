module.exports = [
    {

        id: 'featured-designs',
        label: 'Featured',
        designs: [

            {
                id: '/1922727130/1620862711/536930709',
                name: 'Bluetooth System',
                description: "This model is a template that can be used to make a fully functional Bluetooth device. Just add your desired subcircuit(s) to the model and hook it up to the provided ports to allow for the sending and receiving of sensor data using Cypress' PSoC\xAE 4 BLE technology after connecting it to a BLE motherboard.",
                visual: 'images/bluetooth_icon300x300.png'
            },
            {
                id: '/1922727130/1620862711/1676796655',
                name: 'Arduino DUE Shield Basic',
                description: "This model represents a limited-featured Arduino shield, which connects to your Arduino to extend its capabilities.  Simply add your subcircuit(s) and hook it up to the shield's exposed ports. It is a great starting point for less experienced Arduino users as it hides some of the more advanced connectors. The shield is a separate component that pairs well with an Arduino DUE.",
                visual: 'images/arduino_due_shield.png'
            },
            {
                id: '/1922727130/1620862711/529144610',
                name: 'Arduino DUE Shield Advanced',
                description: 'This design extends the Arduino Shield Basic project by exposing the full functionality of the Arduino to allow you to hook up more complex systems. The template adds a 5-HID connector, as well as 5V Power/Ground, IOREF, AREF, and Vin pins. It is intended for more experienced users. Similar to the basic project, this shield is a separate component from an Arduino.',
                visual: 'images/arduino_due_shield.png'
            }

        ]

    },

    {

        id: 'experimental',
        label: 'Experimental projects',
        designs: [

            {
                id: '/1922727130/1620862711/1365227561',
                name: '1x2 Ara Template Module',
                isExperimental: true,
                description: 'This model is in the ARA 1x2 form factor. All of the boilerplate needed to link your module to the Endo is provided. Simply hook your customizations up to the provided protocol ports and power lines.',
                visual: 'images/ara-design.png'
            },
            {
                id: '/1922727130/1620862711/260488260',
                name: 'EKG USB Device',
                isExperimental: true,
                description: 'This USB device is designed to be used for electrocardiograms (EKG). Electrodes plug into the device, and a computer or mobile device connects via the USB port.',
                visual: 'images/heart-rate-monitor.png'
            }

        ]

    }

];
