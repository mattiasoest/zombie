import StageController from "../core/StageController";
import { GameEvent } from "../core/Event";
import { SCROLL_SPEED } from "../core/GroundScroll";

const TOTAL_HP = 6;

const X_ACCELERATION = 140;
const X_SPEED_CAP = 140;
const DAMP = 0.99;
const TANK_BULLET_SPEED = 720;
const FIRE_RATE = 1.9;

const { ccclass, property } = cc._decorator;

@ccclass
export default class Tank extends cc.Component {

    @property(cc.Sprite)
    mainSprite: cc.Sprite = null;

    @property(cc.Sprite)
    cannonSprite: cc.Sprite = null;

    @property(cc.Node)
    firingPosition: cc.Node = null;

    @property(cc.Sprite)
    shadowSprite: cc.Sprite = null;

    @property([cc.SpriteFrame])
    frames: Array<cc.SpriteFrame> = new Array(4);

    @property([cc.SpriteFrame])
    cannonFrames: Array<cc.SpriteFrame> = new Array(4);

    controller: StageController = null;
    
    private velVector = new cc.Vec2(0, 0)
    private xAcceleration: number = X_ACCELERATION;
    private applyForceLeft: boolean = false;

    private lowerBound: number = 0;
    private leftBound: number = 0;
    private rightBound: number = 0;

    private hitPoints: number = 0;
    private xSpeed = 0;
    private body: cc.RigidBody = null;
    private alive = true;
    private firingTimer = 0.7;

    onLoad() {
        cc.systemEvent.on(GameEvent.END_GAME, this.handleEndGame, this);
        this.velVector.y = -SCROLL_SPEED;
    }

    start() {
        this.node.zIndex = 7;
    }

    protected init() {
        this.body = this.node.getComponent(cc.RigidBody);
        this.lowerBound = -this.controller.getMainCanvas().height * 0.7;
        this.leftBound = -this.controller.getMainCanvas().width * 0.52;
        this.rightBound = this.controller.getMainCanvas().width * 0.52;

        this.generateRandomProps();
        this.body.enabledContactListener = true;
        this.shadowSprite.enabled = true;
        this.alive = true;
        this.applyForceLeft = Math.random() < 0.5;
    }

    update(dt) {
        if (this.alive) {
            this.adjustAim();
            this.updateMovement(dt);
            this.handleFiring(dt);

            if (this.shouldRecycle()) {
                this.alive = false;
                cc.systemEvent.emit(GameEvent.TANK_REMOVE, this.node);
            }
        }
    }

    updateMovement(dt: number) {
        // X-axis force bounds
        if (this.node.x <= this.leftBound * 0.86) {
            this.applyForceLeft = false;
        }
        else if (this.node.x >= this.rightBound * 0.86) {
            this.applyForceLeft = true;
        }
        // === X-AXIS ===
        if (this.applyForceLeft) {
            this.xSpeed -= this.xAcceleration * dt;
        } else {
            this.xSpeed += this.xAcceleration * dt;
        }

        if (Math.abs(this.xSpeed) > X_SPEED_CAP) {
            this.xSpeed = this.xSpeed > 0 ? X_SPEED_CAP : -X_SPEED_CAP;
        }
        this.velVector.x = this.xSpeed;
        this.body.linearVelocity = this.velVector;
    }

    hit() {
        if (this.alive) {
            this.hitPoints--;
            if (this.hitPoints > 0) {
                const hpDiff = TOTAL_HP - this.hitPoints;
                const cannonIndex = (this.cannonFrames.length - 1) - hpDiff
                this.cannonSprite.spriteFrame = this.cannonFrames[cannonIndex < 0 ? 0 : cannonIndex];
                if (this.hitPoints < 5) {
                    this.mainSprite.spriteFrame = this.frames[this.hitPoints - 1];
                }
            } else {
                this.body.enabledContactListener = false;
                this.shadowSprite.enabled = false;
                this.alive = false;

                Math.random() < 0.4
                ? cc.systemEvent.emit(GameEvent.RIFLE_SPAWN, this.node.position)
                : cc.systemEvent.emit(GameEvent.SHIELD_SPAWN, this.node.position);

                cc.systemEvent.emit(GameEvent.PLAY_EXPLOSION, this.node);
                cc.systemEvent.emit(GameEvent.TANK_REMOVE, this.node);
            }
        }
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        if (this.alive) {
            if (otherCollider.node.name === 'Vehicle') {
                otherCollider.getComponent('Vehicle').handleDeath();
            }
        }
    }

    private shouldRecycle() {
        return this.node.position.y < this.lowerBound;
    }

    private handleFiring(dt: number) {
        this.firingTimer -= dt;
        if (this.firingTimer <= 0 && this.node.y > 0 && Math.random() < 0.6) {
            const velVector = cc.v2(Math.sin((this.cannonSprite.node.angle + 90) / (180 / Math.PI)) * TANK_BULLET_SPEED,
                Math.cos((this.cannonSprite.node.angle + 90) / (180 / Math.PI)) * -TANK_BULLET_SPEED);

            cc.systemEvent.emit(GameEvent.BIG_SHOT_SPAWN, this.firingPosition, velVector, this.cannonSprite.node.angle);
            this.firingTimer = FIRE_RATE;
        }
    }

    private adjustAim() {
        if (this.node.y > this.controller.player.node.y) {
            this.cannonSprite.node.angle = this.getAngle();
        }
    }

    private generateRandomProps() {
        this.mainSprite.spriteFrame = this.frames[this.frames.length - 1];
        this.cannonSprite.spriteFrame = this.cannonFrames[this.frames.length - 1];
        this.hitPoints = TOTAL_HP;
    }

    private getAngle() {
        if (this.controller.isPlayerAlive() && this.node.position.y > this.controller.player.node.y) {
            let angle = Math.atan2(this.controller.player.node.y - this.node.y, this.controller.player.node.x - this.node.x) * 180 / Math.PI;
            return angle;
        }
        else {
            return 0;
        }
    }

    private handleEndGame() {
        this.alive = false;
        cc.systemEvent.emit(GameEvent.TANK_REMOVE, this.node);
    }
}
