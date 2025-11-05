console.clear();

var Game = function () {

  var ui = document.getElementById('ui'),
      sea = document.getElementById('sea'),
      ctx = sea.getContext('2d'),
      boxes = [], welcome, menu, extras, highscores, help, tuto, over, win,
      thefish,
      width = 100, rw,
      height = 75, rh,
      status = 'start',
      units = [], fishes = [], shoal = [], enemies = [], powers = [], reverses = [],
      reversed = false,
      bubbles = [], splash = [],
      timeouts = [],
      resizefont = [],
      lastClick = 0,
      fishPixels = '0000000005500000000000000000055235555000000000000000553333350000000000000005255555500000000000005551111455000000000055111224444450000555054122233345555500052354222333344111115000533333333334115115150052333333344411511515000533223444441151151555505223444334411111505115544444333344444225521144443322222223332505113233322222222255500051233322222222222250052225332221111223350052255055521111115550000550000005555555000000000000000523335000000000000000052555000000000000000055500000000000';

  var game = {
    start: function () {
      build.welcome();
      build.menu();
      build.extras();
      build.highscores();
      build.help();
      build.tuto();
      build.over();
      build.win();
      build.bubbles();
      build.audio();
      build.scores();
      window.addEventListener('resize', game.resize);
      document.addEventListener('touchmove', game.noScroll);
      sea.addEventListener('click', click);
      sea.addEventListener('touchstart', click);
      delay(0, game.resize);
      delay(0.5, game.intro);
    },
    intro: function () {
      requestAnimationFrame(draw.frame);
      welcome.show();
      delay(1, function () {
        welcome.down();
        menu.show();
      });
    },
    resize: function () {
      clearTimeout(game.resizeT);
      addClass(ui, 'resize');
      game.resizeT = setTimeout(function () {
        sea.width = ui.clientWidth;
        sea.height = ui.clientHeight;
        rw = sea.width / width;
        rh = sea.height / height;
        each(resizefont, function () {
          this.el.style['font-size'] = sea.width/40 + 'px';
        });
        delClass(ui, 'resize');
        scrollTo(0,1);
      }, 420);
    },
    flash: function () {
      if (!game.bright) {
        game.bright = 1;
        delay(0.3, function () {
          game.bright = 0;
        });
      }
    },
    clear: function () {
      if (reversed) {
        each(bubbles, function (b) {
          b.s *= -1;
        });
      }
      reversed = false;
      delClass(ui, 'dead');
      delClass(ui, 'breath');
      game.bright = 0;
      breath.reset();
      thefish = null;
      each(timeouts, function (t) {
        clearTimeout(t);
      });
      timeouts = [];
      units = [];
      enemies = [];
      powers = [];
      reverses = [];
      shoal = [];
      fishes = [];
    },
    over: function () {
      score.el.textContent = '';
      breath.el.textContent = '';
      over.score.innerHTML = 'Score: '+ score.val+'<br>'+shoal.length+'/'+level.lvls[level.current].score;
      breath.silence();
      audio.play('game', B, 100);
      status = 'over';
      addClass(ui, 'dead');
      over.show();
    },
    win: function () {
      status = 'win';
      score.stop();
      score.el.textContent = '';
      breath.el.textContent = '';
      breath.silence();
      audio.play('game', E, 100);
      win.empty();
      thefish.sx = false; thefish.sy = false;
      each(fishes, function () {
        this.move(thefish.x, thefish.y);
      });
      each(enemies, function () {
        this.rotate = 0;
        this.sx = false; this.sy = false;
      });
      if (level.current < level.lvls.length - 1) {
      //if (level.current < 1) {
        win.text([
          '<h1>Level '+ (level.current + 1)+'</h1>',
          '<h2>You did it!</h2>',
          '<p>Score: '+score.val+'</p>',
          '<p>Time: '+score.time.toFixed(2)+' sec</p>'
        ]);
        win.button('Next Level', function () {
          level.current++;
          win.up();
          if (level.current < 2) {
            tuto.update();
            tuto.show();
          } else {
            delay(0.5, level.build);
          }
        });
      } else {
        game.end();
      }
      win.show();
    },
    end: function () {
      win.text([
        '<h2>You Win!</h2>',
        '<p>Final Score: '+score.total+'</p>',
        '<p>Total Time: '+score.totaltime.toFixed(2)+' sec</p>',
        '<p>Enter your name:</p>'
      ]);
      win.player = document.createElement('input');
      var saved = localStorage.getItem('kfish name');
      if (saved) {
        win.player.value = saved;
      }
      win.player.type = 'text';
      win.player.maxLength = 8;
      win.el.appendChild(win.player);
      win.button('Save', function () {
        var name = win.player.value;
        if (!name) {
          name = 'Player1';
        } else {
          localStorage.setItem('kfish name', name);
        }
        score.highscore(name, score.total, score.totaltime);
        win.up();
        highscores.show();
        game.reset();
        game.resize();
      });
    },
    reset: function () {
      level.current = 0;
      delClass(ui, 'dead');
      status = 'start';
      score.total = 0;
      score.totaltime = 0;
      if (reversed) {
        each(bubbles, function (b) {
          b.s *= -1;
        });
      }
    },
    noScroll: function(event) {
      event.preventDefault();
    }
  };

  var build = {
    welcome: function () {
      welcome = new Box('welcome');
      addClass(welcome.el, 'up');
      welcome.text('<h1>kfish</h1>');
    },
    menu: function () {
      menu = new Box('menu');
      addClass(menu.el, 'up');
      menu.button('Play',  function() {
        menu.up();
        tuto.update();
        tuto.show();
      });
      menu.button('Help', function() {
        menu.down();
        help.show();
      });
      menu.button('Highscores', function() {
        menu.down();
        highscores.show();
      });
      menu.button('Extras', function() {
        menu.down();
        extras.show();
      });
    },
    extras: function () {
      extras = new Box('extras');
      addClass(extras.el, 'up');
      extras.button('Made for JS13K', function() {
        open('http://js13kgames.com', '_blank');
      });
      extras.button('Source Code', function() {
        open('http://github.com/rafaelcastrocouto/kfish', '_blank');
      });
      extras.button('Credits', function() {
        open('https://github.com/rafaelcastrocouto', '_blank');
      });
      extras.button('Back', function () {
        menu.show();
        extras.up();
      });
    },
    help: function () {
      help = new Box('help');
      addClass(help.el, 'up');
      help.text([
        '<p>Click to swim</p>',
        '<p>Double click to jump</p>',
        '<p>Dodge orange enemies</p>',
        '<p>Grab green speed bonus</p>',
        '<p>Red circles reverses</p>',
        '<p>Watch your breath</p>',
        '<p>Catch all little fishes!</p>'
      ]);
      help.button('Back', function () {
        menu.show();
        help.up();
      });
    },
    highscores: function () {
      highscores = new Box('high');
      addClass(highscores.el, 'up');
      highscores.data = [
        {name: 'Player1', points: 6, time: 10},
        {name: 'Player1', points: 5, time: 10},
        {name: 'Player1', points: 4, time: 10},
        {name: 'Player1', points: 3, time: 10},
        {name: 'Player1', points: 2, time: 10},
        {name: 'Player1', points: 1, time: 10},
        {name: 'Player1', points: 0, time: 10}
      ];
      score.load();
      score.build();
    },
    tuto: function () {
      var tutoText = [
        [
          '<p>Catch 3 fishes!</p>',
          '<p>Dodge orange<br>enemies</p>',
          '<p>Red circles reverses</p>'
        ],
        [
          '<p>Double click to jump</p>',
          '<p>Grab green<br>speed bonus</p>',
          '<p>Watch your breath</p>'
        ]
      ];
      tuto = new Box('tuto');
      addClass(tuto.el, 'up');
      tuto.update = function () {
        tuto.empty();
        tuto.text(tutoText[level.current] ||
                  '<p>Get ready!</p>');
        tuto.button('Ok', function () {
          tuto.up();
          delay(0.5, level.build);
        });
      };
      tuto.update();
    },
    win: function () {
      win = new Box('win');
      addClass(win.el, 'down');
    },
    over: function () {
      over = new Box('over');
      addClass(over.el, 'down');
      over.text('<h2>Game Over</h2>');
      over.score = document.createElement('p');
      over.score.textContent = 'Score: 0';
      over.el.appendChild(over.score);
      over.button('Try again', function () {
        over.up();
        delay(0.5, level.build);
      });
      over.button('Back', function () {
        over.up();
        menu.show();
        game.reset();
      });
    },
    bubbles: function () {
      for (var i = 0; i < 64; i++) {
        bubbles.push({
          x: ran(-5,width+5),
          y: ran(0,height+10),
          w: ran(2,10),
          s: ran(0.05, 0.3),
          r: ran(0, 50)
        });
      }
    },
    splash: function (x, y, jump) {
      var s, a, i, w = 3, l = 16;
      if (jump) {
        l = 20;
        w = 3.5;
      }
      for (i = 0; i < l; i++) {
        a = ran(0, Math.PI*2);
        s = ran(0.2, 0.5);
        splash.push({
          x: x,
          y: y,
          w: ran(w, w*2),
          s: s,
          sx: Math.sin(a) * s,
          sy: Math.cos(a) * s
        });
      }
    },
    audio: function () {
      if (window.AudioContext) {
        audio.load();
        game.audio = true;
        audio.el = document.createElement('a');
        addClass(audio.el, 'mute');
        audio.el.textContent = audio.mute ? audio.playStr : audio.muteStr;
        audio.el.addEventListener('click', audio.mute);
        resizefont.push(audio);
        ui.appendChild(audio.el);
        audio.context = new AudioContext();
        audio.gainNode = audio.context.createGain();
        audio.gainNode.connect(audio.context.destination);
        build.oscillator();
      }
    },
    oscillator: function () {
      audio.oscillator = audio.context.createOscillator();
      audio.oscillator.frequency.value = 0;
      audio.oscillator.detune.value = 0;
      audio.oscillator.type = 'sine';
      audio.oscillator.connect(audio.gainNode);
      audio.oscillator.start(0);
    },
    scores: function () {
      score.el = document.createElement('span');
      addClass(score.el, 'score');
      ui.appendChild(score.el);
      resizefont.push(score);
      breath.el = document.createElement('span');
      addClass(breath.el, 'shoalscore');
      ui.appendChild(breath.el);
      resizefont.push(breath);
    },
    sprite: function (w, h, pixels, colors) {
      var c = document.createElement('canvas'),
          t = c.getContext('2d'),
          i = 0;
      c.width = w; c.height = h;
      for(var y=0; y<h; y++) {
        for(var x=0; x<w; x++) {
          t.fillStyle = colors[Number(pixels[i])];
          t.fillRect(x,y,1,1);
          i++;
        }
      }
      return c;
    }
  };

  var Box = function (c) {
    this.el = document.createElement('div');
    addClass(this.el, 'box');
    addClass(this.el, c);
    ui.appendChild(this.el);
    boxes.push(this);
    resizefont.push(this);
  };
  Box.prototype.button = function (txt, cb) {
    var b = document.createElement('div');
    b.textContent = txt;
    addClass(b, 'button');
    b.addEventListener('click', function () {
      audio.play('game', D, 120);
      cb();
    });
    this.el.appendChild(b);
    return b;
  };
  Box.prototype.text = function (txt) {
    var inner = txt;
    if (txt instanceof Array) {
      inner = txt.join('');
    }
    this.el.innerHTML = inner;
  };
  Box.prototype.show = function () {
    delClass(this.el, 'up');
    delClass(this.el, 'down');
  };
  Box.prototype.up = function () {
    addClass(this.el, 'up');
  };
  Box.prototype.down = function () {
    addClass(this.el, 'down');
  };
  Box.prototype.empty = function () {
    while (this.el.firstChild) {
      this.el.removeChild(this.el.firstChild);
    }
  };

  var Unit = function (o) {
    this.x = o.x; this.y = o.y;
    this.px = o.x; this.py = o.y;
    this.dx = o.dx || false; this.dy = o.dy || false;
    this.w = o.w; this.h = o.h || o.w;
    this.s = o.s;
    this.r = o.r || o.w;
    if (o.rotate) {this.rotate = o.rotate;}
    units.push(this);
  };

  var Fish = function (o, thefish) {
    Unit.call(this, o);
    this.type = 'fish';
    this.img = o.img;
    if (thefish) {
      if(o.bonus) {
        this.bonus = o.bonus;
      }
      if(o.collide) {
        this.collide = o.collide;
      }
      if(o.jumping) {
        this.jumping = o.jumping;
      }
    }
    if (!thefish) {
      fishes.push(this);
    }
  };
  Fish.prototype.move = function (x, y, click) {
    if (click) {
      build.splash(this.x, this.y);
    }
    this.pdx = x;
    this.pdy = y;
    var dx = this.pdx - this.x,
        dy = this.pdy - this.y,
        a = Math.atan2(dy, dx);
    this.sx = Math.abs(this.s * Math.cos(a));
    this.sy = Math.abs(this.s * Math.sin(a));
    this.flip = (x < this.x);
  };
  Fish.prototype.jump = function (x, y, tf) {
    var d = Math.pow(Math.pow(this.x - x, 2)+Math.pow(this.y - y, 2),1/2);
    this.os = this.s;
    this.s = 10;
    thefish.jumping = true;
    thefish.collide = false;
    build.splash(x, y, true);
    this.tf = tf;
    delay(d/this.s * 0.02, function () {
      thefish.changeSpeed();
      thefish.jumping = false;
      thefish.collide = true;
      game.flash();
      this.move(x, y);
      this.s = this.os;
    }.bind(this));
    this.move(x, y);
  };
  Fish.prototype.addToShoal = function () {
    audio.play('shoal', F, 150);
    remove(fishes, this);
    shoal.push(this);
    this.img = sprites.shoal;
    this.move(thefish.x + ran(0, 4, true),
              thefish.y + ran(0, 4, true));
    this.rotate = ran(0.01, 0.04, true);
    score.update(2);
    game.flash();
  };
  Fish.prototype.changeSpeed = function () {
    thefish.s = breath.val/thefish.bonus;
  };

  var Power = function (o) {
    Unit.call(this, o);
    this.type = 'power';
    var dx = this.dx - this.x,
        dy = this.dy - this.y,
        a = Math.atan2(this.dy, this.dx);
    this.sx = Math.abs(this.s * Math.cos(a));
    this.sy = Math.abs(this.s * Math.sin(a));
    this.pdx = o.dx; this.pdy = o.dy;
    powers.push(this);
  };
  Power.prototype.power = function () {
    breath.val += 2;
    if (breath.val > 5) {
      breath.val = 5;
    }
    if (breath.val > 2) {
      breath.silence();
    }
    thefish.bonus *= 0.7;
    thefish.changeSpeed();
    game.bright = 1;
    delay(6, function () {
      game.bright = 0;
      thefish.bonus /= 0.7;
      thefish.changeSpeed();
    });
    remove(powers, this);
    remove(units, this);
    score.update(1);
    audio.play('power', A, 180);
  };

  var Reverse = function (o) {
    Unit.call(this, o);
    this.type = 'reverse';
    this.power = o.power;
    var dx = this.dx - this.x,
        dy = this.dy - this.y,
        a = Math.atan2(this.dy, this.dx);
    this.sx = Math.abs(this.s * Math.cos(a));
    this.sy = Math.abs(this.s * Math.sin(a));
    this.pdx = o.dx; this.pdy = o.dy;
    reverses.push(this);
  };
  Reverse.prototype.reverse = function () {
    audio.play('reverse', D*2, 150);
    reversed = !reversed;
    each(enemies, function (e) {
      if (reversed) {
        e.pdx = e.opx; e.pdy = e.opy;
        e.dx = e.ox; e.dy = e.oy;
      } else {
        e.pdx = e.opdx; e.pdy = e.opdy;
        e.dx = e.odx; e.dy = e.ody;
      }
      var dx = e.pdx - e.px,
          dy = e.pdy - e.py,
          a = Math.atan2(dy, dx);
      e.sx = Math.abs(e.s * Math.cos(a));
      e.sy = Math.abs(e.s * Math.sin(a));
      e.rotate *= -1;
    });
    each(bubbles, function (b) {
      b.s *= -1;
    });
    remove(reverses, this);
    remove(units, this);
    score.update(-1);
    breath.val -= 1;
    if (breath.val < 0) {
      breath.val = 0;
    }
    breath.color = '#f97';
    delay(0.3, function () {
      breath.color = 'white';
    });
    if (!game.alert) {
      game.alert = 1;
      delay(0.3, function () {
        game.alert = 0;
      });
    }
  };

  var click = function (e) {
    if (status === 'play') {
      var now = new Date(),
          doubleClick = (now - lastClick < 300),
          x = (e.layerX || e.changedTouches[0].layerX || (e.clientX - ui.offsetLeft)) / rw,
          y = (e.layerY || e.changedTouches[0].layerY || (e.clientY - ui.offsetTop)) / rh,
          f,
          n;
      lastClick = now;
      e.preventDefault();
      if (doubleClick && breath.val >= 2) {
        //game.flash();
        audio.play('click', G, 150);
        breath.val -= 1;
        thefish.collide = false;
        thefish.jump(x, y, true);
        for (f = 0; f < shoal.length; f++) {
          shoal[f].move(x + ran(1, 8, true),
                        y + ran(1, 8, true));
        }
      }
      if (!doubleClick && breath.val >= 2) {
        breath.val -= 1;
        thefish.changeSpeed();
      }
      if (!doubleClick && breath.val >= 3) {
        audio.play('click', C, 150);
      }
      if (!doubleClick) {
        thefish.move(x, y, true);
        for (f = 0; f < shoal.length; f++) {
          shoal[f].move(x + ran(0, 4, true),
                        y + ran(0, 4, true));
        }
      }
      if (breath.val <= 2) {
        breath.alert();
      }
    }
  };

  var delay = function (time, cb) {
    var f = function () {
      cb();
      remove(timeouts, this);
    };
    var t = setTimeout(f.bind(t), time * 1000);
    timeouts.push(t);
    return t;
  };

  var ran = function (min, max, sign) {
    var r = Math.random() * (max - min) + min;
    if (sign && Math.random() < 0.5) {
      r *= -1;
    }
    return r;
  };

  var each = function (array, cb) {
    var i = array.length;
    if (i > 500) { console.log('error'+i, array); }
    while(i--) { cb.call(array[i], array[i], i); }
  };

  var remove = function (array, item) {
    var index = array.indexOf(item);
    if (index > -1) {
      array.splice(index, 1);
    }
  };

  var addClass = function (el, classAdd) {
    if (el.className.search(classAdd) == -1) {
      if (el.className.length === 0) {
        el.className = classAdd;
      } else {
        el.className += ' ' + classAdd;
      }
    }
  };

  var delClass = function (el, classDel) {
    var classes = el.className.split(' ');
    each(classes, function (className) {
      if (className == classDel) {
        remove(classes, className);
      }
    });
    el.className = classes.join(' ');
  };

  var spawn = {
    fish: function () {
      if (status === 'play' && fishes.length < 5) {
        var offset = 8;
        var nx = ran(offset,width-offset),
            ny = ran(offset,height-offset);
        if (Math.abs(nx-thefish.x)<5*offset &&
            Math.abs(nx-thefish.x)<5*offset) {
          nx = ran(offset,width-offset);
          ny = ran(offset,height-offset);
        }
        var f = new Fish({
          x: ran(5,width-5),
          y: ran(5,height-5),
          s: ran(0.2, 0.3),
          w: 2.8,
          h: ran(1.6, 2.8),
          img: sprites.fish
        });
        if (level.current == 1) {
          f.x = ran(width/1.3, width-5);
        }
        f.rotate = ran(0.01, 0.03, true);
        f.flip = (Math.random() < 0.5);
        f.px = f.x + ran(1, 6, true);
        f.py = f.y + ran(1, 6, true);
      }
      if (status === 'play') {
        delay(3, spawn.fish);
      }
    },
    enemy: function (o) {
      each(o.unit, function (u) {
        var e = new Unit(u);
        e.type = 'enemy';
        e.s = o.s;
        e.x  = o.x  + (u.x  * o.f); e.y  = o.y  + (u.y  * o.f);
        e.px = o.x  + (o.px * o.f); e.py = o.y  + (o.py * o.f);
        if (o.r) {
          e.x -= e.px;
          e.y -= e.py;
          var cos = Math.cos(o.r),
              sin = Math.sin(o.r),
              rx = e.x * cos - e.y * sin,
              ry = e.x * sin + e.y * cos;
          e.x = rx + e.px;
          e.y = ry + e.py;
        }
        e.dx  = o.dx + (e.x  * o.f); e.dy  = o.dy + (e.y  * o.f);
        e.pdx = o.dx + (o.px * o.f); e.pdy = o.dy + (o.py * o.f);
        e.ox = e.x; e.oy = e.y;
        e.odx = e.dx; e.ody = e.dy;
        e.opx = e.px; e.opy = e.py;
        e.opdx = e.pdx; e.opdy = e.pdy;
        e.w = u.w * o.f; e.h = u.h * o.f || u.w * o.f;
        e.rotate = o.rotate;
        var dx = e.pdx - e.px,
            dy = e.pdy - e.py,
            a = Math.atan2(dy, dx);
        e.sx = Math.abs(e.s * Math.cos(a));
        e.sy = Math.abs(e.s * Math.sin(a));
        enemies.push(e);
      });
    },
    power: function () {
      each(powers, function (unit) {
        if(unit.y >= height) {
          remove(powers, unit);
          remove(units, unit);
          unit = null;
        }
      });
      if (status === 'play' && powers.length < 3) {
        var unit = new Power({
          x: ran(10, width-10), y: -10,
          w: 1.8, h: 1.8,
          s: ran(0.15, 0.25)
        });
        unit.stroke = 'white';
        if (level.current == 1) {
          unit.x = ran(width/1.3, width-5);
        }
      }
      if (status === 'play') {
        delay(4, spawn.power);
      }
    },
    reverse: function () {
      each(reverses, function (unit) {
        if(unit.y >= height) {
          remove(reverses, unit);
          remove(units, unit);
          unit = null;
        }
      });
      if (status === 'play' && reverses.length < 12) {
        var unit = new Reverse({
          x: ran(10, width-10), y: -10,
          w: 2.2, h: 2.2,
          s: ran(0.01, 0.5)
        });
        unit.stroke = 'white';
      }
      if (status === 'play') {
        delay(1.5, spawn.reverse);
      }
    }
  };

  var physic = function () {
    each(units, function (unit) {
      if (unit.rotate) {
        unit.x -= unit.px;
        unit.y -= unit.py;
        var cos = Math.cos(unit.rotate),
            sin = Math.sin(unit.rotate),
            rx = unit.x * cos - unit.y * sin,
            ry = unit.x * sin + unit.y * cos;
        unit.x = rx + unit.px;
        unit.y = ry + unit.py;
      }
      if (typeof unit.pdx === 'number') {
        if (unit.pdx > unit.px + unit.sx) {
          unit.px += unit.sx; unit.x += unit.sx;
        } else if (unit.pdx < unit.px - unit.sx) {
          unit.px -= unit.sx; unit.x -= unit.sx;
        } else {
          unit.pdx = false;
        }
      }
      if (typeof unit.pdy === 'number') {
        if (unit.pdy > unit.py + unit.sy) {
          unit.py += unit.sy; unit.y += unit.sy;
        } else if (unit.pdy < unit.py - unit.sy) {
          unit.py -= unit.sy; unit.y -= unit.sy;
        } else {
          unit.pdy = false;
        }
      }
    });
  };

  var crowd = function () {
    each(shoal, function (unit) {
      var d = 3;
      if (!thefish.pdx && !thefish.pdy) {
        if (Math.abs(unit.x - thefish.x > d) ||
            Math.abs(unit.y - thefish.y > d)) {
            unit.move(thefish.x, thefish.y);
        }
      }
    });
  };

  var collision = {
    check: function () {
      if (thefish.collide) {
        each(enemies, function colisionEnemies (unit) {
          if (collision.circ(thefish, unit)) { game.over(); }
        });
        each(reverses, function colisionReverses (unit) {
          if (collision.rect(thefish, unit)) { unit.reverse(); }
        });
      }
      each(powers, function colisionPowers (unit) {
        if (collision.rect(thefish, unit)) { unit.power(); }
      });
      each(fishes, function colisionFishes (unit) {
        if (collision.rect(thefish, unit)) { unit.addToShoal(); }
      });
    },
    rect: function (f, unit) {
      return (f.x - f.w/2 < unit.x + unit.w/2 &&
              f.x + f.w/2 > unit.x - unit.w/2 &&
              f.y - f.h/2 < unit.y + unit.h/2 &&
              f.y + f.h/2 > unit.y - unit.h/2);
    },
    circ: function (f, unit) {
      var dx = Math.pow(f.x - unit.x, 2),
          dy = Math.pow(f.y - unit.y, 2),
          h = Math.pow(dx + dy, 1/2),
          dr = (f.w + unit.w)/2;
      return (h < dr);
    }
  };

  var colors = {
    thefish: ['transparent','white','#9af','#28c','#268','#333'],
    fish: ['transparent','white','#ac9','#2c7','#382','#333'],
    shoal: ['transparent','white','#f9d','#a5e','#739','#333'],
    dead: ['transparent','white','#aaa','#888','#555','#333']
  };

  var sprites = {
    thefish: build.sprite(22,22,fishPixels,colors.thefish),
    shoal: build.sprite(22,22,fishPixels,colors.shoal),
    fish: build.sprite(22,22,fishPixels,colors.fish),
    dead: build.sprite(22,22,fishPixels,colors.dead)
  };

  var draw = {
    frame:  function () {
      ctx.clearRect(0,0,width * rw, height * rh);
      if (status == 'over') {
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
      } else if (game.alert) {
        ctx.fillStyle = 'rgba(240,150,220,0.2)';
      } else if (game.bright) {
         ctx.fillStyle = 'rgba(180,250,255,0.2)';
      } else {
        ctx.fillStyle = 'rgba(50,240,255,0.2)';
      }
      ctx.fillRect(0,0,width * rw, height * rh);
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      draw.bubbles();
      draw.splash();
      if (status === 'play' || status === 'win') {
        physic();
        crowd();
        collision.check();
      }
      draw.enemies();
      draw.breath();
      draw.powers();
      draw.reverses();
      each(fishes, draw.fish);
      if (thefish) { draw.fish.call(thefish); }
      each(shoal, draw.fish);
      requestAnimationFrame(draw.frame);
    },
    fish: function () {
      var x = (this.x - this.w/2) * rw,
          y = (this.y - this.h/2) * rh,
          w = this.w * rw,
          h = this.h * rh,
          img = this.img;
      if (status == 'over') {
        img = sprites.dead;
      }
      if (this.flip) {
        ctx.save();
        ctx.translate(this.w * rw, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(img, x * -1, y, w, h);
        ctx.restore();
      } else {
        ctx.drawImage(img, x, y, w, h);
      }
    },
    circle: function (unit) {
      ctx.beginPath();
      ctx.arc(
        unit.x * rw, unit.y * rh,
        unit.w/2 * rw,
        0, Math.PI*2
      );
      ctx.fill();
      if (unit.stroke) {
        ctx.lineWidth = unit.w/6 * rw;
        ctx.strokeStyle = unit.stroke;
        ctx.stroke();
      }
    },
    bubbles: function () {
      if (status != 'resize') {
        each(bubbles, function (bubble) {
          bubble.y -= bubble.s;
          bubble.x += Math.sin((bubble.y+bubble.r)/10)/20;
          if(bubble.y < -10) {
            bubble.y = height + bubble.w;
            bubble.x = ran(5,width-5);
          }
          if(bubble.y > height + 10) {
            bubble.y = -bubble.w;
            bubble.x = ran(5,width-5);
          }
        });
      }
      each(bubbles, draw.circle);
    },
    splash:  function () {
      if (status != 'resize') {
        each(splash, function (bubble) {
          bubble.x += bubble.sx;
          bubble.y += bubble.sy;
          bubble.w -= 0.1;
          if (bubble.w <= 0) {
            remove(splash, bubble);
            bubble = null;
          }
        });
      }
      each(splash, draw.circle);
    },
    enemies: function () {
      if (status == 'over') {
        ctx.fillStyle = '#bbb';
      } else if (audio.playing) {
        ctx.fillStyle = '#F80';
      } else {
        ctx.fillStyle = 'orange';
      }
      each(enemies, draw.circle);
    },
    powers: function () {
      if (status == 'over') {
        ctx.fillStyle = '#ccc';
      } else {
        ctx.fillStyle = 'limegreen';
      }
      if (status === 'play') {
        each(powers, function (unit) {
          unit.y += unit.s;
          unit.x += Math.sin((unit.y)/2)/15;
        });
      }
      each(powers, draw.circle);
    },
    reverses: function () {
      if (status == 'over') {
        ctx.fillStyle = '#bbb';
      } else {
        ctx.fillStyle = 'tomato';
      }
      if (status === 'play') {
        each(reverses, function (unit) {
        unit.y += unit.s;
        unit.x += Math.sin((unit.y)/2)/15;
      });
      }
      each(reverses, draw.circle);
    },
    breath: function () {
      if (status === 'play') {
        var i;
        ctx.beginPath();
        ctx.moveTo(
          (breath.x + breath.w/2) * rw,
          breath.y * rh);
        ctx.arc(
          breath.x * rw,
          breath.y * rh,
          breath.w/2 * rw,
          Math.PI, Math.PI*2
        );
        ctx.lineCap = 'round';
        ctx.lineWidth = 2 * rw;
        ctx.strokeStyle = breath.color;
        ctx.stroke();
        for (i = 0; i < breath.max; i++) {
          ctx.beginPath();
          ctx.moveTo(breath.x * rw, breath.y * rh);
          ctx.arc(
            breath.x * rw, breath.y * rh,
            breath.w/2 * rw,
            Math.PI + Math.PI * 1/5 * i,
            Math.PI + Math.PI * 1/5 * (i+1)
          );
          if (i < breath.val) {
            ctx.fillStyle = breath.colors[i];
          } else {
            ctx.fillStyle = 'rgba(155,155,155,0.3)';
          }
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(
          breath.x * rw, breath.y * rh,
          breath.w/4 * rw,
          0, Math.PI*2
        );
        ctx.fillStyle = breath.color;
        ctx.fill();
      }
    }
  };

  var enemy = {
    smallstar: [
      {x: 50, y: 50, w: 20},
      {x: 50, y: -3, w: 10},
      {x: 50, y: 12, w: 14},
      {x: 50, y: 30, w: 18},
      {x: 0,  y: 36, w: 10},
      {x: 14, y: 40, w: 14},
      {x: 30, y: 46, w: 18},
      {x:100, y: 36, w: 10},
      {x: 86, y: 40, w: 14},
      {x: 70, y: 46, w: 18},
      {x: 20, y:100, w: 10},
      {x: 28, y: 87, w: 14},
      {x: 38, y: 69, w: 18},
      {x: 80, y:100, w: 10},
      {x: 72, y: 87, w: 14},
      {x: 62, y: 69, w: 18}
    ],
    star: [
      {x: 50, y: 50, w: 10},
      {x: 50, y:  0, w: 5},
      {x: 55, y:  6, w: 5}, {x: 45, y:  6, w: 5},
      {x: 57, y: 14, w: 6}, {x: 43, y: 14, w: 6},
      {x: 58, y: 22, w: 7}, {x: 42, y: 22, w: 7},
      {x: 61, y: 31, w: 7}, {x: 39, y: 31, w: 7},
      {x:  0, y: 34, w: 5},
      {x:  2, y: 41, w: 5}, {x:  7, y: 33, w: 5},
      {x:  9, y: 46, w: 6}, {x: 14, y: 35, w: 6},
      {x: 16, y: 51, w: 7}, {x: 22, y: 36, w: 7},
      {x: 24, y: 56, w: 7}, {x: 31, y: 37, w: 7},
      {x:100, y: 34, w: 5},
      {x: 98, y: 41, w: 5}, {x: 93, y: 33, w: 5},
      {x: 91, y: 46, w: 6}, {x: 86, y: 35, w: 6},
      {x: 84, y: 51, w: 7}, {x: 78, y: 36, w: 7},
      {x: 76, y: 56, w: 7}, {x: 69, y: 37, w: 7},
      {x: 18, y:100, w: 5},
      {x: 17, y: 93, w: 5}, {x: 25, y: 99, w: 5},
      {x: 19, y: 85, w: 6}, {x: 33, y: 94, w: 6},
      {x: 21, y: 76, w: 7}, {x: 39, y: 87, w: 7},
      {x: 24, y: 66, w: 7}, {x: 44, y: 80, w: 7},
      {x: 82, y:100, w: 5},
      {x: 83, y: 93, w: 5}, {x: 75, y: 99, w: 5},
      {x: 81, y: 85, w: 6}, {x: 67, y: 94, w: 6},
      {x: 79, y: 76, w: 7}, {x: 61, y: 87, w: 7},
      {x: 76, y: 66, w: 7}, {x: 56, y: 80, w: 7},
      {x: 50, y: 72, w: 7}
    ],
    anchor: [
      {x:  0, y:  0, w: 6},
      {x: -5, y:  6, w: 7},{x:  8, y:  1, w: 6},
      {x: -5, y: 14, w: 7},{x: 14, y:  7, w: 6},
      {x:  2, y: 19, w: 6},{x: 14, y: 14, w: 6},
      {x: 10, y: 20, w: 6},
      {x: 15, y: 29, w: 10},
      {x: 20, y: 40, w: 9},
      {x: 10, y: 44, w: 8},{x: 30, y: 36, w: 8},
      {x: 25, y: 50, w: 9},
      {x: 30, y: 60, w: 8},
      {x: 35, y: 70, w: 7},
      {x: 40, y: 80, w: 8},
      {x: 45, y: 90, w: 8},
      {x: 51, y:102, w: 10},
      {x: 40, y:100, w: 8},{x: 56, y: 93, w: 7},
      {x: 31, y: 97, w: 7},{x: 60, y: 85, w: 6},
      {x: 23, y: 97, w: 6},{x: 65, y: 80, w: 5},
      {x: 16, y: 98, w: 5},{x: 70, y: 76, w: 5},
      {x:  8, y: 96, w: 7},{x: 73, y: 70, w: 6},
    ],
    shell: [
      {x:  0, y: 46, w: 5},{x:  6, y: 49, w: 5},{x: 12, y: 53, w: 6},{x: 18, y: 59, w: 7},{x: 20, y: 52, w: 5},
      {x:  6, y: 41, w: 6},
      {x: 13, y: 36, w: 7},
      {x: 21, y: 34, w: 7},
      {x: 29, y: 36, w: 7},
      {x: 37, y: 38, w: 7},
      {x: 46, y: 42, w: 8},{x: 36, y: 47, w: 8},{x: 28, y: 55, w: 8},{x: 25, y: 66, w: 8},
      {x: 55, y: 46, w: 7},{x: 46, y: 51, w: 7},{x: 39, y: 57, w: 7},{x: 36, y: 66, w: 7},
      {x: 63, y: 49, w: 6},{x: 56, y: 54, w: 6},{x: 50, y: 59, w: 6},{x: 46, y: 66, w: 6},
      {x: 71, y: 52, w: 6},{x: 63, y: 58, w: 6},{x: 58, y: 65, w: 6},
      {x: 78, y: 55, w: 5},{x: 72, y: 59, w: 5},{x: 68, y: 65, w: 5},
      {x: 84, y: 58, w: 5},{x: 78, y: 64, w: 5},
      {x: 85, y: 64, w: 4},
      {x: 90, y: 62, w: 4}
    ]
  };

  var level = {
    current: 0,
    build: function () {
      game.clear();
      thefish = new Fish({
        s: 0.5, //breath 5 / bonus 10
        x: width/2,
        y: height/2,
        w: 5,
        bonus: 10,
        collide: true,
        jumping: false,
        img: sprites.thefish
      }, true);
      if (level.lvls[level.current].enemies) {
        each(level.lvls[level.current].enemies, function (e) {
          if (e.t) {
            delay(e.t, spawn.enemy.bind(this, e));
          } else {
            spawn.enemy(e);
          }
        });
      }
      status = 'play';
      if (level.current >= 1) { spawn.power(); }
      spawn.reverse();
      delay(3, spawn.fish);
      score.start();
      breath.recover();
    },
    lvls: [
      {//0
        score: 3,
        enemies: [{
          f: 0.2,
          x:  30, y:  10,
          dx: 45, dy: 35,
          unit: enemy.smallstar,
          rotate: 0.015,
          px: 10, py: 50
        }, {
          f: 0.1,
          x:  70, y:  40,
          dx: 55, dy: 35,
          unit: enemy.smallstar,
          rotate: -0.03,
          px: 95, py: 50
        }]
      },
      {//1
        score: 3,
        enemies: [{
          s: 0.1,
          f: 0.2,
          x:  55, y:  0,
          dx: 45, dy: 0,
          unit: enemy.smallstar,
          rotate: -0.01,
          px: 50, py: 50
        }, {
          s: 0.2,
          f: 0.1,
          x:  65, y: 20,
          dx: 55, dy: 20,
          unit: enemy.smallstar,
          rotate: 0.02,
          px: 50, py: 50
        }, {
          s: 0.2,
          f: 0.18,
          x:  68, y: 30,
          dx: 58, dy: 30,
          unit: enemy.smallstar,
          rotate: -0.02,
          px: 50, py: 50
        }, {
          s: 0.1,
          f: 0.15,
          x:  67, y: 50,
          dx: 57, dy: 50,
          unit: enemy.smallstar,
          rotate: 0.01,
          px: 50, py: 50
        }, {
          s: 0.2,
          f: 0.1,
          x:  65, y: 65,
          dx: 55, dy: 65,
          unit: enemy.smallstar,
          rotate: -0.01,
          px: 50, py: 50
        }]
      },
      {//2
        score: 5,
        enemies: [{
          s: 0.2,
          f: 0.2,
          x:  -50,  y: 0,
          dx: 150, dy: 0,
          unit: enemy.shell,
          px: 50, py: 50
        }, {
          s: 0.25,
          f: 0.15,
          x:  150,  y: 20,
          dx: -50, dy: 20,
          unit: enemy.shell,
          r: Math.PI,
          px: 50, py: 50
        }, {
          s: 0.3,
          f: 0.25,
          x:  150,  y: 30,
          dx: -50, dy: 30,
          unit: enemy.shell,
          r: Math.PI,
          px: 50, py: 50
        }, {
          s: 0.25,
          f: 0.3,
          x:  -50, y:  40,
          dx: 150, dy: 40,
          unit: enemy.shell,
          px: 50, py: 50
        }, {
          s: 0.3,
          t: 5,
          f: 0.2,
          x:  -50, y:  60,
          dx: 150, dy: 60,
          unit: enemy.shell,
          px: 50, py: 50
        }]
      },
      {//3
        score: 10,
        enemies: [{
          s: 0.4,
          f: 0.2,
          x:  60, y:  -100,
          dx: 55, dy: 55,
          unit: enemy.anchor,
          px: 50, py: 50
        }, {
          s: 0.4,
          f: 0.3,
          x:  20, y:  45,
          dx: 25, dy: -100,
          unit: enemy.anchor,
          px: 50, py: 50
        },{
          t: 6,
          s: 0.4,
          f: 0.45,
          x:  70, y:  -100,
          dx: 75, dy: 30,
          unit: enemy.anchor,
          px: 50, py: 50
        },{
          t: 10,
          s: 0.4,
          f: 0.2,
          x:  0, y:  -100,
          dx: 0, dy: 45,
          unit: enemy.anchor,
          px: 50, py: 50
        }]
      },
      {//4
        score: 15,
        enemies: [{
          s: 0.4,
          f: 0.3,
          x:  20, y:  -100,
          dx: 25, dy: 45,
          unit: enemy.anchor,
          px: 50, py: 50
        }, {
          s: 0.2,
          f: 0.3,
          x:  -50, y:  10,
          dx: 85, dy: 60,
          unit: enemy.star,
          rotate: 0.01,
          px: 50, py: 50
        }, {
          t: 2,
          s: 0.5,
          f: 0.1,
          x:  120, y:  5,
          dx: 30, dy: 5,
          unit: enemy.smallstar,
          rotate: -0.01,
          px: 50, py: 50
        }, {
          t: 6,
          s: 0.4,
          f: 0.35,
          x:  60, y:  -100,
          dx: 65, dy: 40,
          unit: enemy.anchor,
          px: 50, py: 50
        }, {
          s: 0.1,
          f: 0.5,
          x:  -20, y: -10,
          dx: 150, dy: 70,
          unit: enemy.shell,
          px: 50, py: 50
        }]
      },
      {//5
        score: 20,
        enemies: [{
          s: 0.1,
          f: 1.4,
          x:  10, y:  0,
          dx: 100, dy: 60,
          unit: enemy.smallstar,
          rotate: -0.004,
          px: 50, py: 50
        }, {
          s: 0.15,
          f: 2,
          x:  -180, y:  -180,
          dx: -20, dy: -10,
          unit: enemy.star,
          rotate: -0.003,
          px: 50, py: 50
        }]
      }]
  };

  var breath = {
    x: 11,
    y: height - 1,
    w: 20,
    max: 5,
    val: 5,
    time: 1.2,
    color: 'white',
    colors: [
      'rgba(232, 98, 60, 0.8)',
      'rgba(232, 168, 60, 0.8)',
      'rgba(112, 198, 110, 0.8)',
      'rgba(32, 178, 170, 0.8)',
      'rgba(92, 148, 180, 0.8)'
    ],
    recover: function () {
      if (status === 'play') {
        if (breath.val < breath.max) {
          breath.val += 1;
          if (breath.val > 2) {
            breath.silence();
          }
          if (thefish.pdx && thefish.pdy) {
            thefish.move(thefish.pdx, thefish.pdy);
          }
        }
        if (!thefish.jumping) {
          thefish.changeSpeed();
        }
        delay(breath.time, breath.recover);
      }
    },
    reset: function () {
      breath.val = 5;
      breath.time = 1.2;
      breath.val = breath.max;
    },
    alert: function () {
      if (!audio.playing) {
        game.alert = 1;
        audio.playing = 1;
        audio.playSong();
      }
    },
    silence: function () {
      game.alert = 0;
      audio.playing = 0;
      clearTimeout(audio.t);
      audio.t = false;
      audio.play('song');
    }
  };

  var score = {
    val: 0,
    total: 0,
    totaltime: 0,
    start: function () {
      score.val = 0;
      score.el.textContent = score.val;
      score.begin = new Date();
      score.update();
    },
    stop: function () {
      score.end = new Date();
      var t = score.end - score.begin;
      score.time = t/1000;
      score.totaltime += score.time;
      score.total += score.val;
    },
    update: function (n) {
      if(status === 'play'){
        if (n) {
          score.val += n;
          if (score.val < 0) {
            score.val = 0;
          }
          score.el.textContent = score.val;
        }
        breath.el.textContent = shoal.length + '/' + level.lvls[level.current].score;
        if (shoal.length >= level.lvls[level.current].score) {
          //if (shoal.length >= 1) {
          game.win();
        }
      }
    },
    load: function () {
      if (window.localStorage) {
        var loaded = localStorage.getItem('kfish highscores');
        if (loaded) {
          highscores.data = JSON.parse(loaded);
        }
      }
    },
    save: function () {
      if (window.localStorage) {
        localStorage.setItem('kfish highscores', JSON.stringify(highscores.data));
      }
    },
    highscore: function (name, points, time) {
      highscores.data.push({name: name, points: points, time: time});
      highscores.data.sort(function (a, b) {
        return b.points - a.points;
      });
      highscores.data = highscores.data.slice(0,7);
      score.save();
      score.build();
    },
    build: function () {
      highscores.empty();
      var t = [];
      each(highscores.data, function (data) {
        t.push('<p>'+data.name+' ... '+data.points+' / '+data.time.toFixed(2)+' sec</p>');
      });
      t.reverse();
      highscores.text(t);
      highscores.button('Back', function () {
        menu.show();
        highscores.up();
      });
    }
  };

  var C  = 261.63;
  var Db = 277.18;
  var D  = 293.66;
  var Eb = 311.13;
  var E  = 329.63;
  var F  = 349.23;
  var Gb = 369.99;
  var G  = 392.00;
  var Ab = 415.30;
  var A  = 440.00;
  var Bb = 466.16;
  var B  = 493.88;

  var audio = {
    muteStr: 'Mute',
    playStr: 'Play',
    ms: 150,
    song: [B/2,4, E/2,4, B/2,4, E/2,4, B,2, Bb,2, B,2, Db*2,2, B,8],
    playSong: function () {
      if (game.audio) {
        audio.state = 0;
        audio.sing();
      }
    },
    sing: function () {
      if (game.audio) {
        audio.play('song', audio.song[audio.state]);
        var d = audio.song[audio.state + 1] * audio.ms;
        audio.t = setTimeout(audio.sing, d);
        if (audio.state < audio.song.length - 2) {
          audio.state += 2;
        } else {
          setTimeout(function () {
            audio.play('song');
          }, d/2);
          audio.state = 0;
        }
      }
    },
    play: function (name, note, t) {
      if (game.audio && !audio.muted) {
        var g = 1;
        if (note > 400) {g = 0.15;}
        audio.gainNode.gain.value = g;
        audio.oscillator.frequency.value = note || 0;
        if (t && !audio.t) {
          setTimeout(audio.play, t);
        }
      }
    },
    mute: function () {
      if (audio.muted) {
        audio.el.textContent = audio.muteStr;
        audio.muted = false;
      } else {
        audio.gainNode.gain.value = 0;
        audio.el.textContent = audio.playStr;
        audio.muted = true;
      }
      audio.save();
    },
    load: function () {
      if (window.localStorage) {
        var loaded = localStorage.getItem('kfish mute');
        if (loaded) {
          audio.muted = JSON.parse(loaded);
        }
      }
    },
    save: function () {
      if (window.localStorage) {
        localStorage.setItem('kfish mute', JSON.stringify(audio.muted));
      }
    },
  };

  game.start();

};

window.addEventListener('load', Game);
