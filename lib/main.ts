import { webApiCountdown } from "./core";
import { Unit, Sequence, Loop } from "./timer";

const u1 = new Unit('u1', 5, webApiCountdown)
const u2 = new Unit('u2', 2, webApiCountdown)
const u3 = new Unit('u3', 3, webApiCountdown)
const loop = new Loop(2, u3)
const u4 = new Unit('u4', 3, webApiCountdown)

const seq = new Sequence([u1, u2, loop, u4])

seq.start(e => {
    console.log(JSON.stringify(e))
})
