import Enemy, { ZOMBIE_TYPE } from "./Enemy";
import { SCROLL_SPEED } from "../GroundScroll";

const { ccclass, property } = cc._decorator;

const CHARGER_Y_SPEED = -950;
const PATROLLER_X_SPEED = 250;

@ccclass
export default class Zombie extends Enemy {

    private rotateLeft: boolean = false;
    private rotateRight: boolean = false;

    init() {
        this.zombieType = this.zombieType = Math.random() < 0.6 ? ZOMBIE_TYPE.CHARGER : ZOMBIE_TYPE.PATROLLER;
        this.ySpeed = this.zombieType === ZOMBIE_TYPE.CHARGER ? CHARGER_Y_SPEED : -SCROLL_SPEED;
        this.xSpeed = this.zombieType === ZOMBIE_TYPE.CHARGER ? 0 : PATROLLER_X_SPEED;
        this.rotateLeft = false;
        this.rotateRight = false;
        this.node.angle = 0;
        super.init();
    }

    start() {

    }

    update(dt) {
        super.update(dt);
        if (!this.isAlive) {
            this.node.y -= SCROLL_SPEED * dt;
            return;
        }

        if (this.node.x <= this.leftBound * 0.9 && this.xSpeed < 0) {
            this.xSpeed = this.xSpeed * -1;
        }
        else if (this.node.x >= this.rightBound * 0.9 && this.xSpeed >= 0) {
            this.xSpeed = this.xSpeed * -1;
        }


        this.node.x += this.xSpeed * dt;
        this.node.y += this.ySpeed * dt;
        this.updateAngle();
    }

    updateAngle() {
        if (this.zombieType === ZOMBIE_TYPE.CHARGER) {
            return;
        }
        if (this.xSpeed > 0 && !this.rotateRight) {
            const angle = 90;
            const turnSpeed = 0.1;
            this.node.runAction(cc.rotateTo(turnSpeed, angle));
            this.rotateLeft = false;
            this.rotateRight = true;
        } else if (this.xSpeed <= 0 && !this.rotateLeft) {
            const angle = -90;
            const turnSpeed = 0.1;
            this.node.runAction(cc.rotateTo(turnSpeed, angle));
            this.rotateLeft = true;
            this.rotateRight = false;
        }
    }


    handleNotHardImpact(colliderNode: cc.Node): void {
        // Just kill this one, runs fast.
        this.killZombie();
    }
}
