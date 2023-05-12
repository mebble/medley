import { MedleyConfig, startTimer } from "../lib";

const config: MedleyConfig = {
    name: 'Shoulder stretches',
    timer: {
        type: 'sequence',
        of: [{
            type: 'loop',
            times: 2,
            of: {
                type: 'sequence',
                of: [
                    { type: 'unit', name: 'Left shoulder', duration: 30 },
                    { type: 'unit', name: 'Rest', duration: 10 },
                    { type: 'unit', name: 'Right shoulder', duration: 30 },
                    { type: 'unit', name: 'Rest', duration: 10 },
                ]
            }
        }, {
            type: 'unit',
            name: 'Rest',
            duration: 30
        }]
    }
};

startTimer(config, event => {
    console.log(JSON.stringify(event, null, 2))
})
