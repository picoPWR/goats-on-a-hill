function maxSpeedEnforcement(speed, maxSpeed) {
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
}

function Goat(game, playerNumber, controls, sprite) {
    this.playerNumber = playerNumber;
    this.controls = controls;

    // Control keys:
    this.jumpKey = false;
    this.leftKey = false;
    this.rightKey = false;

    // Game physics:
    this.ground = 480; // changed value from 400
    this.x = 0;
    this.y = this.ground;
    this.width = 96;
    this.height = 95;
    this.lastY = this.y; // TODO: to be used for animation drawing calculations when jumping btwn platforms
    this.velocity = {x: 0, y: 0};
    this.speed = 5;
    this.jumpHeight = 100;
    this.platform = null;
    this.scale = 0.65;

    this.trim = {top: 50, bottom: 50, left: 50, right: 50};

    // Platforms
    this.platform = game.platforms[0]; // Ground platform to start

    // TODO: took out idle animation and status boolean b/c standing anim and bool serves that purpose already

    // Assign assets for Animations:
    var leftAsset = ASSET_MANAGER.getAsset("./img/" + sprite + "-left.png");
    var rightAsset = ASSET_MANAGER.getAsset("./img/" + sprite + "-right.png");

    // Animations:

    this.standLeftAnimation     = new Animation(leftAsset, 0, 0, 94, 90, 0.1, 4, false, false);
    this.standRightAnimation    = new Animation(rightAsset, 0, 0, 94, 90, 0.1, 4, true, false);

    this.runLeftAnimation       = new Animation(leftAsset, 376, 0, 94, 90, 0.1, 4, true, false);
    this.runRightAnimation      = new Animation(rightAsset, 376, 0, 94, 90, 0.1, 4, true, false);

    this.skidLeftAnimation      = new Animation(leftAsset, 752, 0, 94, 90, 0.1, 4, true, false);
    this.skidRightAnimation     = new Animation(rightAsset, 752, 0, 94, 90, 0.1, 4, true, false);

    this.jumpLeftAnimation      = new Animation(leftAsset, 846, 0, 94, 90, 0.1, 4, true, false);
    this.jumpRightAnimation     = new Animation(rightAsset, 846, 0, 94, 90, 0.1, 4, true, false);

    this.fallLeftAnimation      = new Animation(leftAsset, 1222, 0, 94, 90, 0.1, 4, true, false);
    this.fallRightAnimation     = new Animation(leftAsset, 1222, 0, 94, 90, 0.1, 4, true, false);

    this.landLeftAnimation      = new Animation(leftAsset, 1504, 0, 94, 90, 0.1, 4, true, false);
    this.landRightAnimation     = new Animation(leftAsset, 1504, 0, 94, 90, 0.1, 4, true, false);

    this.leftChargeAnimation    = new Animation(leftAsset, 1880, 0, 94, 90, 0.1, 4, true, false);
    this.rightChargeAnimation   = new Animation(leftAsset, 1880, 0, 94, 90, 0.1, 4, true, false);

    this.leftAttackAnimation    = new Animation(leftAsset, 1974, 0, 94, 90, 0.1, 4, true, false);
    this.rightAttackAnimation   = new Animation(leftAsset, 1974, 0, 94, 90, 0.1, 4, true, false);

    this.leftHurtAnimation      = new Animation(leftAsset, 2068, 0, 94, 90, 0.1, 4, true, false);
    this.rightHurtAnimation     = new Animation(leftAsset, 2068, 0, 94, 90, 0.1, 4, true, false);

    this.leftStunnedAnimation   = new Animation(leftAsset, 2538, 0, 94, 90, 0.1, 4, true, false);
    this.rightStunnedAnimation  = new Animation(leftAsset, 2538, 0, 94, 90, 0.1, 4, true, false);


    this.crownAnimation = new Animation(ASSET_MANAGER.getAsset("./img/smallest-king-crown.png"), 0, 0, 40, 32, 0.1, 1, true, false);

    // Audio:
    this.soundFX = new Howl({
        autoplay: false,
        urls: ['./audio/goat_sfx.wav'],
        sprite: {
            jump: [0, 154],
            land: [154, 143]
        }
    });

    // Action states
    this.right = true; // Facing right (true) or left (false)
    this.standing = true;
    this.jumping = false;
    this.falling = false;
    this.running = false;
    this.charging = false;
    this.attacking = false;
    this.stunned = false;
    this.king = false;

    //this.boundingBox = new BoundingBox(this.x + 25, this.y, this.standAnimation.frameWidth - 40, this.standAnimation.frameHeight - 20);

    // Game engine stuff:
    //this.game = game;
    //this.ctx = game.ctx;

    Entity.call(this, game, 0, this.y, this.width, this.height);
}

Goat.prototype = new Entity();
Goat.prototype.constructor = Goat;

Goat.prototype.reset = function () {
    this.right = true;
    this.standing = true;
    this.jumping = false;
    this.falling = false;
    this.running = false;
    this.charging = false;
    this.attacking = false;
    this.stunned = false;

    this.x = 0;
    this.y = this.ground;

    this.platform = this.game.platforms[0];

    //this.boundingbox = new BoundingBox(this.x, this.y, this.standAnimation.frameWidth, this.standAnimation.frameHeight);
};

// Based off of Chris Marriott's Unicorn's update method: https://github.com/algorithm0r/GamesProject/blob/Unicorn/game.js
Goat.prototype.update = function () {

    // Update goat's velocities if it's on a platform
    if (this.platform) {
        this.x += this.platform.velocity.x;
        this.y += this.platform.velocity.y;
    }

    // Update goat's facing direction (LEFT or RIGHT)
    if (this.rightKey) {
        this.right = true;
    } else if (this.leftKey) {
        this.right = false;
    }

    // Just to place a crown manually on top of player 1's goat.
    if (this.playerNumber === 0)
        this.king = this.game.kKey;

    // The goat begins a JUMP:
    if (this.jumpKey && !this.jumping && !this.falling) {
        this.jumping = true;
        this.soundFX.play('jump');
        console.log("Jumped");
        this.base = this.y; // Keep track of the goat's last bottom-y value
    }

    // WHILE the goat is JUMPING:
    if (this.jumping) {
        // Figure out which jump animation (left or right) to use
        var jumpAscendAnimation = this.right ? this.jumpRightAnimation : this.jumpLeftAnimation;

        var duration = jumpAscendAnimation.elapsedTime + this.game.clockTick;
        if (duration > jumpAscendAnimation.totalTime / 2) duration = jumpAscendAnimation.totalTime - duration;
        duration = duration / jumpAscendAnimation.totalTime;

        // quadratic jump
        var height = (4 * duration - 4 * duration * duration) * this.jumpHeight;
        this.lastY = this.boundingBox.bottom;
        this.y = this.base - height;
        this.boundingBox = new BoundingBox(this.x, this.y, jumpAscendAnimation.frameWidth * this.scale, jumpAscendAnimation.frameHeight * this.scale);

        var idx;
        for (idx = 0; idx < this.game.platforms.length; idx++) {
            var pf = this.game.platforms[idx];
            if (this.boundingBox.collide(pf.boundingBox) && this.lastY < pf.boundingBox.top) {
                console.log("JUMPING COLLISION WITH " + pf);
                this.jumping = false;
                this.soundFX.play('land');
                this.y = pf.boundingBox.top - jumpAscendAnimation.frameHeight * this.scale;
                this.platform = pf;
                jumpAscendAnimation.elapsedTime = 0;
            }
        }

        // Goat ON TOP of another goat
        for (var i = 0; i < this.game.goats.length; i++) {
            var goat = this.game.goats[i];
            if (goat != this && this.boundingBox.collide(goat.boundingBox) && this.lastY < goat.boundingBox.top) {
                console.log("ON TOP OF GOAT");
                this.jumping = false;
                this.y = goat.boundingBox.top - jumpAscendAnimation.frameHeight * this.scale;
                this.platform = goat;
                jumpAscendAnimation.elapsedTime = 0;
            }
        }
    }

    // While the goat is FALLING:
    if (this.falling) {
        // Figure out which falling animation (left or right) to use
        var jumpDescendAnimation = this.right ? this.fallRightAnimation : this.fallLeftAnimation;

        this.lastY = this.boundingBox.bottom;
        this.y += this.game.clockTick / jumpDescendAnimation.totalTime * 4 * this.jumpHeight;
        this.boundingBox = new BoundingBox(this.x, this.y, jumpDescendAnimation.frameWidth * this.scale, jumpDescendAnimation.frameHeight * this.scale);

        for (var i = 0; i < this.game.platforms.length; i++) {
            var pf = this.game.platforms[i];
            if (this.boundingBox.collide(pf.boundingBox) && this.lastY < pf.boundingBox.top) {
                console.log("LANDING COLLISION WITH " + pf);
                this.falling = false;
                this.soundFX.play('land');
                this.y = pf.boundingBox.top - jumpDescendAnimation.frameHeight * this.scale;
                this.platform = pf;
                jumpDescendAnimation.elapsedTime = 0;
            }
        }
    }

    // Handles when dropping off of platforms triggers falling animation
    if (!this.jumping && !this.falling) {
        var standingAnimation = this.right ? this.standRightAnimation : this.standLeftAnimation;
        this.boundingBox = new BoundingBox(this.x, this.y, standingAnimation.frameWidth * this.scale, standingAnimation.frameHeight * this.scale);
        if (this.boundingBox.left > this.platform.boundingBox.right) this.falling = true;
        if (this.boundingBox.right < this.platform.boundingBox.left) this.falling = true;
    }

    // Update running state:
    this.rightKey || this.leftKey ? this.running = true : this.running = false;

    // Running and boundary collisions:
    if (this.rightKey && this.x < this.game.surfaceWidth - this.width) this.x += this.speed;
    if (this.leftKey && this.x > 0) this.x -= this.speed;

    // Handles keeping goat above the ground if it's falling down
    if (this.y > this.ground) this.y = this.ground;
    Entity.prototype.update.call(this);
};

Goat.prototype.draw = function (ctx) {

    // For drawing CROWN:
    if (this.king) {
        if (this.right) { // drawn crown above right-turned head
            this.crownAnimation.drawFrame(this.game.clockTick, ctx, this.x + this.scale * 42, this.y - this.scale * 20, this.scale);
        } else { // draw crown above left-turned head
            this.crownAnimation.drawFrame(this.game.clockTick, ctx, this.x + this.scale * 13, this.y - this.scale * 20, this.scale);
        }
    }

    if (this.jumping) {
        if (this.right)
            this.jumpRightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        else
            this.jumpLeftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    } else if (this.running) {
        if (this.right)
            this.runRightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        else
            this.runLeftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);

    } else {
        if (this.right)
            this.standRightAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
        else
            this.standLeftAnimation.drawFrame(this.game.clockTick, ctx, this.x, this.y, this.scale);
    }

    Entity.prototype.draw.call(this, ctx);
};

Goat.prototype.toString = function () {
    return 'Goat ' + this.playerNumber;
};
