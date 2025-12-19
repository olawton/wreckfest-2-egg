const { spawn, exec } = require('child_process')
const util = require('util')
const execAsync = util.promisify(exec)

const windowTitle = '^Wreckfest 2' // xdotool window search query
const pelicanLogPath = '/tmp/console_commands.log'

// set the id of the Wreckfest 2 console window
let windowId
async function setWindowId() {
	const { stdout } = await execAsync(`xdotool search --name "${windowTitle}" | head -n 1`)
	windowId = stdout.trim()
}

// keep a queue of commands to be sent to the window so two cannot be typed at the same time
const commandQueue = []
let isProcessing = false
async function processQueue() {
	if (isProcessing) { return }
	isProcessing = true
	while (commandQueue.length > 0) {
		let input = commandQueue.shift()
		await inputCommand(input)
	}
	isProcessing = false
}

// send a command to the queue
function sendCommand(input) {
	if (typeof input !== 'string') {
		try {
			input.toString()
		} catch (error) {
			console.log('[index.js] Could not convert command input to string')
		}
	}
	commandQueue.push(input.trim())
	processQueue()
}

// type text to the Wreckfest 2 console
async function inputCommand(input) {
	if (windowId) {
		// focus the console window, wait 0.2s, type input, hit Return key
		const xdotoolCommand = `xdotool windowfocus ${windowId} && sleep 0.2 && xdotool type --window ${windowId} "${input}" && xdotool key --window ${windowId} Return`
		try {
			await execAsync(xdotoolCommand)
			console.log(`[index.js] Sent "${input}" to window`)
		} catch (error) {
			console.log(`[index.js] Error sending command to window ${windowId}:`, error)
		}
	} else {
		console.log(`[index.js] Error sending command to window: windowId is not set.`)
	}
}

// tail a log of commands sent in the Pelican console and send them to the Wreckfest 2 console
function startInputTail() {
	const inputTail = spawn('tail', ['-F', pelicanLogPath])	
	inputTail.stdout.on('data', async (data) => {
		let lines = data.toString().split('\n')
		for (let line of lines) {
			line.trim()
			if (line == '') { return }
			
			sendCommand(line)
		}
	})
	inputTail.stderr.on('data', (data) => { console.log('[index.js] Pelican log tail error:', data) })
	inputTail.on('close', (code) => { console.log('[index.js] Pelican log tail exited with code', code) })
}

// check window id every second until its valid and then start the pelican log
async function initialize() {
	await setWindowId()
	while (!windowId) {
		await new Promise(resolve => setTimeout(resolve, 1000))
		await setWindowId()
	}
	startInputTail()
}
initialize()