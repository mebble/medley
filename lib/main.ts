import { webApiCountdown } from "./core";

const start = performance.now()
webApiCountdown(120, e => {
    console.log([e.type, performance.now() - start])
})
