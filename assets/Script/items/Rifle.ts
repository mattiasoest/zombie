import StaticItem from "./StaticItem";
import { GameEvent } from "../core/Event";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Rifle extends StaticItem {

    handleRemoval() {
        console.log('remved RIFLE');
        this.alive = false;
        cc.systemEvent.emit(GameEvent.RIFLE_REMOVE, this.node, false);
    }

    onBeginContact(contact, selfCollider, otherCollider) {
        if (otherCollider.node.name === 'Player') {
            console.log('picked up RIFLE');
            this.alive = false;
            cc.systemEvent.emit(GameEvent.RIFLE_REMOVE, this.node);
        }
    }
}
