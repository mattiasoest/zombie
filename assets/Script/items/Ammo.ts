import StaticItem from "./StaticItem";
import { GameEvent } from "../core/Event";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Ammo extends StaticItem {

    handleRemoval() {
        this.alive = false;
        cc.systemEvent.emit(GameEvent.AMMO_REMOVE, this.node, false);
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.name === 'Player') {
            this.alive = false;
            cc.systemEvent.emit(GameEvent.AMMO_REMOVE, this.node);
        }
    }
}
