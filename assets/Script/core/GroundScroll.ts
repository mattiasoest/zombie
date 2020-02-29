const { ccclass, property } = cc._decorator;

export const SCROLL_SPEED = 180;

@ccclass
export default class GroundScroll extends cc.Component {

    private readonly lowBound: number = -2400;
    private readonly scrollSpeed: number = 180;

    // onLoad () {}

    // start () {
    // }

    update(dt) {
        this.node.setPosition(this.node.position.x, this.node.position.y - this.scrollSpeed * dt);
        if (this.node.getPosition().y <= this.lowBound - this.node.height) {
            this.node.setPosition(this.node.position.x, this.node.position.y + this.node.height * 3);
        }

    }
}