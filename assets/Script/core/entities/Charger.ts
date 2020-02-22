import Enemy, { ZOMBIE_TYPE } from "./Enemy";
import { SCROLL_SPEED } from "../GroundScroll";

const { ccclass, property } = cc._decorator;

const CHARGER_Y_SPEED = -950;

@ccclass
export default class Charger extends Enemy {

    init() {
        this.zombieType = ZOMBIE_TYPE.CHARGER;
        this.ySpeed = CHARGER_Y_SPEED;
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
