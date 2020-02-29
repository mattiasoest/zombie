import StaticItem from "./StaticItem";
import { GameEvent } from "../core/Event";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Cash extends StaticItem {

    // update (dt) {}


    handleRemoval() {
        this.alive = false;
        cc.systemEvent.emit(GameEvent.CASH_REMOVE, this.node, false);
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.name === 'Player') {
            cc.systemEvent.emit(GameEvent.CASH_REMOVE, this.node);
        }
    }
}
