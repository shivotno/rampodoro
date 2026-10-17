const bell = new Audio("assets/notification_sound.mp3")
bell.volume = 0.25

const buttonClickSound = new Audio("assets/button_click.mp3")
buttonClickSound.volume = 0.5

const timer = document.getElementById("time-display")
const phaseLabel = document.getElementById("phase-label")
const button = document.getElementById("start-btn")
const prevBtn = document.getElementById("prev-btn")
const nextBtn = document.getElementById("next-btn")
const cycleDisplay = document.getElementById("zyklen")
const phaseCountDisplay = document.getElementById("phasen")

prevBtn.addEventListener("click", prevPhase)
nextBtn.addEventListener("click", nextPhase)

document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && !event.repeat) {
        event.preventDefault()
        button.classList.add("key-down")
        button.click()
    }
})

document.addEventListener("keyup", (event) => {
    if (event.code === "Space") {
        button.classList.remove("key-down")
    }
})

const MINUTE = 60 * 1000
const WARNING_TIME = 5*MINUTE

const timeArray = [
    {type: "work", duration: 5*MINUTE},
    {type: "work", duration: 10*MINUTE},
    {type: "work", duration: 15*MINUTE},
    {type: "work", duration: 20*MINUTE},
    {type: "break", duration: 10*MINUTE}
]

let phaseIndex = 0
let remainingTime = 0
let endTime = 0
let cycleCount = 0
let phaseCount = 0
let intervalID = null
let warningSent = false

showPhase()

function formatTime(ms){
    const sec = Math.ceil(Math.max(0, ms) / 1000)
    const min = Math.floor(sec / 60)
    const rest = sec % 60
    return `${String(min).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
}

function countdown(){
    button.addEventListener("click", () => {
        buttonClickSound.play()
        if(intervalID === null) {
            if(Notification.permission === "default") {Notification.requestPermission()}
            endTime = Date.now() + remainingTime
            button.textContent = "Pause"
            intervalID = setInterval(() => {
                const restTime = endTime - Date.now()
                if (restTime < WARNING_TIME && !warningSent && timeArray[phaseIndex].duration > WARNING_TIME && Notification.permission === "granted") {
                    new Notification("Rampodoro", {body: `Noch ${WARNING_TIME/MINUTE} Minuten übrig!`})
                    warningSent = true
                }
                timer.textContent = formatTime(restTime)
                if(restTime <= 0){
                    const finishedPhase = timeArray[phaseIndex]
                    bell.play()
                    nextPhase()

                    if(finishedPhase.type === 'work') {
                        phaseCount++
                        phaseCountDisplay.textContent = `Abgeschlossene Phasen: ${phaseCount}`

                        // Neue Phase ist die Pause 
                        if(timeArray[phaseIndex].type === 'break') {
                            cycleCount++
                            cycleDisplay.textContent = `Zyklen: ${cycleCount}`
                        }
                    }
                }
            }, 250);
        } else {
            button.textContent = "Start"
            remainingTime = endTime - Date.now()
            stopTimer()
        }
    })
}

function showPhase(){
    document.body.classList.toggle("break", timeArray[phaseIndex].type === 'break')
    warningSent = false
    button.textContent = "Start"
    remainingTime = timeArray[phaseIndex].duration
    timer.textContent = formatTime(remainingTime)
    if(timeArray[phaseIndex].type === 'work') {
        phaseLabel.textContent = `Focus - Block ${phaseIndex+1} / 4`
    } else {
        phaseLabel.textContent = "Pause"
    }
}

function stopTimer(){
    clearInterval(intervalID)
    intervalID = null
}

function nextPhase(){
    buttonClickSound.play()
    stopTimer()
    phaseIndex = (phaseIndex + 1) % timeArray.length
    showPhase()
}

function prevPhase(){
    buttonClickSound.play()
    stopTimer()
    phaseIndex = (phaseIndex - 1 + timeArray.length) % timeArray.length
    showPhase()
}

countdown()