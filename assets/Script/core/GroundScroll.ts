const { ccclass, property } = cc._decorator;

@ccclass
export default class GroundScrollScroll extends cc.Component {

    private readonly lowBound: number = -2400;
    private readonly scrollSpeed: number = 250;

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