import 'pixi';
import 'p2';
import Phaser from 'phaser';

var Platformer = Platformer || {};
var game = new Phaser.Game(1024, 768, Phaser.CANVAS);

var winner = null;

// Constants
var playerSpeed = 1500;
var playerMaxSpeed = 500;
var jumpSpeed = -700;
var drag = 600;
var gravity = 1850;

// Player Object
var Player = function(uniqueId, image) {
  this.uniqueId = uniqueId;
  this.imagePath = image;
  
  //some important variables
  this.facing = null;
  this.state = 'idle';
  this.canDoubleJump = false;
  
  // Set up controls
  this.keys = { left: '', right: '', up: '', down: '', attack: '' };
  if (uniqueId == 'player1') {
    this.facing = 'right';
    this.keys = {
      left: Phaser.Keyboard.A,
      up: Phaser.Keyboard.W,
      down: Phaser.Keyboard.S,
      right: Phaser.Keyboard.D,
      attack: Phaser.Keyboard.SPACEBAR
    };
    this.jumpKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
  } else if (uniqueId == 'player2') {
    this.facing = 'left';
    this.keys = {
      left: Phaser.Keyboard.LEFT,
      up: Phaser.Keyboard.UP,
      down: Phaser.Keyboard.DOWN,
      right: Phaser.Keyboard.RIGHT,
      attack: Phaser.Keyboard.CONTROL
    };
    this.jumpKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
  }
  

  console.log(this.uniqueId, this.imagePath);
  game.load.atlas('atlas_' + this.uniqueId, this.imagePath, '/img/Kraken.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
};

Player.prototype.create = function(x, y) {
    this.sprite = game.add.sprite(x, y, 'atlas_' + this.uniqueId);
    this.sprite.animations.add('attack', Phaser.Animation.generateFrameNames("attack_", 0, 7, '', 4), 24, true);
    this.sprite.animations.add('idle', Phaser.Animation.generateFrameNames("idle_", 0, 11, '', 4), 24, true);
    this.sprite.animations.add('walk', Phaser.Animation.generateFrameNames("walk_", 0, 17, '', 4), 24, true);
    this.sprite.animations.add('jump', Phaser.Animation.generateFrameNames("jump_", 8, 26, '', 4), 24, true);
    
    this.sprite.animations.play('idle', 24, true);
    
    game.physics.arcade.enable(this.sprite);
    this.sprite.anchor.setTo(0.5, 0.5); 
    this.sprite.body.maxVelocity.setTo(playerMaxSpeed, playerMaxSpeed * 2);
    this.sprite.body.drag.setTo(drag, 0);
    this.sprite.checkWorldBounds = true;
    this.sprite.events.onOutOfBounds.add(this.loser, this);
};

Player.prototype.loser = function() {
  if (this.uniqueId === 'player1') { 
    winner = 'player2'; 
  } else { 
    winner = 'player1';
  }
  game.state.start('end');
};

Player.prototype.setState = function(newState) {
  this.sprite.body.offset.setTo(0, 0);
  if (newState != this.state) {
    this.sprite.animations.play(newState, 24, true);
    this.state = newState;
    return true;
  }

  if (this.state === 'jump') {
    this.sprite.body.offset.setTo(0, 18);
  }
  
  this.state = newState;
  return false;
};

Player.prototype.upInputIsActive = function(duration) {
  var isActive = false;
  isActive = this.jumpKey.downDuration(duration);
  
  return isActive;
};

Player.prototype.update = function() {
  // --- Handle collisions
  game.physics.arcade.collide(this.sprite, game.platform);

  // --- HANDLE LEFT / RIGHT / IDLE --- 
  var onTheGround = this.sprite.body.touching.down;
  if (game.input.keyboard.isDown(this.keys.left)) {
    if (this.setState('walk')) {
      this.facing = 'left';
      this.sprite.body.acceleration.x = -playerSpeed;
      this.sprite.scale.x = -1;
    }
  } else if (game.input.keyboard.isDown(this.keys.right)) {
    if (this.setState('walk')) {
      this.facing = 'right';
      this.sprite.body.acceleration.x = playerSpeed;
      this.sprite.scale.x = 1;
    }
  //} else if (game.input.keyboard.isDown(this.keys.attack)) {
  //  if (this.setState('attack')) {
      //this.children[0].enable = true;
  //  }
  } else{
    if (onTheGround) {
      this.setState('idle');
    }
    this.sprite.body.acceleration.x = 0;
  }
    
    
  // --- HANDLE ALL OUR JUMPING LOGIC ---
  // Set a variable that is true when the player is touching the ground
  if (onTheGround) this.canDoubleJump = true;
  
  if (this.upInputIsActive(5)) {
    // Allow the player to adjust his jump height by holding the jump button
    if (this.canDoubleJump) this.canVariableJump = true;

    if (this.canDoubleJump || onTheGround) {
      this.setState('jump');
      // Jump when the player is touching the ground or they can double jump
      // this.sprite.body.velocity.y = jumpSpeed;

      // Disable ability to double jump if the player is jumping in the air
      if (!onTheGround) this.canDoubleJump = false;
    }
  }
  
  if (this.canVariableJump && this.upInputIsActive(150)) {
    this.setState('jump');
    this.sprite.body.velocity.y = jumpSpeed;
  }
  
  if (!this.upInputIsActive()) {
    this.canVariableJump = false;
  }
};

var splashState = {
  preload: function() {
    game.load.image('splash', '/img/Splash-Image.png');
    game.load.image('platform', '/img/Stage.png');
    game.load.image('platform-detail', '/img/Stage-Front.png');
    game.load.image('start-button', '/img/Start-Button.png');
  },
  
  create: function() {
    this.backgroundImage = game.add.sprite(0, 0, 'splash');
    game.platform = game.add.sprite(64, 672, 'platform');
    game.platformDetail = game.add.sprite(64, 662, 'platform-detail');
    
    this.button = game.add.button(game.world.centerX - 173, 475, 'start-button', this.startGame);
    game.input.keyboard.addKeyCapture([
      Phaser.Keyboard.SPACEBAR,
      Phaser.Keyboard.CONTROL
    ]);
  },
  
  update: function() {
    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || game.input.keyboard.isDown(Phaser.Keyboard.CONTROL)) {
      this.startGame();
    }
  },
  
  startGame: function() {
    game.state.start('game');
  }
};

var endState = {
  preload: function() {
    game.load.image('victory', '/img/Victory.png');
    game.load.image('restart-button', '/img/Restart-Button.png');
    
    var imagePath = null;
    if (winner === 'player1') {
      imagePath = '/img/Kraken_P1.png';
    } else {
      imagePath = '/img/Kraken_P2.png';
    }
    
    game.load.atlas('atlas_winner', imagePath, '/img/Kraken.json', Phaser.Loader.TEXTURE_ATLAS_JSON_HASH);
  },
  
  create: function() {
    this.victory = game.add.sprite(0,0, 'victory');
    
    this.sprite = game.add.sprite(game.world.centerX, game.world.centerY - 128, 'atlas_winner');
    this.sprite.anchor.setTo(0.5, 0.5); 
    this.sprite.scale.setTo(2, 2);
    this.sprite.animations.add('idle', Phaser.Animation.generateFrameNames("idle_", 0, 11, '', 4), 24, true);
    this.sprite.play('idle');
    
    this.button = game.add.button(game.world.centerX - 173, 565, 'restart-button', this.restartGame);
    
    game.input.keyboard.addKeyCapture([
      Phaser.Keyboard.SPACEBAR,
      Phaser.Keyboard.CONTROL
    ]);
  },
  
  update: function() {
     if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) || game.input.keyboard.isDown(Phaser.Keyboard.CONTROL)) {
       this.restartGame();
     }
  },
  
  restartGame: function() {
    game.state.start('game');
  }
};

var gameState = {
  preload: function() {
    game.load.image('platform', '/img/Stage.png');
    game.load.image('platform-detail', '/img/Stage-Front.png');
    this.player1 = new Player('player1', '/img/Kraken_P1.png');
    this.player2 = new Player('player2', '/img/Kraken_P2.png');
  },
  
  create: function() {
    game.renderer.renderSession.roundPixels = true;
    //game.stage.backgroundColor = '#0808aa';
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y = gravity;

  
    // Create the platform
    game.platform = game.add.sprite(64, 672, 'platform');
    this.player1.create(96, 160);
    this.player2.create(928, 160);
    game.platformDetail = game.add.sprite(64, 662, 'platform-detail');
    
    game.physics.arcade.enable(game.platform);
    game.platform.body.allowGravity = false;
    game.platform.body.immovable = true;
    
    game.input.keyboard.addKeyCapture([
      Phaser.Keyboard.LEFT,
      Phaser.Keyboard.RIGHT,
      Phaser.Keyboard.UP,
      Phaser.Keyboard.DOWN,
      Phaser.Keyboard.A,
      Phaser.Keyboard.W,
      Phaser.Keyboard.S,
      Phaser.Keyboard.D,
      Phaser.Keyboard.CONTROL,
      Phaser.Keyboard.SPACEBAR
    ]);
  },
  
  update: function() {
    this.player1.update();
    this.player2.update();
    game.physics.arcade.collide(this.player1.sprite, this.player2.sprite, null, null, this);
  },

  render: function() {
    if (debug) {
      game.debug.body(this.player1.sprite);
      game.debug.body(this.player2.sprite);
    }
  }
};

game.state.add('splash', splashState);
game.state.add('game', gameState);
game.state.add('end', endState);

// Add and start the 'main' state to start the game
game.state.start('splash');