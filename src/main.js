var ctx = document.getElementById("ctx").getContext("2d");
var catcherOne = new Image();
var catcherTwo = new Image();
var catcherThree = new Image();
var catcherFour = new Image();
var background = new Image();
var blood = new Image();
var tile = new Image();
var food = new Image();
var fruit = new Image();
var score = 0;
var level = 100;
var animation = 0;
var foodTimer = 0;
var fruitTimer = 0;
var gameover = false;
var intervalVar;
var paused;
var foodList = [];
var tileList = [];
var fruitList = [];
var foodDrop = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450];

var tileObject = {
  height: 20,
  width: 50
};

var catcher = {
  x: 100,
  y: 350,
  width: 30,
  height: 50,
  jump: 0,
  onair: false,
  jumpUnit: 5,
  spd: 0,
  leftPressed: false,
  rightPressed: false,
  gravity: 10,
  safe: true
};

var foodObject = {
  height: 50,
  width: 50,
  spd: 3
};

var fruitObject = {
  height: 40,
  width: 40,
  spd: 3
};

sound = function(src) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  document.body.appendChild(this.sound);
  this.play = function() {
    this.sound.play();
  };
  this.stop = function() {
    this.sound.pause();
  };
};

var eatingSound = new sound("./src/sound/eat.mp3");
var droppingSound = new sound("./src/sound/drop.mp3");

background.onload = function() {
  blood.onload = function() {
    catcherOne.onload = function() {
      catcherTwo.onload = function() {
        catcherThree.onload = function() {
          catcherFour.onload = function() {
            food.onload = function() {
              tile.onload = function() {
                fruit.onload = function() {
                  ctx.drawImage(background, 0, 0, 500, 500);
                  ctx.font = "bolder 30px Calibri";
                  ctx.fillStyle = "blue";
                  ctx.fillText("Falling star game", 140, 200);
                  ctx.fillText("Click here to start the game", 80, 250);

                  drawObject = function(object, x, y, width, height) {
                    ctx.drawImage(object, x, y, width, height);
                  };

                  document.getElementById("ctx").onmousedown = function() {
                    if (!gameover) {
                      clearInterval(intervalVar);
                    }
                    startGame();
                  };

                  document.onkeydown = function(event) {
                    if (event.keyCode == 37 && catcher.x > 0) {
                      catcher.spd = -5;
                      catcher.leftPressed = true;
                    }
                    if (
                      event.keyCode == 39 &&
                      catcher.x < 500 - catcher.width
                    ) {
                      catcher.spd = 5;
                      catcher.rightPressed = true;
                    }
                    if (
                      event.keyCode == 38 &&
                      !catcher.onair &&
                      catcher.y == 350
                    ) {
                      if (!catcher.onair) {
                        catcher.jump = 100;
                        catcher.onair = true;
                      }
                    }
                    if (event.keyCode == 32) {
                      if (paused) paused = false;
                      else paused = true;
                    }
                  };

                  document.onkeyup = function(event) {
                    if (event.keyCode == 37) {
                      catcher.leftPressed = false;
                    }
                    if (event.keyCode == 39) {
                      catcher.rightPressed = false;
                    }
                  };

                  food_catcher_collision = function(f) {
                    return (
                      f.x < catcher.x + catcher.width &&
                      catcher.x < f.x + foodObject.width &&
                      f.y < catcher.y + catcher.height &&
                      catcher.y < f.y + foodObject.height
                    );
                  };

                  food_tile_collision = function(f, t) {
                    return (
                      f.x < t.x + tileObject.width &&
                      t.x < f.x + foodObject.width &&
                      f.y < t.y + tileObject.height &&
                      t.y < f.y + foodObject.height
                    );
                  };

                  fruit_catcher_collision = function(f) {
                    return (
                      f.x < catcher.x + catcher.width &&
                      catcher.x < f.x + fruitObject.width &&
                      f.y < catcher.y + catcher.height &&
                      catcher.y < f.y + fruitObject.height
                    );
                  };

                  catcher_tile_collision = function(t) {
                    return (
                      catcher.x <= t.x + tileObject.width &&
                      t.x <= catcher.x + catcher.width &&
                      catcher.y + catcher.height <= t.y
                    );
                  };

                  jump = function() {
                    if (catcher.jump > 0 && catcher.onair) {
                      catcher.y -= catcher.jumpUnit;
                      catcher.jump -= catcher.jumpUnit;
                    }
                    if (
                      catcher.jump <= 0 &&
                      catcher.jump > -100 &&
                      catcher.onair
                    ) {
                      catcher.y += catcher.jumpUnit;
                      catcher.jump -= catcher.jumpUnit;
                    }
                    if (catcher.jump <= -100 && catcher.onair) {
                      catcher.onair = false;
                    }
                  };

                  updateFoodPosition = function() {
                    for (var i in foodList) {
                      if (foodList[i].y > 500) {
                        foodList.splice(i, 1);
                      } else {
                        foodList[i].y += foodObject.spd;
                      }
                    }
                  };

                  updateFruitPosition = function() {
                    for (var i in fruitList) {
                      if (fruitList[i].y > 500) {
                        fruitList.splice(i, 1);
                      } else {
                        fruitList[i].y += fruitObject.spd;
                      }
                    }
                  };

                  updateCatcherPosition = function() {
                    if (catcher.leftPressed && catcher.x > 0) {
                      catcher.x += catcher.spd;
                    }
                    if (
                      catcher.rightPressed &&
                      catcher.x < 500 - catcher.width
                    ) {
                      catcher.x += catcher.spd;
                    }
                    if (catcher.y > 450) {
                      gameover = true;
                      catcher.y = 450;
                      droppingSound.play();
                    }
                  };

                  gameOver = function() {
                    ctx.save();
                    ctx.globalAlpha = 0.6;
                    drawObject(blood, 100, 100, 300, 300);
                    ctx.globalAlpha = 1.0;
                    ctx.fillStyle = "blue";
                    ctx.font = "bolder 30px Calibri";
                    ctx.fillText("Thank you", 180, 250);
                    ctx.fillText("Click to restart", 160, 300);
                    ctx.restore();
                    clearInterval(intervalVar);
                  };

                  updatePosition = function() {
                    if (!paused) {
                      ctx.clearRect(0, 0, 500, 500);
                      ctx.drawImage(background, 0, 0, 500, 500);
                      foodTimer++;
                      fruitTimer++;

                      if (foodTimer > level) {
                        foodList.push({
                          x: foodDrop[Math.round(Math.random() * 9)],
                          y: 0
                        });
                        foodTimer = 0;
                      }

                      if (fruitTimer > 3 * level) {
                        fruitList.push({
                          x: foodDrop[Math.round(Math.random() * 9)],
                          y: -25
                        });
                        fruitTimer = 0;
                      }

                      for (var i in fruitList) {
                        if (fruit_catcher_collision(fruitList[i])) {
                          droppingSound.play();
                          gameover = true;
                        }
                      }

                      if (gameover) {
                        if (catcher.y >= 450)
                          drawObject(
                            catcherThree,
                            catcher.x,
                            catcher.y + 20,
                            50,
                            30
                          );
                        else
                          drawObject(catcherOne, catcher.x, catcher.y, 30, 50);
                        gameOver();
                      } else if (catcher.onair) {
                        drawObject(
                          catcherFour,
                          catcher.x,
                          catcher.y,
                          catcher.width,
                          catcher.height
                        );
                      } else if (animation == 0) {
                        drawObject(
                          catcherOne,
                          catcher.x,
                          catcher.y,
                          catcher.width,
                          catcher.height
                        );
                        animation = 1;
                      } else if (animation == 1) {
                        drawObject(
                          catcherTwo,
                          catcher.x,
                          catcher.y,
                          catcher.width,
                          catcher.height
                        );
                        animation = 0;
                      }

                      for (var i in foodList) {
                        drawObject(
                          food,
                          foodList[i].x,
                          foodList[i].y,
                          foodObject.width,
                          foodObject.height
                        );
                      }

                      for (var i = 0; i < tileList.length; i++) {
                        drawObject(
                          tile,
                          tileList[i].x,
                          tileList[i].y,
                          tileObject.width,
                          tileObject.height
                        );
                      }

                      for (var i in fruitList) {
                        drawObject(
                          fruit,
                          fruitList[i].x,
                          fruitList[i].y,
                          fruitObject.width,
                          fruitObject.height
                        );
                      }

                      for (var i in foodList) {
                        if (food_catcher_collision(foodList[i])) {
                          score++;
                          eatingSound.play();
                          if (score % 2 == 0) level--;
                          foodList.splice(i, 1);
                        }
                      }
                      for (var i in foodList) {
                        for (var j in tileList) {
                          if (food_tile_collision(foodList[i], tileList[j])) {
                            tileList.splice(j, 1);
                          }
                        }
                      }

                      if (!catcher.onair) {
                        for (var i in tileList) {
                          if (catcher_tile_collision(tileList[i])) {
                            catcher.safe = true;
                            break;
                          }
                          catcher.safe = false;
                        }
                        if (!catcher.safe) {
                          catcher.y += catcher.gravity;
                        }
                      }

                      drawObject(food, 440, 10, 20, 20);
                      ctx.fillStyle = "blue";
                      ctx.font = "bolder 20px Calibri";
                      ctx.fillText(score, 465, 27);
                      ctx.fillText("Level " + (100 - level + 1), 10, 27);
                      updateFruitPosition();
                      updateFoodPosition();
                      updateCatcherPosition();
                      jump();
                    } else {
                      ctx.save();
                      ctx.strokeStyle = "blue";
                      ctx.font = "30px Calibri";
                      ctx.strokeText("Game Paused", 165, 250);
                      ctx.restore();
                    }
                  };

                  startGame = function() {
                    score = 0;
                    level = 100;
                    catcher.y = 350;
                    catcher.x = 100;
                    catcher.onair = false;
                    catcher.leftPressed = false;
                    catcher.rightPressed = false;
                    catcher.safe = true;
                    animation = 0;
                    foodTimer = 0;
                    paused = false;
                    gameover = false;
                    tileList = [];
                    foodList = [];
                    fruitList = [];

                    for (var i = 0; i <= 9; i++) {
                      tileList.push({ x: i * 50, y: 400 });
                    }

                    intervalVar = setInterval(updatePosition, 10);
                  };
                };
                fruit.src = "./src/images/poison.png";
              };
              tile.src = "./src/images/tile.png";
            };
            food.src = "./src/images/star.png";
          };
          catcherFour.src = "./src/images/catcher4.png";
        };
        catcherThree.src = "./src/images/catcher3.png";
      };
      catcherTwo.src = "./src/images/catcher2.png";
    };
    catcherOne.src = "./src/images/catcher1.png";
  };
  blood.src = "./src/images/gameOver.png";
};
background.src = "./src/images/starBackground.jpg";
