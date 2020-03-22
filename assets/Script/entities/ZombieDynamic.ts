import Enemy, { ZOMBIE_TYPE } from "./Enemy";
import { SCROLL_SPEED } from "../core/GroundScroll";

const { ccclass, property } = cc._decorator;

// const X_ACCELERATION = 1300;
const X_ACCELERATION = 800;
const X_SPEED_CAP = 300;
const X_SPEED = 300;
const Y_SPEED = -460;
const DAMP = 0.95;
const DEATH_DAMP = 0.88;

@ccclass
export default class ZombieDynamic extends Enemy {


    leftSide = false;

    private rotateLeft: boolean = false;
    private rotateRight: boolean = false;

    private xAcceleration: number = X_ACCELERATION;

    private slowSpeed = false;
    private slowSpeedtimer: number = 0.4;

    private stuckContactCount = 0;

    private lastColliderNode: cc.Node = null;

    private angleTimer = 0.7;


    init() {
        this.rotateLeft = false;
        this.rotateRight = false;
        this.leftSide = false;
        this.stuckContactCount = 0;
        this.slowSpeed = false;
        this.zombieType = Math.random() < 0.5 ? ZOMBIE_TYPE.PATROLLER_DYN_HALF : ZOMBIE_TYPE.PATROLLER_DYN_FULL;
        if (this.zombieType === ZOMBIE_TYPE.PATROLLER_DYN_FULL) {
            this.ySpeed = Y_SPEED * 0.5;
            super.init();
        } else {
            this.ySpeed = Y_SPEED;
            const halfWidth = this.controller.getMainCanvas().width * 0.5;
            this.leftSide = Math.random() < 0.5;
            this.leftSide ? super.init(-halfWidth, -20) : super.init(20, halfWidth);
        }

        this.xSpeed = Math.random() < 0.5 ? X_SPEED_CAP * -1 : X_SPEED_CAP;
        this.velVector.x = this.xSpeed;
        this.velVector.y = this.ySpeed;
        this.body.linearVelocity = this.velVector;
    }

    update(dt) {
        super.update(dt);
        this.updateMovement(dt)
        if (this.isAlive) {
            this.updateAngle();
            // this.angleTimer -= dt;
            // if (this.angleTimer < 0) {
            // this.node.angle = super.getAngle();
            // this.angleTimer = 0.7;
            // }
        }
    }

    updateAngle() {
        if (this.xSpeed > 0 && !this.rotateRight) {
            const angle = this.zombieType === ZOMBIE_TYPE.PATROLLER_DYN_FULL ? 75 : 35;
            const turnSpeed = this.zombieType === ZOMBIE_TYPE.PATROLLER_DYN_FULL ? 0.3 : 0.1;
            this.node.runAction(cc.rotateTo(turnSpeed, angle));
            this.rotateLeft = false;
            this.rotateRight = true;
        } else if (this.xSpeed <= 0 && !this.rotateLeft) {
            const angle = this.zombieType === ZOMBIE_TYPE.PATROLLER_DYN_FULL ? 75 : 35;
            const turnSpeed = this.zombieType === ZOMBIE_TYPE.PATROLLER_DYN_FULL ? 0.3 : 0.1;
            this.node.runAction(cc.rotateTo(turnSpeed, -angle));
            this.rotateLeft = true;
            this.rotateRight = false;
        }
    }

    updateMovement(dt: number) {
        if (!this.isAlive) {
            // this.node.y -= SCROLL_SPEED * dt;
            // this.node.x += this.xSpeed * dt;
            // this.xSpeed *= DEATH_DAMP;
            this.velVector.x *= DEATH_DAMP * dt;
            this.velVector.y = -SCROLL_SPEED;
            this.body.linearVelocity = this.velVector;
            return;
        }

        // X-axis force bounds
        if (this.node.x <= this.leftBound * 0.8 && this.xSpeed < X_SPEED_CAP) {
            this.xSpeed += this.xAcceleration * dt;
        }
        else if (this.node.x >= this.rightBound * 0.8 && this.xSpeed > -X_SPEED_CAP) {
            this.xSpeed -= this.xAcceleration * dt;

        } else {
            // this.xSpeed = this.xSpeed < 0 ? -X_SPEED_CAP : X_SPEED_CAP;
        }


        if (this.slowSpeed) {
            this.slowSpeedtimer -= dt;
            // this.node.y += -(SCROLL_SPEED - 80 * this.stuckContactCount) * dt;
            this.velVector.y = -(SCROLL_SPEED - 80 * this.stuckContactCount);
            // this.body.linearVelocity = new cc.Vec2(this.xSpeed * dt * DAMP, -(SCROLL_SPEED - 80 * this.stuckContactCount));
            if (this.slowSpeedtimer <= 0) {
                this.slowSpeed = false;
            }
        } else {
            // this.node.y += this.ySpeed * dt;
            this.velVector.y = this.ySpeed;
        }
        // this.velVector.x = this.xSpeed * DAMP;
        this.velVector.x = this.xSpeed;
        this.body.linearVelocity = this.velVector;
        // this.node.x += this.xSpeed * dt;
        // this.xSpeed *= DAMP;
    }

    handleNotHardImpact(colliderNode: cc.Node): void {
        // Reference comparison
        if (this.lastColliderNode != null && colliderNode !== this.lastColliderNode) {
            if (this.stuckContactCount > 2) {
                super.killZombie(false);
                return;
            } else {
                this.stuckContactCount = 0;
            }
        } else {
            if (this.stuckContactCount > 1) {
                super.killZombie(false);
                return;
            }
        }
        this.lastColliderNode = colliderNode;

        this.stuckContactCount++;
        // Reverse movement and cap to scroll speed to look like we stopped.
        this.xSpeed *= -1;
        this.slowSpeed = true;
        this.slowSpeedtimer = 0.4 + (this.stuckContactCount * 0.07);

        // GIVE THEM FULL WIDTH TO FIND A WAY OUT
        this.zombieType = ZOMBIE_TYPE.PATROLLER_DYN_FULL;
        super.setDefaultBounds();
    }
}
