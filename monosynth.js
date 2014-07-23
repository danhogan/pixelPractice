$(function() { 
//**********

/* Copyright 2013 Chris Wilson

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var context=null;		// the Web Audio "context" object
var midiAccess=null;	// the MIDIAccess object.
var oscillator=null;	// the single oscillator
var envelope=null;		// the envelope for the single oscillator
var attack=0.05;			// attack speed
var release=0.05;		// release speed
var portamento=0.05;	// portamento/glide speed
var activeNotes = [];	// the stack of actively-pressed keys

var x = 0;
var y = 0;
var c = document.getElementById("mainCanvas");
var canvas = c.getContext('2d');
var d = document.getElementById("otherCanvas");
var danvas = d.getContext('2d');

var draw = function(x, y, color){
	canvas.fillStyle = color;
	canvas.fillRect(x,y,50,50);
}

var check = function(){
	if(x >= c.width){
		x = 0;
		y += 50;
	}
}

window.addEventListener('load', function() {
	// patch up prefixes
	window.AudioContext=window.AudioContext||window.webkitAudioContext;

	context = new AudioContext();
	if (navigator.requestMIDIAccess)
		navigator.requestMIDIAccess().then( onMIDIInit, onMIDIReject );
	else
		alert("No MIDI support present in your browser.  You're gonna have a bad time.")

	// set up the basic oscillator chain, muted to begin with.
	oscillator = context.createOscillator();
	oscillator.frequency.setValueAtTime(110, 0);
	envelope = context.createGain();
	oscillator.connect(envelope);
	envelope.connect(context.destination);
	envelope.gain.value = 0.0;  // Mute the sound
	oscillator.start(0);  // Go ahead and start up the oscillator
} );

function onMIDIInit(midi) {
	midiAccess = midi;

	var inputs=midiAccess.inputs();
	if (inputs.length === 0)
		alert("No MIDI input devices present.  You're gonna have a bad time.")
	else { // Hook the message handler for all MIDI inputs
		for (var i=0;i<inputs.length;i++)
			inputs[i].onmidimessage = MIDIMessageEventHandler;
	}
}

function onMIDIReject(err) {
	alert("The MIDI system failed to start.  You're gonna have a bad time.");
}

function MIDIMessageEventHandler(event) {
	// Mask off the lower nibble (MIDI channel, which we don't care about)
	switch (event.data[0] & 0xf0) {
		case 0x90:
			if (event.data[2]!=0) {  // if velocity != 0, this is a note-on message
				noteOn(event.data[1]);
				return;
			}
			// if velocity == 0, fall thru: it's a note-off.  MIDI's weird, ya'll.
		case 0x80:
			noteOff(event.data[1]);
			return;
	}
}

function frequencyFromNoteNumber( note ) {
	return 440 * Math.pow(2,(note-69)/12);
}

function noteOn(noteNumber) {
	activeNotes.push(noteNumber);
	oscillator.frequency.cancelScheduledValues(0);
	oscillator.frequency.setTargetAtTime( frequencyFromNoteNumber(noteNumber), 0, portamento );
	envelope.gain.cancelScheduledValues(0);
	envelope.gain.setTargetAtTime(1.0, 0, attack);

	console.log(noteNumber);

	if (noteNumber == 60) {
		console.log('blue note');
		draw(x, y, 'blue');
		x += 50;
		check();
	} else if (noteNumber == 62) {
		console.log('red note');
		draw(x, y, 'red');
		x += 50;
		check();
	}
}

function noteOff(noteNumber) {
	var position = activeNotes.indexOf(noteNumber);
	if (position!=-1) {
		activeNotes.splice(position,1);
	}
	if (activeNotes.length==0) {	// shut off the envelope
		envelope.gain.cancelScheduledValues(0);
		envelope.gain.setTargetAtTime(0.0, 0, release );
	} else {
		oscillator.frequency.cancelScheduledValues(0);
		oscillator.frequency.setTargetAtTime( frequencyFromNoteNumber(activeNotes[activeNotes.length-1]), 0, portamento );
	}
}

//**********
});