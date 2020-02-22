import Enemy, { ZOMBIE_TYPE } from "./Enemy";
import { SCROLL_SPEED } from "../GroundScroll";

const { ccclass, property } = cc._decorator;

const CHARGER_Y_SPEED = -950;
const PATROLLER_X_SPEED = 30;
const PATROLLER = -950;

@ccclass
export default class Zombie extends Enemy {

    init() {
        this.zombieType = this.zombieType = Math.random() < 0.5 ? ZOMBIE_TYPE.CHARGER : ZOMBIE_TYPE.PATROLLER;
        this.ySpeed = this.zombieType === ZOMBIE_TYPE.CHARGER ? CHARGER_Y_SPEED : SCROLL_SPEED;
        this.xSpeed = this.zombieType === ZOMBIE_TYPE.CHARGER ? 0 : PATROLLER_X_SPEED;
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

        this.node.y += this.ySpeed * dt;
    }


    handleNotHardImpact(colliderNode: cc.Node): void {
        // Just kill this one, runs fast.
        this.killZombie();
    }
}
