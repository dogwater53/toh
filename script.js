let canvas, ctx;
let stacks = [[], [5, 4, 3, 2, 1], []];
let ringcolor = ["#ff00ff", "#ff0000", "#ff8000", "#ffff00", "#00ff00", "#00ffff"];
let dragfrom;
let dragring;
let mousex;
let mousey;
let c = 5;
let W = 2;
let scount = 0;
let ssteps = [];
let sspeed = 0;
let pt = 0;
let rset = false;

window.onload = () => {
  load();
  canvas = document.getElementById("gameWindow");
  ctx = canvas.getContext("2d");
  canvas.addEventListener("mousemove", (e) => {
    mousex = e.clientX;
    mousey = e.clientY;
  });
  canvas.addEventListener("keydown", (e) => {
    if (e.key == "ArrowUp") {
      if (c == 9) {
        return;
      }
      c += 1;
    } else if (e.key == "ArrowDown") {
      if (c == 0) {
        return;
      }
      c -= 1;
    } else if (e.key == "s") {
      if (!rset) {
        return;
      }
      ssteps = solve(1, 2, 0, c + 1);
      sspeed = 5000/ssteps.length;
      return;
    } else if (e.key != "r") {
      return;
    }
    dragring = false;
    stacks = [[], [], []];
    for (let i = c + 1; i > 0; i--) {
      stacks[1].push(i);
    }
    localStorage.setItem("c", JSON.stringify(c));
    save();
    rset = true;
  });
  canvas.addEventListener("mousedown", mousedown);
  canvas.addEventListener("mouseup", mouseup);
  window.requestAnimationFrame(gameLoop);
}

function mousestack() {
  if (mousex < canvas.width * 3 / 8) {
    return 0;
  } else {
    return (mousex < canvas.width * 5 / 8) ? 1 : 2;
  }
}

function load() {
  s = localStorage.getItem("stacks");
  if (s) {
    stacks = JSON.parse(s);
  }
  cc = localStorage.getItem("c");
  if (cc) {
    c = JSON.parse(cc);
  }
}

function save() {
  localStorage.setItem("stacks", JSON.stringify(stacks));
}

function mousedown() {
  if (dragring || ssteps.length != 0) {
    return;
  }
  stack = mousestack();
  stackl = stacks[stack].length;
  dragfrom = stack;
  dragring = stacks[stack][stackl - 1];
  stacks[stack].pop();
  rset = false;
}

function mouseup() {
  if (!dragring) {
    return;
  }
  stack = mousestack();
  stackl = stacks[stack].length;
  if (stacks[stack][stackl - 1] < dragring) {
    stacks[dragfrom].push(dragring);
  } else {
    stacks[stack].push
      (dragring);
  }
  dragring = false;
  save();

}

function drawPegs() {
  ctx.strokeStyle = "#ffffff";
  ctx.lineCap = "square";
  for (let x = 0.25; x < 1; x += 0.25) {
    ctx.beginPath();
    ctx.moveTo(x * canvas.width, canvas.height / 2 + (ctx.lineWidth * c / 2));
    ctx.lineTo(x * canvas.width, canvas.height / 2 - (ctx.lineWidth * c / 2));
    ctx.stroke();
    ctx.closePath();
  }
}

function drawRings() {
  let x = 0.25;
  ctx.lineCap = "round";
  stacks.forEach((stack) => {
    let y = canvas.height / 2 + (ctx.lineWidth * c / 2);
    // let y = canvas.height;
    stack.forEach((ring) => {
      rsize = (c + 1) / 2;
      ctx.strokeStyle = ringcolor[ring % 6];
      ctx.beginPath();
      ctx.moveTo(x * canvas.width - ctx.lineWidth * (ring / rsize + 0.5), y);
      ctx.lineTo(x * canvas.width + ctx.lineWidth * (ring / rsize + 0.5), y);
      ctx.stroke();
      ctx.closePath();
      y -= ctx.lineWidth;
    });
    x += 0.25;
  });
  if (dragring) {
    ctx.strokeStyle = ringcolor[dragring % 6];
    ctx.beginPath();
    ctx.moveTo(mousex - ctx.lineWidth * (dragring / rsize + 0.5), mousey);
    ctx.lineTo(mousex + ctx.lineWidth * (dragring / rsize + 0.5), mousey);
    ctx.stroke();
    ctx.closePath();
  }
}

function preform(move) {
  stacks[move[1]].push(stacks[move[0]].pop());
}

function gameLoop(ts) {
  if (scount <= 0 && ssteps.length != 0) {
    scount = sspeed;
    preform(ssteps[0]);
    ssteps.shift();
  }
  scount -= (ts - pt);
  pt = ts;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.lineWidth = canvas.width / 25;
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawPegs();
  drawRings();
  window.requestAnimationFrame(gameLoop);
}

function solve(s, d, o, n) {
  console.log(s, o, d, n);
  if (n == 1) {
    return [[s, d]];
  }
  return solve(s, o, d, n - 1).concat(solve(s, d, 0, 1)).concat(solve(o, d, s, n - 1));
}