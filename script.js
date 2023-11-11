let stacks = [[], [5, 4, 3, 2, 1], []];
let ringcolor = ["#ff00ff", "#ff0000", "#ff8000", "#ffff00", "#00ff00", "#00ffff"];
let dragfrom;
let dragring;
let mousex;
let mousey;
let c = 4;
let W = 2;
let scount = 0;
let nsstep = false;
let sspeed = 100;
let pt = 0;
let sfor = 0;

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
    } else if (["1", "2", "3"].includes(e.key)) {
      sfor = parseInt(e.key)-1;
      nsstep = solve2(sfor);
      return;
    } else if (e.key == "s") {
      nsstep = false;
      return;
    } else if (e.key == "ArrowRight") {
      sspeed = Math.max(sspeed-20, -20);
      return;
    } else if (e.key == "ArrowLeft") {
      sspeed = Math.min(sspeed+20, 500);
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
  if (dragring || nsstep) {
    return;
  }
  stack = mousestack();
  stackl = stacks[stack].length;
  dragfrom = stack;
  dragring = stacks[stack][stackl - 1];
  stacks[stack].pop();
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
  if (scount <= 0 && nsstep) {
    scount = sspeed;
    preform(nsstep);
    save();
    nsstep = solve2(sfor);
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
  if (n == 1) {
    return [[s, d]];
  }
  return solve(s, o, d, n - 1).concat(solve(s, d, 0, 1)).concat(solve(o, d, s, n - 1));
}

function findstack(r) {
  for (let i = 0; i < 3; i++) {
    if (stacks[i].includes(r)) {
      return i;
    }
  }
}

function opposite(a, b) {
  return 3-(a+b);
}

function nextring(dest) {
  for (let r = c+1; r > 0; r --) {
    if (!(stacks[dest].includes(r))) {
      return r;
    }
  }
  return false;
}

function findobstacle(r, rs, dest) {
  let obs = 0;
  for (i = 0; i < stacks[dest].length; i++) {
    if (stacks[dest][i] < r) {
      obs = stacks[dest][i];
      break;
    }
  }
  for (let i = 0; i < stacks[rs].length; i++) {
    if (stacks[rs][i] < r) {
      obs = Math.max(obs, stacks[rs][i]);
      break;
    }
  }
  if (obs == 0) {
    return false;
  }
  return obs;
}

function solve2(dest) {
  let nr = nextring(dest);
  let nrs = findstack(nr);
  if (!nr) {
    return false;
  }
  let obs = findobstacle(nr, nrs, dest);
  while (obs) {
    dest = opposite(nrs, dest);
    nr = obs;
    nrs = findstack(nr);
    obs = findobstacle(nr, nrs, dest);
  }
  return [nrs, dest];
}
