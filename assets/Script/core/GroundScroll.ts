import { GameEvent } from "./Event";

const { ccclass, property } = cc._decorator;

export const SCROLL_SPEED = 180;

@ccclass
export default class GroundScroll extends cc.Component {

    private readonly lowBound: number = -2400;
    private readonly scrollSpeed: number = 180;

    private scrollAllowed = false;

    onLoad () {
        cc.systemEvent.on(GameEvent.SCROLL_ALLOWED, this.onScrollAllowed, this);
    }

    update(dt) {
        if (this.scrollAllowed) {
            this.node.setPosition(this.node.position.x, this.node.position.y - this.scrollSpeed * dt);
            if (this.node.getPosition().y <= this.lowBound - this.node.height) {
                this.node.setPosition(this.node.position.x, this.node.position.y + this.node.height * 3);
            }
        }
    }

    private onScrollAllowed() {
        this.scrollAllowed = true;
    }
}