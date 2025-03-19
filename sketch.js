// Song visualizer using FFT
// Press F key to enter fullscreen mode
// Select from 4 preloaded songs using the dropdown menu
// If nothing is playing, select desired song and it will play thru once

// Profondo Rosso by Goblin has the most dynamic range, so looks the coolest overall imo
// Mystery's Apotheosis by Fabio Frizzi does cool stuff with the driving kick drum
// Up the Down Escalator by The Chameleons is the best show in terms of beat detection (drums fade in slowly after intro)
// Robert's Theme by Franco Micalizzi... I just wanted to share with people because it's amazing

// Each song will display a fav lyric (or reference for songs with no vocals) when treble is high
// Particles will only appear when a beat is detected
// Waveform ellipse in center gets larger when bass is high
// Spectrum below will flash when a beat is detected as well
// Background color cycles through a series of subdued, 70s-inspired tones


let song1, song2, song3, song4; // Song files to play in Line 29
let fft; // Line 63
let amplitude;  // Line 64
let smoothing = 0.8; // Line 63
let bins = 512; // Line 63
let hole = 7; // Color of waveform ellipse in Line 123
let dropdown; // Line 46
let lyric = ["THERE'S NO HOPE", "THERE MUST BE SOMETHING WRONG", "DEEP RED", "THE GATES OF HELL HAVE BEEN OPENED"];
let waveform = []; // Array for waveform circle
let particles = []; // Array for particles

function preload() {
  song4 = loadSound('Song4.mp3') // Mystery's Apotheosis
  song3 = loadSound('Song3.mp3'); // Profondo Rosso
  song2 = loadSound('Song2.mp3'); // Up the Down Escalator
  song1 = loadSound('Song.mp3'); // Robert's Theme
}


function setup() {
  createCanvas(displayWidth, displayHeight);
  angleMode(DEGREES);

  // Background color
  backgroundColor = color(0, 0, 0, 100);
  currentColor = backgroundColor;

  // Song Selection Menu
  dropdown = createSelect(); // Create a dropdown
    dropdown.position(20, 40);
    dropdown.style('background-color', 'black');
    dropdown.style('color', 'gray');
    dropdown.style('padding', '5px');
    dropdown.style('font-size', '20px');
    dropdown.style('border-radius', '30px');

    // Menu options
    dropdown.option('Roberts Theme'); // song1
    dropdown.option('Up the Down Escalator'); //song2
    dropdown.option('Profondo Rosso'); // song3
    dropdown.option('Mysterys Apotheosis'); // song4
  
    // Set the default selected option
    dropdown.selected('Roberts Theme'); // song1

fft = new p5.FFT(smoothing, bins);
amplitude = new p5.Amplitude();
}


function draw() {
  dropdown.changed(playSelectedSong);   // Call the selectSong function to change song that's playing when dropdown option is changed
  drawSound(); // Separate function for drawing visualizer shapes
}


function drawSound() {
  let spectrum = fft.analyze();
  let level = amplitude.getLevel();
  let wave = fft.waveform();

  // Spectrum color gradient
  let c1 = color(30);
  let c2 = color(163, 191, 19);
  n = map(y, 0, height, 0, 1);
  let newc = lerpColor(c1, c2, n); // Blends two colors to find a third color between them
  stroke(newc); // Gradient for Spectrum color

  // Spectrum left side
  push();
    beginShape();
    // Draw the spectrum
    for (var i = 0; i < spectrum.length; i++){
    var x = map(log(i), 0, log(spectrum.length), 0, width/2);
    var h = map(spectrum[i], 0, 255, 0, height/2);
    var rectangle_width = (log(i+1)-log(i))*(width/log(spectrum.length));
    rect(x, height, rectangle_width/3, -h, 0, 0, 90, 90) // the rects graduate in size, are super rounded, and spaced out to give the illusion of perspective
    }
    endShape();
  pop();

  // Spectrum mirrored on right side
  push();
    translate(width, 0);
    beginShape();
    scale(-1, 1);
    // Draw the spectrum
    for (var i = 0; i < spectrum.length; i++){
    var x = map(log(i), 0, log(spectrum.length), 0, width/2);
    var h = map(spectrum[i], 0, 255, 0, height/2);
    var rectangle_width = (log(i+1)-log(i))*(width/log(spectrum.length));
    rect(x, height, rectangle_width/3, -h, 0, 0, 90, 90) // the rects graduate in size, are super rounded, and spaced out to give the illusion of perspective
    }
    endShape();
  pop();

  waveform = fft.waveform();
  background(currentColor); // This is dictated by beat detection below
  noStroke();

  translate(width / 2, height / 2.5);

  // Draw waveform circle in center of screen
  for (var t = -1; t <= 1; t += 2) { // Mirror two curved waveforms into a circle shape
    beginShape(); // Draw a waveform in a semicircle
      fill(hole);
      for (var i = 0; i < 180.01; i += 3) {
      var index = floor(map(i, 0, width, 0, wave.length -1))
    
      var r = map(wave[index], -1, 1, 150, 350);

      var x = r * sin(i) * t;
      var y = r * cos(i);
      vertex(x, y); 
      }
    endShape();
  }

   // Make the waveform ellipse larger when bass is loud
   let low = fft.getEnergy("bass");
   if (low > 230) {
    // Draw larger waveform circle in center of screen
    for (let t = -1; t <= 1; t += 2) { // Mirror two curved waveforms into a circle shape
    beginShape(); // Draw a waveform in a semicircle
     fill(hole);
     for (let i = 0; i < 180.01; i += 3) {
       let index = floor(map(i, 0, width, 0, wave.length -1))
       let r = map(wave[index], -1, 1, 200, 400);
       let x = r * sin(i) * t;
       let y = r * cos(i);
     vertex(x, y); 
     }
    endShape();
   }
 }

// Beat detection
if (level > .1) { // Threshold for beat detection
let p = new Particle();
particles.push(p);
    for (let i = particles.length - 1; i >= 0; i--) {
      if (particles[i].finished()) {
        particles.splice(i, 1);
      } else {
        particles[i].update();
        particles[i].show();
      }
    //Use this to see level and adjust beat threshold
    // print(particles.length);
  } 
    // Display text specific to song if treble is high
  let high = fft.getEnergy("treble");
    // print(high);
    if (dropdown.value() == "Roberts Theme" && high > 125) {
      text(lyric[0], -50, 0);
    } else if (dropdown.value() == "Up the Down Escalator" && high > 145) {
      text(lyric[1], -118, 0);
    } else if (dropdown.value() == "Mysterys Apotheosis" && high > 87) {
      fill(103, 104, 107);
      text(lyric[3], -130, 0);
    } else if (dropdown.value() == "Profondo Rosso" && high > 87) {
      fill('red');
      text(lyric[2], -30, 0);
    }

    currentColor = color(50, random(32), random(13), 100);
 }
}

class Particle {
  constructor() {
    this.pos = p5.Vector.random2D().mult(250);
    this.vel = createVector(0, 0);
    this.acc = this.pos.copy().mult(random(0.0001, 0.00001));
    this.w = random(3, 5);
    this.lifetime = 255;
  }

  update() {
    this.vel.add(p5.Vector.random2D());
    this.pos.add(this.vel);
    this.lifetime -= 1;
  }

  show() {
    noStroke();
    fill(random(90), random(80), random(60), random(255));
    ellipse(this.pos.x, this.pos.y, 4);
  }

  finished() {
    return (this.lifetime < 0);
  }

  edges() {
     if (this.pos.y >= height-this.r) {
      this.pos.y = height-this.r;
      this.vel.y *= -1;
      }
      if (this.pos.x >= width-this.r) {
      this,this.pos.x = width-this.r;
      this.vel.x *= -1;
       } else if (this.pos.x <= this.r) {
      this.pos.x = this.r;
      this.vel.x *= -1;
      }
  }
}


// Function for dropdown menu song selection
function playSelectedSong() {
    let songName = dropdown.value();
    currentColor = color(50, random(30), random(15), 100);
    if (songName == "Mysterys Apotheosis") {
      if (song1.isPlaying()) song1.stop();
      if (song2.isPlaying()) song2.stop();
      if (song3.isPlaying()) song3.stop();
      song4.play();
    } else if (songName == "Profondo Rosso") {
      if (song4.isPlaying()) song4.stop();
      if (song2.isPlaying()) song2.stop();
      if (song1.isPlaying()) song1.stop();
      song3.play();
    } else if (songName == "Up the Down Escalator") {
      if (song4.isPlaying()) song4.stop();
      if (song3.isPlaying()) song3.stop();
      if (song1.isPlaying()) song1.stop();
      song2.play();
    } else if (songName == "Roberts Theme") {
      if (song4.isPlaying()) song4.stop();
      if (song3.isPlaying()) song3.stop();
      if (song2.isPlaying()) song2.stop();
      song1.play();
    }
}


// Fullscreen option
function keyPressed() {
  if (key === 'f') {
    fullscreen(true);
    }
  }