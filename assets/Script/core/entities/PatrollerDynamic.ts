import Enemy from "./Enemy";
import { SCROLL_SPEED } from "../GroundScroll";

const { ccclass, property } = cc._decorator;

const X_ACCELERATION = 1300;
const X_SPEED = 300;
const Y_SPEED = -460;
const DAMP = 0.95;
const DEATH_DAMP = 0.88;

enum DYNAMIC_TYPE {
    HALF,
    FULL,
}

@ccclass
export default class PatrollerDynamic extends Enemy {


    private applyForceLeft: boolean = false;
    private rotateLeft: boolean = false;
    private rotateRight: boolean = false;

    private xAcceleration: number = X_ACCELERATION;

    private patrollerType: DYNAMIC_TYPE = null;

    private slowSpeed = false;
    private slowSpeedtimer: number = 0.4;

    private stuckContactCount = 0;

    private lastColliderNode: cc.Node = null;

    private angleTimer = 0.7;


    init() {
        this.stuckContactCount = 0;
        this.patrollerType = Math.random() < 0.5 ? DYNAMIC_TYPE.HALF : DYNAMIC_TYPE.FULL;
        if (this.patrollerType === DYNAMIC_TYPE.FULL) {
            this.ySpeed = Y_SPEED * 0.5;
            super.init();
        } else {
            this.ySpeed = Y_SPEED;
            const halfWidth = this.controller.getMainCanvas().width * 0.5;
            const leftSide = Math.random() < 0.5;
            leftSide ? super.init(-halfWidth, -20) : super.init(20, halfWidth);
        }

        this.applyForceLeft = this.getComponent(cc.RigidBody).linearVelocity.x < 0 ? false : true;
    }

    update(dt) {
        super.update(dt);
        this.updateMovement(dt)
        this.updateAngle();
        // this.angleTimer -= dt;
        // if (this.angleTimer < 0) {
        // this.node.angle = super.getAngle();
        // this.angleTimer = 0.7;
        // }
    }

    updateAngle() {
        if (this.xSpeed > 0 && !this.rotateRight) {
            this.node.runAction(cc.rotateTo(0.45, 16));
            this.rotateLeft = false;
            this.rotateRight = true;
        } else if (this.xSpeed <= 0 && !this.rotateLeft) {
            this.node.runAction(cc.rotateTo(0.45, -16));
            this.rotateLeft = true;
            this.rotateRight = false;
        }
    }

    updateMovement(dt: number) {
        if (!this.isAlive) {
            this.node.y -= SCROLL_SPEED * dt;
            this.node.x += this.xSpeed * dt;
            this.xSpeed *= DEATH_DAMP;
            return;
        }

        // X-axis force bounds
        if (this.node.x <= this.leftBound * 0.9) {
            this.applyForceLeft = false;
        }
        else if (this.node.x >= this.rightBound * 0.9) {
            this.applyForceLeft = true;
        }
        // === X-AXIS ===
        if (this.applyForceLeft) {
            this.xSpeed -= this.xAcceleration * dt;
        } else {
            this.xSpeed += this.xAcceleration * dt;
        }

        if (this.slowSpeed) {
            this.slowSpeedtimer -= dt;
            this.node.y += -(SCROLL_SPEED - 80 * this.stuckContactCount) * dt;
            if (this.slowSpeedtimer <= 0) {
                this.slowSpeed = false;
            }
        } else {
            this.node.y += this.ySpeed * dt;
        }
        this.node.x += this.xSpeed * dt;
        this.xSpeed *= DAMP;
    }

    handleNotHardImpact(colliderNode: cc.Node): void {
        // Reference comparison
        if (this.lastColliderNode != null && colliderNode !== this.lastColliderNode) {
            if (this.stuckContactCount > 2) {
                super.killZombie();
                return;
            } else {
                this.stuckContactCount = 0;
            }
        } else {
            if (this.stuckContactCount > 1) {
                super.killZombie();
                return;
            }
        }
        this.lastColliderNode = colliderNode;

        this.stuckContactCount++;
        // Reverse movement and cap to scroll speed to look like we stopped.
        this.xSpeed = 0;
        this.applyForceLeft = !this.applyForceLeft;
        this.slowSpeed = true;
        this.slowSpeedtimer = 0.4 + (this.stuckContactCount * 0.07);

        // GIVE THEM FULL WIDTH TO FIND A WAY OUT
        this.patrollerType = DYNAMIC_TYPE.FULL;
        super.setDefaultBounds();

    }
}
