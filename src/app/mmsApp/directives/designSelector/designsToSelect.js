module.exports = [
    {

        id: 'featured-designs',
        label: 'Featured',
        designs: [

            {
                name: 'Bluetooth System',
                description: 'Missing description. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
                visual: 'http://placehold.it/200x200'
            },
            {
                name: 'Arduino DUE Shield Basic',
                description: 'Missing description. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
                visual: 'http://placehold.it/200x200'
            },
            {
                name: 'Arduino DUE Shield Advanced',
                description: 'Missing description. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.',
                visual: 'http://placehold.it/200x200'
            }

        ]

    },

    {

        id: 'experimental',
        label: 'Experimental projects',
        designs: [

            {
                name: 'Template Module 1x2',
                isExperimental: true,
                description: 'This model is in the ARA 1x2 form factor. All of the boilerplate needed to link your module to the Endo is provided. Simply hook your customizations up to the provided protocol ports and power lines.',
                visual: 'images/ara-design.png'
            },
            {
                name: 'EKG USB Device',
                isExperimental: true,
                description: 'This USB device is designed to be used for electrocardiograms (EKG). Electrodes plug into the device, and a computer or mobile device connects via the USB port.',
                visual: 'images/heart-rate-monitor.png'
            }

        ]

    }

];
